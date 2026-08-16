/**
 * Dedicated Practice Center View
 * Multi-subject filtering (Physics, Chemistry, Maths, Biology), difficulty tiers, bookmarking.
 */

import { QUESTION_BANK } from "../data/question-bank.js";
import { KINEMATICS_CHAPTER_DATA } from "../data/physics-kinematics.js";
import { SOLID_STATE_CHAPTER_DATA } from "../data/chemistry-data.js";
import { TRIGONOMETRY_CHAPTER_DATA } from "../data/maths-data.js";
import { BIOLOGY_CHAPTER_DATA } from "../data/biology-data.js";
import { renderMCQCard } from "../components/mcq-card.js";
import { StorageManager } from "../state/storage.js";

export function renderPracticeView(container, queryParams = {}) {
  // Aggregate all questions
  const allQuestions = [
    ...QUESTION_BANK,
    ...KINEMATICS_CHAPTER_DATA.practiceMCQs.map(q => ({ ...q, subject: "physics", chapterId: "kinematics" })),
    ...SOLID_STATE_CHAPTER_DATA.practiceMCQs.map(q => ({ ...q, subject: "chemistry", chapterId: "solid-state" })),
    ...TRIGONOMETRY_CHAPTER_DATA.practiceMCQs.map(q => ({ ...q, subject: "mathematics", chapterId: "trigonometry" })),
    ...BIOLOGY_CHAPTER_DATA.practiceMCQs.map(q => ({ ...q, subject: "biology", chapterId: "plant-reproduction" }))
  ];

  let selectedSubject = queryParams.subject || "all";
  let selectedDifficulty = queryParams.difficulty || "all";
  let showOnlyBookmarked = queryParams.bookmarked === "true";
  let searchQuery = "";

  function filterQuestions() {
    const state = StorageManager.load();
    return allQuestions.filter(q => {
      if (selectedSubject !== "all" && q.subject !== selectedSubject) return false;
      if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;
      if (showOnlyBookmarked && !state.bookmarks.includes(q.id)) return false;
      if (searchQuery) {
        const text = `${q.question} ${q.topic || ''}`.toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }

  function render() {
    const filtered = filterQuestions();

    container.innerHTML = `
      <div class="card" style="margin-bottom: var(--space-6);">
        <div class="flex-between" style="flex-wrap: wrap; gap: 16px;">
          <div>
            <span class="badge badge-cet">Practice Center</span>
            <h1 style="font-size: 1.6rem; color: var(--text-primary); margin-top: 4px;">
              Topic-wise MHT-CET Question Bank
            </h1>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Solve high-yield problems with instant explanations and automatic mistake tracking.
            </p>
          </div>
          <div class="flex-gap-2">
            <span class="badge badge-neutral" style="font-size: 0.85rem; padding: 6px 12px;">
              ${filtered.length} Questions Found
            </span>
          </div>
        </div>

        <!-- Filter Deck -->
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle); display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
          <!-- Subject Filter -->
          <div class="flex-gap-2">
            <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-muted);">SUBJECT:</span>
            <select id="practice-subject-filter" style="padding: 6px 12px; background: var(--bg-input); border: 1px solid var(--border-default); border-radius: var(--radius-sm);">
              <option value="all" ${selectedSubject === 'all' ? 'selected' : ''}>All Subjects (PCMB)</option>
              <option value="physics" ${selectedSubject === 'physics' ? 'selected' : ''}>Physics</option>
              <option value="chemistry" ${selectedSubject === 'chemistry' ? 'selected' : ''}>Chemistry</option>
              <option value="mathematics" ${selectedSubject === 'mathematics' ? 'selected' : ''}>Mathematics</option>
              <option value="biology" ${selectedSubject === 'biology' ? 'selected' : ''}>Biology</option>
            </select>
          </div>

          <!-- Difficulty Filter -->
          <div class="flex-gap-2">
            <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-muted);">DIFFICULTY:</span>
            <select id="practice-diff-filter" style="padding: 6px 12px; background: var(--bg-input); border: 1px solid var(--border-default); border-radius: var(--radius-sm);">
              <option value="all" ${selectedDifficulty === 'all' ? 'selected' : ''}>All Difficulties</option>
              <option value="Easy" ${selectedDifficulty === 'Easy' ? 'selected' : ''}>Easy (Foundational)</option>
              <option value="Medium" ${selectedDifficulty === 'Medium' ? 'selected' : ''}>Medium (Standard)</option>
              <option value="Hard" ${selectedDifficulty === 'Hard' ? 'selected' : ''}>Hard (Exam Level)</option>
            </select>
          </div>

          <!-- Bookmarks toggle -->
          <button class="btn ${showOnlyBookmarked ? 'btn-primary' : 'btn-outline'} btn-sm" id="practice-bookmark-toggle">
            ${showOnlyBookmarked ? '★ Bookmarked Only' : '☆ Filter Bookmarked'}
          </button>

          <!-- Search Box -->
          <div style="flex: 1; min-width: 200px;">
            <input type="text" id="practice-search-input" placeholder="Search keywords, topics, formulas..." value="${searchQuery}" style="width: 100%; padding: 6px 12px; background: var(--bg-input); border: 1px solid var(--border-default); border-radius: var(--radius-sm);">
          </div>
        </div>
      </div>

      <!-- Question Cards Grid -->
      <div id="practice-cards-list"></div>
    `;

    const list = container.querySelector("#practice-cards-list");
    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="font-size: 1.1rem; color: var(--text-muted);">No questions match the selected filter criteria.</p>
          <button class="btn btn-outline btn-sm" id="clear-filters-btn" style="margin-top: 12px;">Reset All Filters</button>
        </div>
      `;
      const clearBtn = list.querySelector("#clear-filters-btn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          selectedSubject = "all";
          selectedDifficulty = "all";
          showOnlyBookmarked = false;
          searchQuery = "";
          render();
        });
      }
    } else {
      filtered.forEach((q, idx) => {
        list.appendChild(renderMCQCard(q, idx));
      });
    }

    // Bind listeners
    const subjFilter = container.querySelector("#practice-subject-filter");
    const diffFilter = container.querySelector("#practice-diff-filter");
    const bmToggle = container.querySelector("#practice-bookmark-toggle");
    const searchInput = container.querySelector("#practice-search-input");

    if (subjFilter) {
      subjFilter.addEventListener("change", (e) => {
        selectedSubject = e.target.value;
        render();
      });
    }

    if (diffFilter) {
      diffFilter.addEventListener("change", (e) => {
        selectedDifficulty = e.target.value;
        render();
      });
    }

    if (bmToggle) {
      bmToggle.addEventListener("click", () => {
        showOnlyBookmarked = !showOnlyBookmarked;
        render();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        render();
      });
    }
  }

  render();
}
