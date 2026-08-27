/**
 * Cloud Storage Service — PCMB Interactive CET
 *
 * All database read/write operations. Never throws — always returns
 * { data, error } objects so callers can handle failures gracefully.
 *
 * This module is deliberately separate from the Supabase client so that
 * the rest of the app doesn't need to know about Supabase schema details.
 *
 * Operations:
 *   loadUserProgress(userId)
 *   saveChapterProgress(userId, data)
 *   saveConceptProgress(userId, data)
 *   recordQuestionAttempt(userId, data)
 *   recordTestAttempt(userId, data)
 *   loadBookmarks(userId)
 *   upsertBookmark(userId, itemType, itemId, bookmarked)
 *   saveRevisionItem(userId, data)
 *   loadRevisionQueue(userId)
 *   saveStudySession(userId, data)
 *   bulkImportLocalProgress(userId, localState)
 */

import { supabase, isConfigured } from "../auth/supabase-client.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString();
}

/**
 * Safely execute a Supabase query.
 * Returns { data, error } — never throws.
 */
async function safeQuery(fn) {
  if (!isConfigured) {
    return { data: null, error: "Supabase not configured — running in local-only mode." };
  }
  try {
    const result = await fn();
    return result;
  } catch (err) {
    console.error("[CloudStorage] Query failed:", err);
    return { data: null, error: err.message || "Network error" };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const CloudStorage = {

  // ── Full Progress Load ──────────────────────────────────────────────────────

  /**
   * Load all persisted progress for a user.
   * Returns a structured object compatible with the local StorageManager state shape.
   */
  async loadUserProgress(userId) {
    if (!isConfigured) return null;

    const [chapterRes, conceptRes, bookmarkRes, testRes, questionRes, revisionRes] =
      await Promise.all([
        safeQuery(() => supabase.from("chapter_progress").select("*").eq("user_id", userId)),
        safeQuery(() => supabase.from("concept_progress").select("*").eq("user_id", userId)),
        safeQuery(() => supabase.from("bookmarks").select("*").eq("user_id", userId)),
        safeQuery(() => supabase.from("test_attempts").select("*").eq("user_id", userId).order("completed_at", { ascending: false })),
        safeQuery(() => supabase.from("question_attempts").select("*").eq("user_id", userId)),
        safeQuery(() => supabase.from("revision_queue").select("*").eq("user_id", userId))
      ]);

    return {
      chapterProgress: chapterRes.data || [],
      conceptProgress: conceptRes.data || [],
      bookmarks: bookmarkRes.data || [],
      testAttempts: testRes.data || [],
      questionAttempts: questionRes.data || [],
      revisionQueue: revisionRes.data || []
    };
  },

  // ── Chapter Progress ────────────────────────────────────────────────────────

  /**
   * Upsert chapter progress for a user.
   * @param {string} userId
   * @param {Object} data - { subject, chapter_id, completion_percent, completed, last_concept_id }
   */
  async saveChapterProgress(userId, data) {
    return safeQuery(() =>
      supabase.from("chapter_progress").upsert({
        user_id: userId,
        subject: data.subject,
        chapter_id: data.chapter_id,
        completion_percent: data.completion_percent ?? 0,
        completed: data.completed ?? false,
        last_concept_id: data.last_concept_id ?? null,
        last_accessed_at: now(),
        updated_at: now()
      }, {
        onConflict: "user_id,chapter_id"
      })
    );
  },

  // ── Concept Progress ────────────────────────────────────────────────────────

  /**
   * Upsert concept completion for a user.
   * @param {string} userId
   * @param {Object} data - { concept_id, completed, mastery_score }
   */
  async saveConceptProgress(userId, data) {
    return safeQuery(() =>
      supabase.from("concept_progress").upsert({
        user_id: userId,
        concept_id: data.concept_id,
        completed: data.completed ?? true,
        mastery_score: data.mastery_score ?? 100,
        last_seen_at: now(),
        updated_at: now()
      }, {
        onConflict: "user_id,concept_id"
      })
    );
  },

  // ── Question Attempts ───────────────────────────────────────────────────────

  /**
   * Record a question attempt.
   * @param {string} userId
   * @param {Object} data - { question_id, subject, chapter_id, concept_id, selected_answer, correct, time_taken_ms }
   */
  async recordQuestionAttempt(userId, data) {
    return safeQuery(() =>
      supabase.from("question_attempts").insert({
        user_id: userId,
        question_id: data.question_id,
        subject: data.subject || null,
        chapter_id: data.chapter_id || null,
        concept_id: data.concept_id || null,
        selected_answer: data.selected_answer ?? null,
        correct: data.correct ?? false,
        time_taken_ms: data.time_taken_ms ?? null,
        attempted_at: now()
      })
    );
  },

  // ── Test Attempts ───────────────────────────────────────────────────────────

  /**
   * Record a completed test attempt.
   * @param {string} userId
   * @param {Object} data - { test_id, subject, title, score, total_questions, correct_answers, incorrect_answers, unanswered, time_taken_ms }
   */
  async recordTestAttempt(userId, data) {
    return safeQuery(() =>
      supabase.from("test_attempts").insert({
        user_id: userId,
        test_id: data.test_id,
        subject: data.subject || null,
        title: data.title || null,
        score: data.score ?? 0,
        total_questions: data.total_questions ?? 0,
        correct_answers: data.correct_answers ?? 0,
        incorrect_answers: data.incorrect_answers ?? 0,
        unanswered: data.unanswered ?? 0,
        accuracy: data.accuracy ?? 0,
        time_taken_ms: data.time_taken_ms ?? null,
        started_at: data.started_at ?? now(),
        completed_at: now()
      })
    );
  },

  // ── Bookmarks ───────────────────────────────────────────────────────────────

  /**
   * Load all bookmarks for a user.
   */
  async loadBookmarks(userId) {
    const { data } = await safeQuery(() =>
      supabase.from("bookmarks").select("item_id").eq("user_id", userId)
    );
    return (data || []).map(b => b.item_id);
  },

  /**
   * Add or remove a bookmark.
   * @param {string} userId
   * @param {string} itemType - 'question' | 'concept' | 'formula' etc.
   * @param {string} itemId
   * @param {boolean} bookmarked - true = add, false = remove
   */
  async upsertBookmark(userId, itemType, itemId, bookmarked) {
    if (bookmarked) {
      return safeQuery(() =>
        supabase.from("bookmarks").upsert({
          user_id: userId,
          item_type: itemType,
          item_id: itemId,
          created_at: now()
        }, { onConflict: "user_id,item_type,item_id" })
      );
    } else {
      return safeQuery(() =>
        supabase.from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("item_type", itemType)
          .eq("item_id", itemId)
      );
    }
  },

  // ── Revision Queue ──────────────────────────────────────────────────────────

  /**
   * Add or update a revision queue item.
   * @param {string} userId
   * @param {Object} data - { concept_id, priority, reason, next_review_at }
   */
  async saveRevisionItem(userId, data) {
    return safeQuery(() =>
      supabase.from("revision_queue").upsert({
        user_id: userId,
        concept_id: data.concept_id,
        priority: data.priority ?? 1,
        reason: data.reason ?? "manual_revision",
        next_review_at: data.next_review_at ?? now(),
        updated_at: now()
      }, { onConflict: "user_id,concept_id" })
    );
  },

  /**
   * Load the full revision queue for a user.
   */
  async loadRevisionQueue(userId) {
    const { data } = await safeQuery(() =>
      supabase.from("revision_queue")
        .select("*")
        .eq("user_id", userId)
        .order("priority", { ascending: false })
    );
    return data || [];
  },

  // ── Study Sessions ──────────────────────────────────────────────────────────

  /**
   * Record a study session.
   * @param {string} userId
   * @param {Object} data - { subject, chapter_id, started_at, ended_at, duration_seconds }
   */
  async saveStudySession(userId, data) {
    return safeQuery(() =>
      supabase.from("study_sessions").insert({
        user_id: userId,
        subject: data.subject || null,
        chapter_id: data.chapter_id || null,
        started_at: data.started_at || now(),
        ended_at: data.ended_at || now(),
        duration_seconds: data.duration_seconds ?? 0
      })
    );
  },

  // ── Bulk Local → Cloud Migration ────────────────────────────────────────────

  /**
   * Import existing localStorage progress into the cloud database.
   * Called when a new user first logs in and has pre-existing local data.
   *
   * Merge rules:
   * - studiedConcepts → concept_progress (completed = true)
   * - practiceHistory → question_attempts (one record per question)
   * - bookmarks → bookmarks table
   * - testScores → test_attempts
   * - mistakes → revision_queue (reason = 'incorrect_question', unmastered only)
   */
  async bulkImportLocalProgress(userId, localState) {
    const results = [];

    // 1. Concept progress from studiedConcepts
    if (localState.studiedConcepts) {
      for (const conceptKey of Object.keys(localState.studiedConcepts)) {
        if (localState.studiedConcepts[conceptKey]) {
          results.push(
            CloudStorage.saveConceptProgress(userId, {
              concept_id: conceptKey,
              completed: true,
              mastery_score: 100
            })
          );
        }
      }
    }

    // 2. Practice history → question attempts (batch)
    if (localState.practiceHistory) {
      const entries = Object.entries(localState.practiceHistory);
      // Insert in batches of 20 to avoid timeout
      for (let i = 0; i < entries.length; i += 20) {
        const batch = entries.slice(i, i + 20).map(([questionId, attempt]) => ({
          user_id: userId,
          question_id: questionId,
          selected_answer: attempt.selected ?? null,
          correct: attempt.correct ?? false,
          attempted_at: attempt.timestamp || now()
        }));
        results.push(
          safeQuery(() => supabase.from("question_attempts").upsert(batch, { onConflict: "user_id,question_id,attempted_at" }))
        );
      }
    }

    // 3. Bookmarks
    if (localState.bookmarks && localState.bookmarks.length > 0) {
      const bookmarkRows = localState.bookmarks.map(itemId => ({
        user_id: userId,
        item_type: "question",
        item_id: itemId,
        created_at: now()
      }));
      results.push(
        safeQuery(() => supabase.from("bookmarks").upsert(bookmarkRows, { onConflict: "user_id,item_type,item_id" }))
      );
    }

    // 4. Test scores → test_attempts
    if (localState.testScores && localState.testScores.length > 0) {
      for (const ts of localState.testScores) {
        results.push(
          safeQuery(() => supabase.from("test_attempts").insert({
            user_id: userId,
            test_id: ts.id || "imported",
            subject: ts.subject || null,
            title: ts.title || null,
            score: ts.score ?? 0,
            total_questions: ts.total ?? 0,
            correct_answers: ts.score ?? 0,
            incorrect_answers: (ts.total ?? 0) - (ts.score ?? 0),
            unanswered: 0,
            accuracy: ts.accuracy ?? 0,
            time_taken_ms: ts.timeSpentSeconds ? ts.timeSpentSeconds * 1000 : null,
            completed_at: ts.date || now()
          }))
        );
      }
    }

    // 5. Unmastered mistakes → revision_queue
    if (localState.mistakes && localState.mistakes.length > 0) {
      const unmastered = localState.mistakes.filter(m => !m.mastered);
      for (const m of unmastered) {
        results.push(
          CloudStorage.saveRevisionItem(userId, {
            concept_id: `${m.chapterId}_mistake_${m.id}`,
            priority: m.wrongCount || 1,
            reason: "incorrect_question"
          })
        );
      }
    }

    const resolved = await Promise.allSettled(results);
    const errors = resolved.filter(r => r.status === "rejected" || r.value?.error);
    return { success: errors.length === 0, errors };
  },

  // ── Cloud → Local State Merge ───────────────────────────────────────────────

  /**
   * Merge cloud progress into the local StorageManager state shape.
   * Follows the merge rules from the implementation plan.
   *
   * @param {Object} localState - existing local state (from StorageManager.load())
   * @param {Object} cloudProgress - result from loadUserProgress()
   * @returns {Object} merged state
   */
  mergeCloudIntoLocal(localState, cloudProgress) {
    if (!cloudProgress) return localState;

    const merged = { ...localState };

    // 1. studiedConcepts ← cloud concept_progress
    for (const cp of cloudProgress.conceptProgress) {
      if (cp.completed) {
        merged.studiedConcepts = merged.studiedConcepts || {};
        merged.studiedConcepts[cp.concept_id] = true;
      }
    }

    // 2. bookmarks — union (local ∪ cloud)
    const cloudBookmarkIds = cloudProgress.bookmarks.map(b => b.item_id);
    const localBookmarks = merged.bookmarks || [];
    merged.bookmarks = [...new Set([...localBookmarks, ...cloudBookmarkIds])];

    // 3. testScores ← cloud test_attempts (append cloud tests, dedup by id)
    const existingIds = new Set((merged.testScores || []).map(t => t.id));
    const cloudTests = cloudProgress.testAttempts
      .filter(t => !existingIds.has(t.test_id))
      .map(t => ({
        id: t.test_id,
        title: t.title || "Test",
        subject: t.subject || "mixed",
        score: t.score,
        total: t.total_questions,
        accuracy: t.accuracy,
        timeSpentSeconds: t.time_taken_ms ? Math.round(t.time_taken_ms / 1000) : 0,
        date: t.completed_at
      }));
    merged.testScores = [...cloudTests, ...(merged.testScores || [])];

    // 4. practiceHistory ← cloud question_attempts
    for (const qa of cloudProgress.questionAttempts) {
      const existing = merged.practiceHistory[qa.question_id];
      // Prefer cloud if no local record, or if cloud attempt is more recent
      if (!existing) {
        merged.practiceHistory[qa.question_id] = {
          correct: qa.correct,
          selected: qa.selected_answer,
          timestamp: qa.attempted_at
        };
      }
    }

    // 5. completedChapters ← cloud chapter_progress
    if (cloudProgress.chapterProgress) {
      merged.completedChapters = merged.completedChapters || {};
      for (const cp of cloudProgress.chapterProgress) {
        merged.completedChapters[cp.chapter_id] = {
          completed: !!cp.completed,
          progress: cp.completion_percent ?? (cp.completed ? 100 : 0),
          updatedAt: cp.updated_at || now()
        };
      }
    }

    return merged;
  }
};
