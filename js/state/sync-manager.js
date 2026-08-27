/**
 * Sync Manager — PCMB Interactive CET
 *
 * Orchestrates offline-first persistence:
 *   1. Writes always succeed locally first (via StorageManager).
 *   2. Cloud sync is attempted immediately after for important events.
 *   3. On failure, the write is queued for retry.
 *   4. When the network returns, the pending queue is flushed.
 *
 * The student never loses progress due to a temporary network error.
 *
 * Public API:
 *   SyncManager.init(userId)          — start the sync manager for a user
 *   SyncManager.destroy()             — stop listeners, clear state
 *   SyncManager.syncConceptStudied(conceptKey, subjectId, chapterId)
 *   SyncManager.syncQuestionAttempt(attemptData)
 *   SyncManager.syncTestResult(testResult)
 *   SyncManager.syncBookmark(itemId, itemType, bookmarked)
 *   SyncManager.syncNow()             — manual flush of pending queue
 */

import { StorageManager } from "./storage.js";
import { CloudStorage } from "./cloud-storage.js";
import { Bus } from "./store.js";
import { isConfigured } from "../auth/supabase-client.js";

// ─── Internal state ───────────────────────────────────────────────────────────

let _userId = null;
let _retryTimeout = null;
let _isOnline = navigator.onLine;
let _isSyncing = false;

const RETRY_DELAYS_MS = [3000, 8000, 20000, 60000]; // exponential backoff steps

// ─── Debounce utility ─────────────────────────────────────────────────────────

/**
 * Returns a debounced version of fn that waits ms after the last call.
 */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ─── Main SyncManager ─────────────────────────────────────────────────────────

