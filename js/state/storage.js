/**
 * Storage Manager for MHT-CET PCMB Learning Platform
 * Handles persistent storage via localStorage with data integrity checks and export/import.
 *
 * Extended with:
 *   - Pending sync queue  (for offline-first cloud persistence)
 *   - Migration tracking  (for local → cloud one-time import)
 */

const STORAGE_KEY = "mht_cet_pcmb_progress_v1";
const PENDING_QUEUE_KEY = "mht_cet_pcmb_pending_sync_v1";
const MIGRATION_KEY = "mht_cet_pcmb_migrated_v1";

const DEFAULT_STATE = {
  user: {
    name: "MHT-CET Aspirant",
    targetScore: 180,
    dailyGoalMinutes: 45,
    streakDays: 4,
    lastActiveDate: new Date().toISOString().split("T")[0]
  },
  studiedConcepts: {
    "kinematics_mod-1": true,
    "kinematics_mod-2": true
  },
  completedChapters: {},
  practiceHistory: {}, // { questionId: { correct: bool, selected: idx, timestamp } }
  bookmarks: ["qb-phy-2", "mcq-kin-3"],
  bookmarkedResources: [],
  recentlyViewedResources: [],
  mistakes: [
    {
      id: "qb-phy-3",
      subject: "physics",
      chapterId: "kinematics",
      question: "The displacement-time graph of a moving particle is a parabola opening downwards. The acceleration of the particle is:",
      options: ["Zero", "Constant and positive", "Constant and negative", "Linearly increasing"],
      correct: 2,
      userAnswer: 1,
      explanation: "Equation of a downward-opening parabola is s(t) = -kt^2 + bt + c. Differentiating twice gives a(t) = -2k < 0, which is constant and negative.",
      wrongCount: 1,
      mastered: false,
      timestamp: new Date().toISOString()
    }
  ],
  testScores: [
    {
      id: "test-kin-sample",
      title: "Kinematics Diagnostic Test",
      subject: "physics",
      score: 8,
      total: 10,
      accuracy: 80,
      timeSpentSeconds: 412,
      date: new Date().toISOString()
    }
  ]
};

