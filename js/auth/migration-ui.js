/**
 * Migration UI — PCMB Interactive CET
 *
 * Shown when a user first logs in and we detect pre-existing local progress.
 * Gives them a clear choice: import it into their account, or start fresh.
 *
 * This runs once per device+account pair and is then permanently dismissed
 * (tracked via StorageManager.isMigrated()).
 */

import { StorageManager } from "../state/storage.js";
import { CloudStorage } from "../state/cloud-storage.js";
import { Store } from "../state/store.js";

/**
 * Check whether a migration prompt is needed.
 * Returns true if there is meaningful local progress that hasn't been imported.
 *
 * @param {string} userId
 * @returns {boolean}
 */
export function shouldPromptMigration(userId) {
  if (StorageManager.isMigrated(userId)) return false;

  const state = StorageManager.load();

  // Detect meaningful local progress (beyond defaults)
  const hasStudiedConcepts = Object.keys(state.studiedConcepts || {}).length > 0;
  const hasPracticeHistory = Object.keys(state.practiceHistory || {}).length > 0;
  const hasTestScores = (state.testScores || []).length > 0;
  const hasMistakes = (state.mistakes || []).length > 0;

  return hasStudiedConcepts || hasPracticeHistory || hasTestScores || hasMistakes;
}

/**
 * Render the migration modal overlay.
 *
 * @param {string} userId - authenticated user ID
 * @param {Function} onComplete - called when migration is finished (import or skip)
 */
export function renderMigrationPrompt(userId, onComplete) {
  // Remove any existing migration modal
  const existing = document.getElementById("migration-modal-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "migration-modal-overlay";
  overlay.className = "migration-overlay";

  const state = StorageManager.load();
  const conceptCount = Object.keys(state.studiedConcepts || {}).length;
  const practiceCount = Object.keys(state.practiceHistory || {}).length;
  const testCount = (state.testScores || []).length;
  const mistakeCount = (state.mistakes || []).filter(m => !m.mastered).length;

  overlay.innerHTML = `
    <div class="migration-modal">
      <div class="migration-icon">📦</div>
      <h2 class="migration-title">Existing progress found</h2>
      <p class="migration-desc">
        We found study data stored on this device.<br>
        Would you like to import it into your account?
      </p>

      <div class="migration-summary">
        ${conceptCount > 0 ? `<div class="migration-stat"><span class="migration-stat-icon">🧠</span> ${conceptCount} studied concept${conceptCount === 1 ? "" : "s"}</div>` : ""}
        ${practiceCount > 0 ? `<div class="migration-stat"><span class="migration-stat-icon">🎯</span> ${practiceCount} practice question${practiceCount === 1 ? "" : "s"} attempted</div>` : ""}
        ${testCount > 0 ? `<div class="migration-stat"><span class="migration-stat-icon">⏱</span> ${testCount} mock test${testCount === 1 ? "" : "s"} completed</div>` : ""}
        ${mistakeCount > 0 ? `<div class="migration-stat"><span class="migration-stat-icon">📖</span> ${mistakeCount} unresolved mistake${mistakeCount === 1 ? "" : "s"}</div>` : ""}
      </div>

      <div class="migration-actions">
        <button class="auth-submit-btn" id="migration-import-btn">
          Import Progress into Account
        </button>
        <button class="migration-skip-btn" id="migration-skip-btn">
          Start Fresh — Don't Import
        </button>
      </div>

      <p class="migration-note">
        This will only be asked once. Your local data is not deleted either way.
      </p>
    </div>
  `;

  document.body.appendChild(overlay);

  // Import button
  const importBtn = overlay.querySelector("#migration-import-btn");
  importBtn.addEventListener("click", async () => {
    importBtn.disabled = true;
    importBtn.textContent = "Importing…";

    try {
      const { success, errors } = await CloudStorage.bulkImportLocalProgress(userId, state);

      if (success) {
        Store.showToast("Progress imported successfully! Your study history is now saved to your account.", "success");
      } else {
        console.warn("[Migration] Some items failed to import:", errors);
        Store.showToast("Most progress imported. Some items could not be synced — they'll retry automatically.", "info");
      }
    } catch (err) {
      console.error("[Migration] Import failed:", err);
      Store.showToast("Import encountered an issue. Your local progress is safe.", "warning");
    }

    StorageManager.markMigrated(userId);
    overlay.remove();
    onComplete("imported");
  });

  // Skip button
  const skipBtn = overlay.querySelector("#migration-skip-btn");
  skipBtn.addEventListener("click", () => {
    StorageManager.markMigrated(userId);
    overlay.remove();
    onComplete("skipped");
  });
}
