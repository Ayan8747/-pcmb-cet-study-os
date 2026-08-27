/**
 * Free Study Materials View — PCMB Interactive MHT-CET Study OS
 * Curated, verified, chapter-aware free educational resources.
 */

import { FREE_RESOURCES_DATA } from "../data/resources.js";
import { SYLLABUS_DATA } from "../data/syllabus.js";
import { StorageManager } from "../state/storage.js";
import { SyncManager } from "../state/sync-manager.js";
import { Store, Bus } from "../state/store.js";

let selectedTab = "catalog"; // 'catalog' | 'bookmarks' | 'recent'
let selectedStd = "all";     // 'all' | '11' | '12'
let selectedSubject = "all"; // 'all' | 'physics' | 'chemistry' | 'mathematics' | 'biology'
let selectedType = "all";    // 'all' | 'lecture' | 'one-shot' | 'notes' | 'formulas' | 'practice' | 'official'
let searchQuery = "";

// Helper to look up chapter title from chapterId
function getChapterTitle(chapterId) {
  if (!chapterId) return null;
  for (const sKey in SYLLABUS_DATA) {
    const subj = SYLLABUS_DATA[sKey];
    if (subj && subj.chapters) {
      const ch = subj.chapters.find(c => c.id === chapterId);
      if (ch) return { title: ch.title, std: ch.std, subject: subj.name, color: subj.color };
    }
  }
  return null;
}