export class StorageManager {
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.save(DEFAULT_STATE);
        return DEFAULT_STATE;
      }
      return { ...DEFAULT_STATE, ...JSON.parse(data) };
    } catch (e) {
      console.error("Failed to load local storage state:", e);
      return DEFAULT_STATE;
    }
  }

  static save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  }

  static markConceptStudied(conceptKey) {
    const state = this.load();
    state.studiedConcepts[conceptKey] = true;
    this.save(state);
    return state;
  }

  static toggleChapterCompletion(chapterId, isCompleted = null) {
    const state = this.load();
    if (!state.completedChapters) state.completedChapters = {};

    const currentEntry = state.completedChapters[chapterId];
    const currentlyDone = typeof currentEntry === "object" ? !!currentEntry.completed : !!currentEntry;
    const targetState = isCompleted !== null ? isCompleted : !currentlyDone;

    state.completedChapters[chapterId] = {
      completed: targetState,
      progress: targetState ? 100 : 0,
      updatedAt: new Date().toISOString()
    };

    this.save(state);
    return state.completedChapters[chapterId];
  }

  static setChapterProgress(chapterId, progressPercent) {
    const state = this.load();
    if (!state.completedChapters) state.completedChapters = {};

    const clamped = Math.max(0, Math.min(100, Math.round(progressPercent)));
    state.completedChapters[chapterId] = {
      completed: clamped === 100,
      progress: clamped,
      updatedAt: new Date().toISOString()
    };

    this.save(state);
    return state.completedChapters[chapterId];
  }

  static getChapterState(chapterId) {
    const state = this.load();
    const entry = state.completedChapters?.[chapterId];
    if (!entry) return { completed: false, progress: 0, status: "not-started" };
    if (typeof entry === "boolean") {
      return { completed: entry, progress: entry ? 100 : 0, status: entry ? "completed" : "not-started" };
    }
    const completed = !!entry.completed;
    const progress = entry.progress || (completed ? 100 : 0);
    const status = completed ? "completed" : (progress > 0 ? "in-progress" : "not-started");
    return { completed, progress, status, updatedAt: entry.updatedAt };
  }

  static getSyllabusStats(syllabusData) {
    const state = this.load();
    const completedChapters = state.completedChapters || {};

    let totalChapters = 0;
    let totalCompleted = 0;
    let c11Total = 0, c11Completed = 0;
    let c12Total = 0, c12Completed = 0;

    const subjects = {};

    for (const [subjKey, subjObj] of Object.entries(syllabusData)) {
      let sTotal = 0;
      let sCompleted = 0;

      for (const ch of subjObj.chapters || []) {
        totalChapters++;
        sTotal++;
        const std = ch.standard || (ch.std === "Std XI" ? 11 : 12);
        if (std === 11) c11Total++;
        else c12Total++;

        const entry = completedChapters[ch.id];
        const isDone = typeof entry === "object" ? !!entry.completed : !!entry;

        if (isDone) {
          totalCompleted++;
          sCompleted++;
          if (std === 11) c11Completed++;
          else c12Completed++;
        }
      }

      subjects[subjKey] = {
        name: subjObj.name,
        color: subjObj.color,
        icon: subjObj.icon,
        total: sTotal,
        completed: sCompleted,
        remaining: sTotal - sCompleted,
        percent: sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0
      };
    }

    return {
      totalChapters,
      totalCompleted,
      totalRemaining: totalChapters - totalCompleted,
      overallPercent: totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0,
      c11Total,
      c11Completed,
      c11Remaining: c11Total - c11Completed,
      c11Percent: c11Total > 0 ? Math.round((c11Completed / c11Total) * 100) : 0,
      c12Total,
      c12Completed,
      c12Remaining: c12Total - c12Completed,
      c12Percent: c12Total > 0 ? Math.round((c12Completed / c12Total) * 100) : 0,
      subjects
    };
  }

  static recordPracticeAttempt(questionId, isCorrect, userAnswer, questionObj) {
    const state = this.load();
    state.practiceHistory[questionId] = {
      correct: isCorrect,
      selected: userAnswer,
      timestamp: new Date().toISOString()
    };

    if (!isCorrect && questionObj) {
      // Add or update mistake
      const existingIdx = state.mistakes.findIndex(m => m.id === questionId);
      if (existingIdx >= 0) {
        state.mistakes[existingIdx].wrongCount += 1;
        state.mistakes[existingIdx].mastered = false;
      } else {
        state.mistakes.push({
          id: questionId,
          subject: questionObj.subject || "physics",
          chapterId: questionObj.chapterId || "kinematics",
          question: questionObj.question,
          options: questionObj.options,
          correct: questionObj.correct,
          userAnswer: userAnswer,
          explanation: questionObj.explanation,
          wrongCount: 1,
          mastered: false,
          timestamp: new Date().toISOString()
        });
      }
    } else if (isCorrect) {
      // If mastered in mistake retry
      const existingIdx = state.mistakes.findIndex(m => m.id === questionId);
      if (existingIdx >= 0) {
        state.mistakes[existingIdx].mastered = true;
      }
    }

    this.save(state);
    return state;
  }

  static toggleBookmark(questionId) {
    const state = this.load();
    const idx = state.bookmarks.indexOf(questionId);
    if (idx >= 0) {
      state.bookmarks.splice(idx, 1);
    } else {
      state.bookmarks.push(questionId);
    }
    this.save(state);
    return state.bookmarks.includes(questionId);
  }

  static recordTestResult(testResult) {
    const state = this.load();
    state.testScores.unshift({
      ...testResult,
      date: new Date().toISOString()
    });
    this.save(state);
    return state;
  }

  static exportBackup() {
    const state = this.load();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mht_cet_pcmb_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static importBackup(jsonString) {
    try {
      const state = JSON.parse(jsonString);
      this.save(state);
      return true;
    } catch (e) {
      console.error("Invalid backup file:", e);
      return false;
    }
  }

  // ─── Pending Sync Queue ─────────────────────────────────────────────────────
  // Used by SyncManager to queue cloud writes that failed due to being offline.

  /**
   * Get all pending sync items.
   * @returns {Array}
   */
  static getPendingQueue() {
    try {
      const raw = localStorage.getItem(PENDING_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add an item to the pending sync queue.
   * Each item gets a unique _id for tracking.
   * @param {Object} item - { type: string, payload: Object }
   */
  static addToPendingQueue(item) {
    try {
      const queue = this.getPendingQueue();
      const entry = {
        ...item,
        _id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        _queuedAt: new Date().toISOString()
      };
      queue.push(entry);
      // Keep queue bounded — drop oldest beyond 500 items
      const bounded = queue.slice(-500);
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(bounded));
    } catch (e) {
      console.error("Failed to add to pending queue:", e);
    }
  }

  /**
   * Remove a successfully synced item from the pending queue.
   * @param {string} id - the _id of the item to remove
   */
  static clearPendingItem(id) {
    try {
      const queue = this.getPendingQueue().filter(item => item._id !== id);
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error("Failed to clear pending item:", e);
    }
  }

  /**
   * Clear the entire pending queue (e.g. after a full successful sync).
   */
  static clearPendingQueue() {
    try {
      localStorage.removeItem(PENDING_QUEUE_KEY);
    } catch (e) {
      console.error("Failed to clear pending queue:", e);
    }
  }

  // ─── Migration Tracking ──────────────────────────────────────────────────────
  // Tracks whether local progress has been imported into a cloud account.
  // Keyed by userId so each account gets one migration offer per device.

  /**
   * Check whether local→cloud migration has already occurred for this user.
   * @param {string} userId
   * @returns {boolean}
   */
  static isMigrated(userId) {
    try {
      const raw = localStorage.getItem(MIGRATION_KEY);
      const record = raw ? JSON.parse(raw) : {};
      return !!record[userId];
    } catch {
      return false;
    }
  }

  /**
   * Mark local→cloud migration as complete for this user.
   * @param {string} userId
   */
  static markMigrated(userId) {
    try {
      const raw = localStorage.getItem(MIGRATION_KEY);
      const record = raw ? JSON.parse(raw) : {};
      record[userId] = new Date().toISOString();
      localStorage.setItem(MIGRATION_KEY, JSON.stringify(record));
    } catch (e) {
      console.error("Failed to mark migration:", e);
    }
  }

  // ─── Resource Bookmarks & Recent Activity ────────────────────────────────────
  static isResourceBookmarked(resourceId) {
    const state = this.load();
    const list = state.bookmarkedResources || [];
    return list.includes(resourceId);
  }

  static toggleResourceBookmark(resourceId) {
    const state = this.load();
    if (!state.bookmarkedResources) state.bookmarkedResources = [];
    const index = state.bookmarkedResources.indexOf(resourceId);
    let isBookmarked = false;
    if (index >= 0) {
      state.bookmarkedResources.splice(index, 1);
      isBookmarked = false;
    } else {
      state.bookmarkedResources.push(resourceId);
      isBookmarked = true;
    }
    this.save(state);
    return isBookmarked;
  }

  static recordResourceView(resourceId) {
    const state = this.load();
    if (!state.recentlyViewedResources) state.recentlyViewedResources = [];
    const filtered = state.recentlyViewedResources.filter(id => id !== resourceId);
    filtered.unshift(resourceId);
    state.recentlyViewedResources = filtered.slice(0, 30); // keep last 30
    this.save(state);
  }

  static getBookmarkedResources() {
    const state = this.load();
    return state.bookmarkedResources || [];
  }

  static getRecentlyViewedResources() {
    const state = this.load();
    return state.recentlyViewedResources || [];
  }
}