export const SyncManager = {

  /**
   * Initialize the sync manager for an authenticated user.
   * Sets up network listeners and flushes any pending queue from before login.
   */
  init(userId) {
    _userId = userId;
    _isOnline = navigator.onLine;

    window.addEventListener("online", SyncManager._onNetworkReturn);
    window.addEventListener("offline", SyncManager._onNetworkLost);

    // Flush any pending writes from previous sessions
    SyncManager.syncNow();
  },

  /**
   * Tear down listeners. Call when user signs out.
   */
  destroy() {
    _userId = null;
    window.removeEventListener("online", SyncManager._onNetworkReturn);
    window.removeEventListener("offline", SyncManager._onNetworkLost);
    if (_retryTimeout) {
      clearTimeout(_retryTimeout);
      _retryTimeout = null;
    }
    _isSyncing = false;
  },

  // ── High-level sync operations ────────────────────────────────────────────

  /**
   * Sync that a concept was studied.
   * The local state is already saved by StorageManager.markConceptStudied().
   * Here we push to cloud (or queue if offline).
   */
  async syncConceptStudied(conceptKey, subjectId, chapterId) {
    if (!_userId || !isConfigured) return;

    const result = await CloudStorage.saveConceptProgress(_userId, {
      concept_id: conceptKey,
      completed: true,
      mastery_score: 100
    });

    if (result.error) {
      SyncManager._queue({
        type: "concept_progress",
        payload: { concept_id: conceptKey, completed: true, mastery_score: 100 }
      });
    }

    // Also sync chapter progress if we have info
    if (chapterId) {
      SyncManager._syncChapterProgressDebounced(subjectId, chapterId);
    }
  },

  /**
   * Directly sync chapter completion state and progress percentage.
   */
  async syncChapterCompletion(subjectId, chapterId, isCompleted, percent = null) {
    if (!_userId || !isConfigured) return;
    const finalPercent = percent !== null ? percent : (isCompleted ? 100 : 0);
    const result = await CloudStorage.saveChapterProgress(_userId, {
      subject: subjectId,
      chapter_id: chapterId,
      completion_percent: finalPercent,
      completed: !!isCompleted
    });
    if (result.error) {
      SyncManager._queue({
        type: "chapter_progress",
        payload: {
          subject: subjectId,
          chapter_id: chapterId,
          completion_percent: finalPercent,
          completed: !!isCompleted
        }
      });
    }
  },

  /**
   * Sync a question attempt.
   */
  async syncQuestionAttempt(data) {
    if (!_userId || !isConfigured) return;

    const result = await CloudStorage.recordQuestionAttempt(_userId, {
      question_id: data.questionId,
      subject: data.subject || null,
      chapter_id: data.chapterId || null,
      concept_id: data.conceptId || null,
      selected_answer: data.selectedAnswer ?? null,
      correct: data.correct ?? false,
      time_taken_ms: data.timeTakenMs ?? null
    });

    if (result.error) {
      SyncManager._queue({
        type: "question_attempt",
        payload: {
          question_id: data.questionId,
          subject: data.subject || null,
          chapter_id: data.chapterId || null,
          selected_answer: data.selectedAnswer ?? null,
          correct: data.correct ?? false
        }
      });
    }

    // Sync wrong answers to revision queue
    if (!data.correct) {
      CloudStorage.saveRevisionItem(_userId, {
        concept_id: data.chapterId ? `${data.chapterId}_q_${data.questionId}` : `q_${data.questionId}`,
        priority: 1,
        reason: "incorrect_question"
      });
    }
  },

  /**
   * Sync a completed test result.
   */
  async syncTestResult(testResult) {
    if (!_userId || !isConfigured) return;

    const result = await CloudStorage.recordTestAttempt(_userId, {
      test_id: testResult.id || "test",
      subject: testResult.subject || null,
      title: testResult.title || null,
      score: testResult.score ?? 0,
      total_questions: testResult.total ?? 0,
      correct_answers: testResult.score ?? 0,
      incorrect_answers: (testResult.total ?? 0) - (testResult.score ?? 0),
      unanswered: 0,
      accuracy: testResult.accuracy ?? 0,
      time_taken_ms: testResult.timeSpentSeconds ? testResult.timeSpentSeconds * 1000 : null
    });

    if (result.error) {
      SyncManager._queue({ type: "test_attempt", payload: testResult });
    }

    Bus.emit("progress:synced", { type: "test" });
  },

  /**
   * Sync a bookmark toggle.
   */
  async syncBookmark(itemId, itemType, bookmarked) {
    if (!_userId || !isConfigured) return;

    const result = await CloudStorage.upsertBookmark(_userId, itemType, itemId, bookmarked);

    if (result.error) {
      SyncManager._queue({ type: "bookmark", payload: { itemId, itemType, bookmarked } });
    }
  },

  /**
   * Manually flush the pending queue. Called on network return or after login.
   */
  async syncNow() {
    if (!_userId || !isConfigured || _isSyncing || !_isOnline) return;

    const queue = StorageManager.getPendingQueue();
    if (queue.length === 0) return;

    _isSyncing = true;
    Bus.emit("progress:syncing", { count: queue.length });

    const failed = [];

    for (const item of queue) {
      let result;

      try {
        result = await SyncManager._processQueueItem(item);
      } catch (e) {
        result = { error: e.message };
      }

      if (result && !result.error) {
        StorageManager.clearPendingItem(item._id);
      } else {
        failed.push(item);
      }
    }

    _isSyncing = false;

    if (failed.length > 0) {
      Bus.emit("progress:sync-failed", { count: failed.length });
      SyncManager._scheduleRetry();
    } else {
      Bus.emit("progress:synced", { type: "queue" });
    }
  },

  // ── Private helpers ────────────────────────────────────────────────────────

  _onNetworkReturn() {
    _isOnline = true;
    SyncManager.syncNow();
  },

  _onNetworkLost() {
    _isOnline = false;
  },

  /**
   * Add an item to the pending sync queue.
   */
  _queue(item) {
    StorageManager.addToPendingQueue(item);
    Bus.emit("progress:sync-failed", { queued: true });
  },

  /**
   * Process a single queue item.
   */
  async _processQueueItem(item) {
    if (!_userId) return { error: "no user" };

    switch (item.type) {
      case "concept_progress":
        return CloudStorage.saveConceptProgress(_userId, item.payload);
      case "question_attempt":
        return CloudStorage.recordQuestionAttempt(_userId, item.payload);
      case "test_attempt":
        return CloudStorage.recordTestAttempt(_userId, item.payload);
      case "bookmark":
        return CloudStorage.upsertBookmark(
          _userId, item.payload.itemType, item.payload.itemId, item.payload.bookmarked
        );
      case "chapter_progress":
        return CloudStorage.saveChapterProgress(_userId, item.payload);
      default:
        console.warn("[SyncManager] Unknown queue item type:", item.type);
        return { error: null }; // remove unknown items
    }
  },

  /**
   * Schedule a retry after exponential backoff.
   */
  _scheduleRetry(attempt = 0) {
    if (_retryTimeout) clearTimeout(_retryTimeout);
    const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
    _retryTimeout = setTimeout(() => {
      SyncManager.syncNow().then(() => {
        const remaining = StorageManager.getPendingQueue();
        if (remaining.length > 0 && attempt < RETRY_DELAYS_MS.length - 1) {
          SyncManager._scheduleRetry(attempt + 1);
        }
      });
    }, delay);
  },

  /**
   * Debounced chapter progress sync (avoids many DB calls while navigating steps).
   */
  _syncChapterProgressDebounced: debounce(async (subjectId, chapterId) => {
    if (!_userId) return;
    const state = StorageManager.load();
    const concepts = Object.keys(state.studiedConcepts || {});
    const chapterConcepts = concepts.filter(k => k.startsWith(`${chapterId}_`));
    const percent = Math.min(100, Math.round((chapterConcepts.length / 5) * 100)); // approx

    await CloudStorage.saveChapterProgress(_userId, {
      subject: subjectId,
      chapter_id: chapterId,
      completion_percent: percent,
      completed: percent >= 100,
      last_concept_id: chapterConcepts[chapterConcepts.length - 1] || null
    });
  }, 2000)
};
