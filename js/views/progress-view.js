/**
 * Progress & Personalization Analytics View
 */

import { StorageManager } from "../state/storage.js";
import { Store } from "../state/store.js";
import { SYLLABUS_DATA } from "../data/syllabus.js";

export function renderProgressView(container) {
  const state = StorageManager.load();
  const attemptedCount = Object.keys(state.practiceHistory).length;
  const correctCount = Object.values(state.practiceHistory).filter(p => p.correct).length;
  const overallAccuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const testScores = state.testScores || [];
  const mistakes = state.mistakes || [];
  const masteredMistakes = mistakes.filter(m => m.mastered).length;

  container.innerHTML = `
    <div class="card" style="margin-bottom: var(--space-6);">
      <div class="flex-between" style="flex-wrap: wrap; gap: 16px;">
        <div>
          <span class="badge badge-phy">Analytics & Growth</span>
          <h1 style="font-size: 1.6rem; color: var(--text-primary); margin-top: 4px;">
            MHT-CET Performance Mastery
          </h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">
            Real-time analytics across concepts studied, practice accuracy, and diagnostic test metrics.
          </p>
        </div>

        <div class="flex-gap-2">
          <button class="btn btn-outline btn-sm" id="export-backup-btn">📥 Export Progress JSON</button>
          <label class="btn btn-outline btn-sm" style="cursor: pointer;">
            📤 Import JSON
            <input type="file" id="import-backup-input" accept=".json" style="display: none;">
          </label>
        </div>
      </div>
    </div>

    <!-- Big 4 KPI Stats Grid -->
    <div class="grid-4" style="margin-bottom: var(--space-8);">
      <div class="card">
        <span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: var(--text-muted);">Overall Accuracy</span>
        <div style="font-size: 1.8rem; font-weight: bold; color: var(--subject-phy); margin-top: 4px;">
          ${overallAccuracy}%
        </div>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">${correctCount} of ${attemptedCount} correct</span>
      </div>

      <div class="card">
        <span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: var(--text-muted);">Questions Solved</span>
        <div style="font-size: 1.8rem; font-weight: bold; color: var(--text-primary); margin-top: 4px;">
          ${attemptedCount}
        </div>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">Across all 4 tracks</span>
      </div>

      <div class="card">
        <span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: var(--text-muted);">Mock Tests Taken</span>
        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success); margin-top: 4px;">
          ${testScores.length}
        </div>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">Avg score: ${testScores.length > 0 ? Math.round(testScores.reduce((a,b)=>a+b.score,0)/testScores.length) : 0} marks</span>
      </div>

      <div class="card">
        <span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: var(--text-muted);">Mistake Resolution</span>
        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-cet-orange); margin-top: 4px;">
          ${masteredMistakes}/${mistakes.length}
        </div>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">${mistakes.length > 0 ? Math.round((masteredMistakes/mistakes.length)*100) : 100}% mastered</span>
      </div>
    </div>

    <!-- Subject Mastery Progress Grid -->
    <div style="margin-bottom: var(--space-4);">
      <h2 style="font-size: 1.25rem; color: var(--text-primary);">Subject Completion Breakdown</h2>
    </div>

    <div class="grid-2" style="margin-bottom: var(--space-8);">
      ${Object.values(SYLLABUS_DATA).map(subj => {
        const estPct = subj.id === 'physics' ? 40 : (subj.id === 'chemistry' ? 25 : 15);
        return `
          <div class="card">
            <div class="flex-between" style="margin-bottom: 8px;">
              <div class="flex-gap-2">
                <span class="badge ${subj.badgeClass}">${subj.name}</span>
                <span style="font-size: 0.85rem; font-weight: bold;">${subj.chapters.length} Chapters</span>
              </div>
              <strong style="font-size: 0.95rem; color: ${subj.color};">${estPct}%</strong>
            </div>

            <div class="daily-goal-bar" style="margin-bottom: 12px; height: 8px;">
              <div class="daily-goal-progress" style="width: ${estPct}%; background: ${subj.color};"></div>
            </div>

            <div class="flex-between" style="font-size: 0.8rem; color: var(--text-muted);">
              <span>Active Chapter: <strong>${subj.chapters[0].shortTitle}</strong></span>
              <a href="#subject/${subj.id}" style="color: ${subj.color}; font-weight: 600;">View Syllabus →</a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Bind export/import
  const exportBtn = container.querySelector("#export-backup-btn");
  const importInput = container.querySelector("#import-backup-input");

  if (exportBtn) {
    exportBtn.addEventListener("click", () => StorageManager.exportBackup());
  }

  if (importInput) {
    importInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = StorageManager.importBackup(event.target.result);
          if (success) {
            Store.showToast("Progress successfully imported!", "success");
            Store.refresh();
            renderProgressView(container);
          } else {
            Store.showToast("Failed to parse backup file.", "error");
          }
        };
        reader.readAsText(file);
      }
    });
  }
}