export function renderResourcesView(container, queryParams = {}) {
  if (queryParams.subject) selectedSubject = queryParams.subject;
  if (queryParams.std) selectedStd = queryParams.std;
  if (queryParams.type) selectedType = queryParams.type;

  function render() {
    const bookmarkedIds = StorageManager.getBookmarkedResources();
    const recentIds = StorageManager.getRecentlyViewedResources();

    // Filter catalog
    let list = [...FREE_RESOURCES_DATA];

    if (selectedTab === "bookmarks") {
      list = list.filter(r => bookmarkedIds.includes(r.id));
    } else if (selectedTab === "recent") {
      list = recentIds.map(id => list.find(r => r.id === id)).filter(Boolean);
    }

    // Apply class filter
    if (selectedStd === "11") list = list.filter(r => r.standard === 11);
    if (selectedStd === "12") list = list.filter(r => r.standard === 12);

    // Apply subject filter
    if (selectedSubject !== "all") list = list.filter(r => r.subject === selectedSubject);

    // Apply type filter
    if (selectedType !== "all") {
      if (selectedType === "lecture") list = list.filter(r => r.type === "lecture" || r.type === "concept");
      else if (selectedType === "one-shot") list = list.filter(r => r.type === "one-shot");
      else if (selectedType === "notes") list = list.filter(r => r.type === "notes");
      else if (selectedType === "formulas") list = list.filter(r => r.type === "formulas");
      else if (selectedType === "practice") list = list.filter(r => r.type === "practice" || r.type === "pyqs");
      else if (selectedType === "official") list = list.filter(r => r.type === "official" || r.sourceType === "official");
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => {
        const chInfo = getChapterTitle(r.chapterId);
        const chTitle = chInfo ? chInfo.title.toLowerCase() : "";
        return r.title.toLowerCase().includes(q) ||
               r.provider.toLowerCase().includes(q) ||
               r.description.toLowerCase().includes(q) ||
               chTitle.includes(q);
      });
    }

    const typeCounts = {
      all: FREE_RESOURCES_DATA.length,
      lecture: FREE_RESOURCES_DATA.filter(r => r.type === 'lecture' || r.type === 'concept').length,
      notes: FREE_RESOURCES_DATA.filter(r => r.type === 'notes').length,
      formulas: FREE_RESOURCES_DATA.filter(r => r.type === 'formulas').length,
      practice: FREE_RESOURCES_DATA.filter(r => r.type === 'practice' || r.type === 'pyqs').length,
      official: FREE_RESOURCES_DATA.filter(r => r.type === 'official' || r.sourceType === 'official').length
    };

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="card" style="margin-bottom: var(--space-6); border-left: 4px solid var(--subject-phy); background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);">
        <div class="flex-between" style="flex-wrap: wrap; gap: 16px;">
          <div>
            <div class="flex-gap-2" style="margin-bottom: 6px;">
              <span class="badge badge-success">100% FREE ACCESS</span>
              <span class="badge badge-phy">VERIFIED SOURCES</span>
              <span class="badge badge-neutral">${FREE_RESOURCES_DATA.length} Curated Material Units</span>
            </div>
            <h1 style="font-size: 1.75rem; color: var(--text-primary); margin-bottom: 6px;">
              🎁 Free Study Materials Hub
            </h1>
            <p style="font-size: 0.95rem; color: var(--text-secondary); max-width: 720px;">
              Access official Maharashtra State Board materials, DIKSHA/eBalbharati tools, open educational textbooks, worked numerical guides, and reference formula sheets.
            </p>
          </div>

          <div class="flex-gap-2">
            <a href="#syllabus" class="btn btn-outline">Explore Syllabus OS →</a>
          </div>
        </div>
      </div>

      <!-- Top Section Tabs: Catalog | Saved | Recent -->
      <div class="tabs-container" style="margin-bottom: var(--space-4);">
        <button class="tab-btn ${selectedTab === 'catalog' ? 'active' : ''}" id="res-tab-catalog">
          📚 Resource Catalog (${FREE_RESOURCES_DATA.length})
        </button>
        <button class="tab-btn ${selectedTab === 'bookmarks' ? 'active' : ''}" id="res-tab-bookmarks">
          ⭐ Saved / Bookmarked (${bookmarkedIds.length})
        </button>
        <button class="tab-btn ${selectedTab === 'recent' ? 'active' : ''}" id="res-tab-recent">
          🕒 Recently Opened (${recentIds.length})
        </button>
      </div>

      <!-- Search & Filters Container -->
      <div class="card" style="margin-bottom: var(--space-6); padding: 16px;">
        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Search Bar & Class Selector -->
          <div class="flex-between" style="flex-wrap: wrap; gap: 12px;">
            <div style="flex: 1; min-width: 260px;">
              <input type="text" id="res-search-input" class="form-input" 
                     placeholder="Search resources, topics, providers, or chapter names..." 
                     value="${searchQuery}" style="width: 100%; font-size: 0.9rem;">
            </div>

            <!-- Class Selector Pills -->
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-right: 4px;">Class:</span>
              <button class="filter-pill ${selectedStd === 'all' ? 'active' : ''}" id="std-pill-all">All</button>
              <button class="filter-pill ${selectedStd === '11' ? 'active' : ''}" id="std-pill-11">Class 11</button>
              <button class="filter-pill ${selectedStd === '12' ? 'active' : ''}" id="std-pill-12">Class 12</button>
            </div>
          </div>

          <!-- Subject Pills -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; border-top: 1px dashed var(--border-subtle); padding-top: 12px;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-right: 4px;">Subject:</span>
            <button class="filter-pill ${selectedSubject === 'all' ? 'active' : ''}" id="subj-pill-all">All Subjects</button>
            <button class="filter-pill ${selectedSubject === 'physics' ? 'active' : ''}" id="subj-pill-physics">⚡ Physics</button>
            <button class="filter-pill ${selectedSubject === 'chemistry' ? 'active' : ''}" id="subj-pill-chemistry">🧪 Chemistry</button>
            <button class="filter-pill ${selectedSubject === 'mathematics' ? 'active' : ''}" id="subj-pill-mathematics">📐 Mathematics</button>
            <button class="filter-pill ${selectedSubject === 'biology' ? 'active' : ''}" id="subj-pill-biology">🌱 Biology</button>
          </div>

          <!-- Resource Type Filters -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-right: 4px;">Type:</span>
            <button class="filter-pill ${selectedType === 'all' ? 'active' : ''}" id="type-pill-all">All Types</button>
            <button class="filter-pill ${selectedType === 'lecture' ? 'active' : ''}" id="type-pill-lecture">🎥 Lectures</button>
            <button class="filter-pill ${selectedType === 'notes' ? 'active' : ''}" id="type-pill-notes">📄 Notes</button>
            <button class="filter-pill ${selectedType === 'formulas' ? 'active' : ''}" id="type-pill-formulas">📐 Formula Sheets</button>
            <button class="filter-pill ${selectedType === 'practice' ? 'active' : ''}" id="type-pill-practice">🎯 Practice & PYQs</button>
            <button class="filter-pill ${selectedType === 'official' ? 'active' : ''}" id="type-pill-official">🏆 Official Portals</button>
          </div>
        </div>
      </div>

      <!-- Resource Grid -->
      ${list.length > 0 ? `
        <div class="grid-2" style="margin-bottom: var(--space-8);">
          ${list.map(r => {
            const chInfo = getChapterTitle(r.chapterId);
            const isSaved = bookmarkedIds.includes(r.id);
            const badgeClass = r.subject === 'physics' ? 'badge-phy' :
                               r.subject === 'chemistry' ? 'badge-chem' :
                               r.subject === 'mathematics' ? 'badge-math' : 'badge-bio';

            return `
              <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid ${chInfo ? chInfo.color : 'var(--text-primary)'}; padding: 18px;">
                <div>
                  <div class="flex-between" style="margin-bottom: 8px;">
                    <div class="flex-gap-2">
                      <span class="badge ${badgeClass}">${r.subject.toUpperCase()} • STD ${r.standard}</span>
                      <span class="badge badge-neutral" style="text-transform: capitalize;">${r.type}</span>
                    </div>
                    <span class="badge badge-success" style="font-size: 0.7rem;">Verified Free ✓</span>
                  </div>

                  <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px; line-height: 1.35;">
                    ${r.title}
                  </h3>

                  ${chInfo ? `
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 500;">
                      📖 Chapter: <a href="#syllabus?search=${encodeURIComponent(chInfo.title)}" style="color: var(--text-primary); text-decoration: underline;">${chInfo.title}</a>
                    </div>
                  ` : `
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 500;">
                      🌐 Scope: General / Subject-Level Resource
                    </div>
                  `}

                  <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
                    ${r.description}
                  </p>
                </div>

                <div style="border-top: 1px dashed var(--border-subtle); padding-top: 12px;">
                  <div class="flex-between" style="margin-bottom: 10px; font-size: 0.75rem; color: var(--text-muted);">
                    <span>Provider: <strong>${r.provider}</strong></span>
                    <span>Source: <strong>${r.sourceType.toUpperCase()}</strong></span>
                  </div>

                  <div class="flex-gap-2">
                    <button class="btn btn-outline btn-sm toggle-bookmark-btn" data-id="${r.id}" style="font-size: 0.8rem;">
                      ${isSaved ? '⭐ Bookmarked' : '☆ Save Resource'}
                    </button>
                    
                    <a href="${r.url}" target="_blank" rel="noopener noreferrer" 
                       class="btn btn-primary btn-sm open-res-btn" data-id="${r.id}" style="flex: 1; text-align: center;">
                      Open Resource ↗
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="card" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
          <h3 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 6px;">No resources found</h3>
          <p style="font-size: 0.9rem; max-width: 480px; margin: 0 auto 16px;">
            ${selectedTab === 'bookmarks' ? 'You have not saved any study resources yet. Click "☆ Save Resource" on any card in the catalog to bookmark it.' :
              selectedTab === 'recent' ? 'You have not opened any external resources yet in this session.' :
              'No curated resources match your selected search or filter criteria.'}
          </p>
          <button class="btn btn-outline btn-sm" id="reset-res-filters">Reset All Filters</button>
        </div>
      `}
    `;

    // Event listeners
    container.querySelector("#res-tab-catalog")?.addEventListener("click", () => { selectedTab = "catalog"; render(); });
    container.querySelector("#res-tab-bookmarks")?.addEventListener("click", () => { selectedTab = "bookmarks"; render(); });
    container.querySelector("#res-tab-recent")?.addEventListener("click", () => { selectedTab = "recent"; render(); });

    container.querySelector("#res-search-input")?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      render();
    });

    container.querySelector("#std-pill-all")?.addEventListener("click", () => { selectedStd = "all"; render(); });
    container.querySelector("#std-pill-11")?.addEventListener("click", () => { selectedStd = "11"; render(); });
    container.querySelector("#std-pill-12")?.addEventListener("click", () => { selectedStd = "12"; render(); });

    container.querySelector("#subj-pill-all")?.addEventListener("click", () => { selectedSubject = "all"; render(); });
    container.querySelector("#subj-pill-physics")?.addEventListener("click", () => { selectedSubject = "physics"; render(); });
    container.querySelector("#subj-pill-chemistry")?.addEventListener("click", () => { selectedSubject = "chemistry"; render(); });
    container.querySelector("#subj-pill-mathematics")?.addEventListener("click", () => { selectedSubject = "mathematics"; render(); });
    container.querySelector("#subj-pill-biology")?.addEventListener("click", () => { selectedSubject = "biology"; render(); });

    container.querySelector("#type-pill-all")?.addEventListener("click", () => { selectedType = "all"; render(); });
    container.querySelector("#type-pill-lecture")?.addEventListener("click", () => { selectedType = "lecture"; render(); });
    container.querySelector("#type-pill-notes")?.addEventListener("click", () => { selectedType = "notes"; render(); });
    container.querySelector("#type-pill-formulas")?.addEventListener("click", () => { selectedType = "formulas"; render(); });
    container.querySelector("#type-pill-practice")?.addEventListener("click", () => { selectedType = "practice"; render(); });
    container.querySelector("#type-pill-official")?.addEventListener("click", () => { selectedType = "official"; render(); });

    container.querySelector("#reset-res-filters")?.addEventListener("click", () => {
      selectedStd = "all";
      selectedSubject = "all";
      selectedType = "all";
      searchQuery = "";
      render();
    });

    // Bookmark & Open Resource Handlers
    container.querySelectorAll(".toggle-bookmark-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const isNowBookmarked = StorageManager.toggleResourceBookmark(id);
        SyncManager.syncBookmark(id, "resource", isNowBookmarked);
        Bus.emit("state:changed");
        Store.showToast(
          isNowBookmarked ? "Resource saved to your bookmarks! ⭐" : "Resource removed from bookmarks.",
          isNowBookmarked ? "success" : "info"
        );
        render();
      });
    });

    container.querySelectorAll(".open-res-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        StorageManager.recordResourceView(id);
      });
    });
  }

  render();
}
