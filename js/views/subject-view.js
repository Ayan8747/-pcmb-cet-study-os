/**
 * Subject View: Chapter library, weightage distribution, and subject navigation
 */

import { SYLLABUS_DATA } from "../data/syllabus.js";
import { StorageManager } from "../state/storage.js";
import { Store, Bus } from "../state/store.js";
import { SyncManager } from "../state/sync-manager.js";

let selectedStd = "all"; // 'all' | '11' | '12'

export function renderSubjectView(container, subjectId) {
  const subject = SYLLABUS_DATA[subjectId] || SYLLABUS_DATA.physics;

  function render() {
    const chapters = (subject.chapters || []).filter(ch => {
      const stdVal = ch.standard || (ch.std === "Std XI" ? 11 : 12);
      if (selectedStd === "11" && stdVal !== 11) return false;
      if (selectedStd === "12" && stdVal !== 12) return false;
      return true;
    });

    const c11Count = (subject.chapters || []).filter(c => (c.standard || (c.std === "Std XI" ? 11 : 12)) === 11).length;
    const c12Count = (subject.chapters || []).filter(c => (c.standard || (c.std === "Std XI" ? 11 : 12)) === 12).length;

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="card" style="margin-bottom: var(--space-6); border-left: 4px solid ${subject.color};">
        <div class="flex-between" style="flex-wrap: wrap; gap: 16px;">
          <div>
            <div class="flex-gap-2" style="margin-bottom: 6px;">
              <span class="badge ${subject.badgeClass}">${subject.name.toUpperCase()}</span>
              <span class="badge badge-neutral">MHT-CET Weightage: ${subject.weightageCET}</span>
              <span class="badge badge-neutral">${subject.chapters.length} Syllabus Chapters</span>
            </div>
            <h1 style="font-size: 1.75rem; color: var(--text-primary); margin-bottom: 6px;">
              ${subject.icon} ${subject.name} Chapter Library
            </h1>
            <p style="font-size: 0.95rem; color: var(--text-secondary); max-width: 680px;">
              ${subject.tagline}
            </p>
          </div>

          <div class="flex-gap-2">
            <a href="#syllabus?subject=${subject.id}" class="btn btn-outline">Explore in Syllabus OS</a>
            <a href="#practice?search=${encodeURIComponent(subject.name)}" class="btn ${subject.btnClass}">Practice ${subject.name} MCQs</a>
          </div>
        </div>
      </div>

      <!-- Filter Controls & Class Switcher -->
      <div style="margin-bottom: var(--space-6); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: var(--bg-surface-elevated); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-right: 4px;">Class Filter:</span>
          <button class="btn btn-sm ${selectedStd === 'all' ? 'btn-primary' : 'btn-ghost'}" id="subj-std-all">All (${subject.chapters.length})</button>
          <button class="btn btn-sm ${selectedStd === '11' ? 'btn-primary' : 'btn-ghost'}" id="subj-std-11">Class 11th (${c11Count})</button>
          <button class="btn btn-sm ${selectedStd === '12' ? 'btn-primary' : 'btn-ghost'}" id="subj-std-12">Class 12th (${c12Count})</button>
        </div>

        <span style="font-size: 0.85rem; color: var(--text-muted);">Standard XI (20%) + Standard XII (80%)</span>
      </div>

      <!-- Chapter Grid -->
      <div class="grid-2" style="margin-bottom: var(--space-8);">
        ${chapters.map(ch => {
          const userState = StorageManager.getChapterState(ch.id);
          return `
            <div class="chapter-card ${userState.completed ? 'completed-card' : ''}" style="border-top: 2px solid ${subject.color};">
              <div class="flex-between">
                <div class="flex-gap-2">
                  <span class="chapter-num">${ch.std} • Chapter ${ch.num}</span>
                  <span class="badge ${userState.completed ? 'badge-success' : 'badge-neutral'}">
                    ${userState.completed ? 'Completed ✓' : (userState.progress > 0 ? 'In Progress' : ch.status)}
                  </span>
                </div>
                <span class="badge badge-cet" style="font-size: 0.7rem;">${ch.cetWeightage}</span>
              </div>

              <div>
                <h3 class="chapter-title" style="margin-bottom: 6px;">${ch.title}</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                  ${ch.description}
                </p>
              </div>

              <!-- Progress Bar -->
              <div style="margin-top: 8px;">
                <div class="progress-bar-container" style="height: 5px;">
                  <div class="progress-bar-fill" style="width: ${userState.completed ? 100 : userState.progress}%; background: ${userState.completed ? 'var(--color-success, #10b981)' : subject.color};"></div>
                </div>
              </div>

              <div class="chapter-meta" style="margin-top: 8px;">
                <span style="font-size: 0.75rem; color: var(--text-muted);">⏱ ${ch.estimatedTime || '2.5 Hours'}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">📚 ${ch.modulesCount || 4} Modules</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">🎯 ${ch.practiceCount || 10} Practice MCQs</span>
              </div>

              <div class="flex-gap-2" style="margin-top: 10px;">
                <button class="btn btn-outline btn-sm toggle-subj-ch-complete-btn" data-id="${ch.id}">
                  ${userState.completed ? 'Completed ✓' : 'Mark Complete'}
                </button>
                
                ${ch.isReady ? `
                  <a href="#chapter/${subject.id}/${ch.id}" class="btn ${subject.btnClass} btn-sm" style="flex: 1;">
                    ▶ Open Chapter Lab
                  </a>
                ` : `
                  <a href="#syllabus?subject=${subject.id}&search=${encodeURIComponent(ch.title)}" class="btn ${subject.btnClass} btn-sm" style="flex: 1;">
                    📖 View Details
                  </a>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Event listeners
    container.querySelector("#subj-std-all")?.addEventListener("click", () => { selectedStd = "all"; render(); });
    container.querySelector("#subj-std-11")?.addEventListener("click", () => { selectedStd = "11"; render(); });
    container.querySelector("#subj-std-12")?.addEventListener("click", () => { selectedStd = "12"; render(); });

    container.querySelectorAll(".toggle-subj-ch-complete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const chId = btn.dataset.id;
        const newState = StorageManager.toggleChapterCompletion(chId);
        SyncManager.syncChapterCompletion(subject.id, chId, newState.completed, newState.progress);
        Bus.emit("state:changed");
        Store.showToast(
          newState.completed ? "Chapter marked as completed! 🎉" : "Chapter marked as incomplete.",
          newState.completed ? "success" : "info"
        );
        render();
      });
    });
  }

  render();
}
