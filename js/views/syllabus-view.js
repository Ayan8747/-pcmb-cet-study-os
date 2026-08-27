/**
 * Complete MHT-CET Syllabus Study OS View
 * Class 11 & Class 12 Systematic Curriculum & Mastery Tracking
 */

import { SYLLABUS_DATA } from "../data/syllabus.js";
import { FREE_RESOURCES_DATA } from "../data/resources.js";
import { StorageManager } from "../state/storage.js";
import { Store, Bus } from "../state/store.js";
import { SyncManager } from "../state/sync-manager.js";

let currentStdFilter = "all"; // 'all' | '11' | '12'
let currentSubjectFilter = "all"; // 'all' | 'physics' | 'chemistry' | 'mathematics' | 'biology'
let currentStatusFilter = "all"; // 'all' | 'not-started' | 'in-progress' | 'completed'
let searchQuery = "";
let selectedChapterId = null;

export function renderSyllabusView(container, queryParams = {}) {
  // Apply query params if passed
  if (queryParams.std) currentStdFilter = String(queryParams.std);
  if (queryParams.subject) currentSubjectFilter = String(queryParams.subject);
  if (queryParams.search) searchQuery = queryParams.search;

  function refreshUI() {
    const stats = StorageManager.getSyllabusStats(SYLLABUS_DATA);
    
    // Collect all chapters across subjects into a single list
    const allChapters = [];
    for (const [subjKey, subjObj] of Object.entries(SYLLABUS_DATA)) {
      for (const ch of subjObj.chapters || []) {
        const userState = StorageManager.getChapterState(ch.id);
        const stdVal = ch.standard || (ch.std === "Std XI" ? 11 : 12);
        allChapters.push({
          ...ch,
          subjectKey: subjKey,
          subjectName: subjObj.name,
          subjectColor: subjObj.color,
          subjectBadge: subjObj.badgeClass,
          subjectBtn: subjObj.btnClass,
          subjectIcon: subjObj.icon,
          standardNum: stdVal,
          userCompleted: userState.completed,
          userProgress: userState.progress,
          userStatus: userState.status
        });
      }
    }

    // Sort chapters by order
    allChapters.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Filter chapters
    const filteredChapters = allChapters.filter(ch => {
      // Standard filter
      if (currentStdFilter === "11" && ch.standardNum !== 11) return false;
      if (currentStdFilter === "12" && ch.standardNum !== 12) return false;

      // Subject filter
      if (currentSubjectFilter !== "all" && ch.subjectKey !== currentSubjectFilter) return false;

      // Status filter
      if (currentStatusFilter === "not-started" && ch.userStatus !== "not-started") return false;
      if (currentStatusFilter === "in-progress" && ch.userStatus !== "in-progress") return false;
      if (currentStatusFilter === "completed" && ch.userStatus !== "completed") return false;

      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = ch.title.toLowerCase().includes(q);
        const matchShort = (ch.shortTitle || "").toLowerCase().includes(q);
        const matchDesc = (ch.description || "").toLowerCase().includes(q);
        const matchSubj = ch.subjectName.toLowerCase().includes(q);
        if (!matchTitle && !matchShort && !matchDesc && !matchSubj) return false;
      }

      return true;
    });

    // Count stats for current filter selection
    const filterTotal = filteredChapters.length;
    const filterCompleted = filteredChapters.filter(c => c.userCompleted).length;
    const filterPercent = filterTotal > 0 ? Math.round((filterCompleted / filterTotal) * 100) : 0;

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="card" style="margin-bottom: var(--space-6); background: var(--bg-surface-elevated); border-left: 4px solid var(--subject-phy);">
        <div class="flex-between" style="flex-wrap: wrap; gap: 16px;">
          <div>
            <div class="flex-gap-2" style="margin-bottom: 6px;">
              <span class="badge badge-phy">MHT-CET STUDY OS</span>
              <span class="badge badge-neutral">Std XI (20%) + Std XII (80%)</span>
              <span class="badge badge-success">${stats.totalCompleted} / ${stats.totalChapters} Chapters Mastered</span>
            </div>
            <h1 style="font-size: 1.75rem; color: var(--text-primary); margin-bottom: 6px; display: flex; align-items: center; gap: 10px;">
              <span>📚</span> Complete Syllabus Navigator
            </h1>
            <p style="font-size: 0.95rem; color: var(--text-secondary); max-width: 720px; line-height: 1.5;">
              Explore, search, and systematically track your preparation across all 124+ official Physics, Chemistry, Mathematics, and Biology chapters for MHT-CET.
            </p>
          </div>

          <div style="min-width: 220px; flex: 1; max-width: 320px; background: var(--bg-surface-muted); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div class="flex-between" style="font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;">
              <span>Overall Syllabus Progress</span>
              <span style="color: var(--subject-phy);">${stats.overallPercent}%</span>
            </div>
            <div class="progress-bar-container" style="height: 10px; margin-bottom: 8px;">
              <div class="progress-bar-fill" style="width: ${stats.overallPercent}%; background: var(--subject-phy);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
              <span>Class 11: ${stats.c11Percent}%</span>
              <span>Class 12: ${stats.c12Percent}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation & Filter Bar -->
      <div class="card" style="margin-bottom: var(--space-6); padding: 16px;">
        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Top Row: Class Switcher & Search -->
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
            <!-- Class Tabs -->
            <div class="tab-group" style="display: flex; gap: 6px; background: var(--bg-surface-muted); padding: 4px; border-radius: var(--radius-md);">
              <button class="btn btn-sm ${currentStdFilter === 'all' ? 'btn-primary' : 'btn-ghost'}" id="btn-std-all">
                All Classes
              </button>
              <button class="btn btn-sm ${currentStdFilter === '11' ? 'btn-primary' : 'btn-ghost'}" id="btn-std-11">
                Class 11th
              </button>
              <button class="btn btn-sm ${currentStdFilter === '12' ? 'btn-primary' : 'btn-ghost'}" id="btn-std-12">
                Class 12th
              </button>
            </div>

            <!-- Search Field -->
            <div style="position: relative; flex: 1; max-width: 360px; min-width: 220px;">
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);">🔍</span>
              <input type="text" id="syllabus-search-input" class="search-input" style="width: 100%; padding-left: 36px; height: 38px;" placeholder="Search chapter or topic..." value="${escapeHtml(searchQuery)}">
              ${searchQuery ? `<button id="clear-search-btn" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 1rem;">✕</button>` : ''}
            </div>
          </div>

          <!-- Bottom Row: Subject & Status Filter Pills -->
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
            
            <!-- Subject Filter Pills -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-right: 4px;">Subject:</span>
              <button class="filter-pill ${currentSubjectFilter === 'all' ? 'active' : ''}" data-subject="all">All</button>
              <button class="filter-pill ${currentSubjectFilter === 'physics' ? 'active' : ''}" data-subject="physics" style="${currentSubjectFilter === 'physics' ? 'border-color: var(--subject-phy); color: var(--subject-phy);' : ''}">⚡ Physics</button>
              <button class="filter-pill ${currentSubjectFilter === 'chemistry' ? 'active' : ''}" data-subject="chemistry" style="${currentSubjectFilter === 'chemistry' ? 'border-color: var(--subject-chem); color: var(--subject-chem);' : ''}">🧪 Chemistry</button>
              <button class="filter-pill ${currentSubjectFilter === 'mathematics' ? 'active' : ''}" data-subject="mathematics" style="${currentSubjectFilter === 'mathematics' ? 'border-color: var(--subject-math); color: var(--subject-math);' : ''}">📐 Mathematics</button>
              <button class="filter-pill ${currentSubjectFilter === 'biology' ? 'active' : ''}" data-subject="biology" style="${currentSubjectFilter === 'biology' ? 'border-color: var(--subject-bio); color: var(--subject-bio);' : ''}">🌱 Biology</button>
            </div>

            <!-- Status Filter Pills -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-right: 4px;">Status:</span>
              <button class="filter-pill ${currentStatusFilter === 'all' ? 'active' : ''}" data-status="all">All</button>
              <button class="filter-pill ${currentStatusFilter === 'not-started' ? 'active' : ''}" data-status="not-started">Not Started</button>
              <button class="filter-pill ${currentStatusFilter === 'in-progress' ? 'active' : ''}" data-status="in-progress">In Progress</button>
              <button class="filter-pill ${currentStatusFilter === 'completed' ? 'active' : ''}" data-status="completed">Completed ✓</button>
            </div>

          </div>

        </div>
      </div>

      <!-- Filter Results Bar -->
      <div style="margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div style="font-size: 0.95rem; color: var(--text-primary); font-weight: 600;">
          Showing ${filterTotal} Chapters
          <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: normal; margin-left: 6px;">
            (${filterCompleted} completed • ${filterPercent}% complete)
          </span>
        </div>

        <div style="width: 180px; background: var(--bg-surface-muted); height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="width: ${filterPercent}%; height: 100%; background: var(--color-success, #10b981); transition: width 0.3s ease;"></div>
        </div>
      </div>

      <!-- Chapter Cards Grid -->
      ${filteredChapters.length === 0 ? `
        <div class="card" style="text-align: center; padding: 48px var(--space-4); margin-bottom: var(--space-8);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
          <h3 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 6px;">No matching chapters found</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">
            Try adjusting your search terms or clearing your class/subject filters.
          </p>
          <button id="reset-all-filters-btn" class="btn btn-outline btn-sm">Reset All Filters</button>
        </div>
      ` : `
        <div class="grid-2" style="margin-bottom: var(--space-8);">
          ${filteredChapters.map(ch => `
            <div class="chapter-card ${ch.userCompleted ? 'completed-card' : ''}" style="border-top: 3px solid ${ch.subjectColor}; position: relative;">
              
              <!-- Top Row: Meta & Status Badge -->
              <div class="flex-between" style="gap: 8px; align-items: flex-start; margin-bottom: 8px;">
                <div class="flex-gap-2" style="flex-wrap: wrap;">
                  <span class="badge ${ch.subjectBadge}" style="font-size: 0.7rem;">
                    ${ch.subjectIcon} ${ch.subjectName}
                  </span>
                  <span class="chapter-num" style="font-weight: 600;">
                    ${ch.std} • Ch ${ch.num}
                  </span>
                </div>

                <button class="chapter-status-toggle ${ch.userCompleted ? 'is-completed' : ''}" 
                        data-id="${ch.id}" 
                        data-subj="${ch.subjectKey}" 
                        title="${ch.userCompleted ? 'Mark as incomplete' : 'Mark as completed'}">
                  ${ch.userCompleted ? 'Completed ✓' : 'Mark Complete'}
                </button>
              </div>

              <!-- Title & Description -->
              <div style="margin-bottom: 12px;">
                <h3 class="chapter-title" style="margin-bottom: 6px; font-size: 1.1rem; color: var(--text-primary);">
                  ${ch.title}
                </h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${ch.description}
                </p>
              </div>

              <!-- Progress Bar -->
              <div style="margin-bottom: 12px;">
                <div class="flex-between" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">
                  <span>Progress</span>
                  <span>${ch.userCompleted ? '100%' : (ch.userProgress ? ch.userProgress + '%' : 'Not Started')}</span>
                </div>
                <div class="progress-bar-container" style="height: 6px;">
                  <div class="progress-bar-fill" style="width: ${ch.userCompleted ? 100 : ch.userProgress}%; background: ${ch.userCompleted ? 'var(--color-success, #10b981)' : ch.subjectColor};"></div>
                </div>
              </div>

              <!-- Meta Info (Time, CET Weightage) -->
              <div class="chapter-meta" style="margin-bottom: 14px; padding-top: 8px; border-top: 1px dashed var(--border-subtle);">
                <span style="font-size: 0.75rem; color: var(--text-muted);" title="Estimated study time">⏱ ${ch.estimatedTime || '2.5 Hours'}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);" title="MHT-CET Weightage">🎯 ${ch.cetWeightage}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">📚 ${ch.modulesCount || 4} Modules</span>
              </div>

              <!-- Actions -->
              <div class="flex-gap-2">
                <button class="btn ${ch.subjectBtn} btn-sm open-chapter-modal-btn" data-id="${ch.id}" style="flex: 1;">
                  ${ch.isReady ? '▶ Open Chapter Lab' : '📖 View Chapter Details'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Chapter Detail Modal Container -->
      <div id="chapter-detail-modal" class="modal-backdrop" style="display: none;"></div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Standard switchers
    container.querySelector("#btn-std-all")?.addEventListener("click", () => { currentStdFilter = "all"; refreshUI(); });
    container.querySelector("#btn-std-11")?.addEventListener("click", () => { currentStdFilter = "11"; refreshUI(); });
    container.querySelector("#btn-std-12")?.addEventListener("click", () => { currentStdFilter = "12"; refreshUI(); });

    // Search input
    const searchInput = container.querySelector("#syllabus-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        refreshUI();
      });
    }

    container.querySelector("#clear-search-btn")?.addEventListener("click", () => {
      searchQuery = "";
      refreshUI();
    });

    container.querySelector("#reset-all-filters-btn")?.addEventListener("click", () => {
      currentStdFilter = "all";
      currentSubjectFilter = "all";
      currentStatusFilter = "all";
      searchQuery = "";
      refreshUI();
    });

    // Subject pills
    container.querySelectorAll(".filter-pill[data-subject]").forEach(pill => {
      pill.addEventListener("click", () => {
        currentSubjectFilter = pill.dataset.subject;
        refreshUI();
      });
    });

    // Status pills
    container.querySelectorAll(".filter-pill[data-status]").forEach(pill => {
      pill.addEventListener("click", () => {
        currentStatusFilter = pill.dataset.status;
        refreshUI();
      });
    });

    // Completion toggle buttons on cards
    container.querySelectorAll(".chapter-status-toggle").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const chId = btn.dataset.id;
        const subjKey = btn.dataset.subj;
        const newState = StorageManager.toggleChapterCompletion(chId);
        
        // Sync via SyncManager if authenticated
        SyncManager.syncChapterCompletion(subjKey, chId, newState.completed, newState.progress);
        Bus.emit("state:changed");
        
        Store.showToast(
          newState.completed ? `Chapter marked as completed! 🎉` : `Chapter marked as incomplete.`,
          newState.completed ? "success" : "info"
        );
        refreshUI();
      });
    });

    // Open Chapter Modal buttons
    container.querySelectorAll(".open-chapter-modal-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const chId = btn.dataset.id;
        openChapterModal(chId);
      });
    });
  }

  function openChapterModal(chId) {
    let targetCh = null;
    let targetSubj = null;

    for (const [sKey, sObj] of Object.entries(SYLLABUS_DATA)) {
      const found = (sObj.chapters || []).find(c => c.id === chId);
      if (found) {
        targetCh = found;
        targetSubj = sObj;
        break;
      }
    }

    if (!targetCh) return;

    const userState = StorageManager.getChapterState(chId);
    const modalEl = container.querySelector("#chapter-detail-modal");
    if (!modalEl) return;

    modalEl.style.display = "flex";
    modalEl.innerHTML = `
      <div class="modal-content card" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; border-top: 4px solid ${targetSubj.color};">
        <button id="close-modal-x" style="position: absolute; right: 16px; top: 16px; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-muted);">✕</button>
        
        <div style="margin-bottom: 16px;">
          <div class="flex-gap-2" style="margin-bottom: 8px;">
            <span class="badge ${targetSubj.badgeClass}">${targetSubj.name}</span>
            <span class="badge badge-neutral">${targetCh.std} • Chapter ${targetCh.num}</span>
            <span class="badge ${userState.completed ? 'badge-success' : 'badge-neutral'}">
              ${userState.completed ? 'Completed ✓' : (userState.progress > 0 ? 'In Progress' : 'Not Started')}
            </span>
          </div>

          <h2 style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 6px;">
            ${targetCh.title}
          </h2>
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
            ${targetCh.description}
          </p>
        </div>

        <div style="background: var(--bg-surface-muted); padding: 14px; border-radius: 8px; margin-bottom: 18px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Chapter Details & CET Metrics</div>
          <div class="grid-2" style="gap: 10px; font-size: 0.85rem; color: var(--text-secondary);">
            <div><strong>⏱ Estimated Time:</strong> ${targetCh.estimatedTime || '2.5 Hours'}</div>
            <div><strong>🎯 MHT-CET Weightage:</strong> ${targetCh.cetWeightage}</div>
            <div><strong>📚 Modules Count:</strong> ${targetCh.modulesCount || 4} Modules</div>
            <div><strong>🎯 Practice Questions:</strong> ${targetCh.practiceCount || 10} MCQs</div>
          </div>

          ${targetCh.prerequisites && targetCh.prerequisites.length > 0 ? `
            <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">
              <strong>Prerequisites:</strong> ${targetCh.prerequisites.join(' • ')}
            </div>
          ` : ''}
        </div>

        <!-- Completion Toggle in Modal -->
        <div style="margin-bottom: 16px; padding: 12px; border: 1px solid var(--border-subtle); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <div>
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">Completion Status</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Mark this chapter as finished in your CET Study OS</div>
          </div>
          <button id="modal-completion-btn" class="btn ${userState.completed ? 'btn-outline' : targetSubj.btnClass} btn-sm">
            ${userState.completed ? 'Mark as Incomplete' : '✓ Mark as Complete'}
          </button>
        </div>

        <!-- Mapped Free Study Materials -->
        ${(() => {
          const mapped = FREE_RESOURCES_DATA.filter(r => r.chapterId === targetCh.id);
          if (mapped.length === 0) {
            return `
              <div style="margin-bottom: 18px; padding: 12px; background: var(--bg-surface-muted); border-radius: 8px; border: 1px dashed var(--border-subtle); font-size: 0.85rem;">
                <div class="flex-between">
                  <span style="color: var(--text-secondary);">🎁 Explore subject-level free study materials & reference portals</span>
                  <a href="#resources?subject=${targetSubj.id}" style="color: var(--text-primary); font-weight: 600; text-decoration: underline;">
                    Open Free Hub →
                  </a>
                </div>
              </div>
            `;
          }
          return `
            <div style="margin-bottom: 18px; padding: 14px; border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-surface-elevated, #FFFFFF);">
              <div class="flex-between" style="margin-bottom: 10px;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
                  🎁 Free Study Materials for this Chapter (${mapped.length})
                </span>
                <a href="#resources?subject=${targetSubj.id}" style="font-size: 0.75rem; color: var(--text-muted); text-decoration: underline;">
                  View All Hub Resources →
                </a>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${mapped.map(r => `
                  <div style="background: var(--bg-surface-muted); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div>
                      <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${r.title}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${r.provider} • Verified Free ${r.type.toUpperCase()}</div>
                    </div>
                    <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="font-size: 0.75rem;">
                      Open ↗
                    </a>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        })()}

        <!-- Action Links -->
        <div class="flex-gap-2" style="justify-content: flex-end;">
          <button id="modal-close-btn" class="btn btn-outline btn-sm">Close</button>
          ${targetCh.isReady ? `
            <a href="#chapter/${targetSubj.id}/${targetCh.id}" class="btn ${targetSubj.btnClass} btn-sm" id="modal-start-study-btn">
              ▶ Open Interactive Chapter Lab
            </a>
          ` : `
            <a href="#practice?search=${encodeURIComponent(targetCh.shortTitle || targetCh.title)}" class="btn ${targetSubj.btnClass} btn-sm" id="modal-start-practice-btn">
              🎯 Practice MCQs for this Chapter
            </a>
          `}
        </div>

        ${!targetCh.isReady ? `
          <div style="margin-top: 14px; font-size: 0.75rem; color: var(--text-muted); text-align: center; background: rgba(0,0,0,0.03); padding: 8px; border-radius: 4px;">
            ℹ Study content and interactive simulation lab for this chapter is being organized. You can still track progress and practice questions.
          </div>
        ` : ''}
      </div>
    `;

    // Modal events
    modalEl.querySelector("#close-modal-x")?.addEventListener("click", closeModal);
    modalEl.querySelector("#modal-close-btn")?.addEventListener("click", closeModal);

    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) closeModal();
    });

    modalEl.querySelector("#modal-completion-btn")?.addEventListener("click", () => {
      const newState = StorageManager.toggleChapterCompletion(chId);
      SyncManager.syncChapterCompletion(targetSubj.id, chId, newState.completed, newState.progress);
      Bus.emit("state:changed");
      Store.showToast(
        newState.completed ? `Chapter marked as completed! 🎉` : `Chapter marked as incomplete.`,
        newState.completed ? "success" : "info"
      );
      closeModal();
      refreshUI();
    });

    modalEl.querySelector("#modal-start-study-btn")?.addEventListener("click", () => {
      closeModal();
    });
    modalEl.querySelector("#modal-start-practice-btn")?.addEventListener("click", () => {
      closeModal();
    });
  }

  function closeModal() {
    const modalEl = container.querySelector("#chapter-detail-modal");
    if (modalEl) modalEl.style.display = "none";
  }

  // Initial render
  refreshUI();
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
