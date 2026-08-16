/**
 * Interactive MCQ Card Component
 * Instant feedback, step-by-step solution, bookmarking, and mistake recording.
 */

import { StorageManager } from "../state/storage.js";
import { Store } from "../state/store.js";
import { SyncManager } from "../state/sync-manager.js";

export function renderMCQCard(question, index, options = {}) {
  const card = document.createElement("div");
  card.className = "mcq-card";
  card.id = `mcq-${question.id}`;

  const state = StorageManager.load();
  const isBookmarked = state.bookmarks.includes(question.id);
  const previousAttempt = state.practiceHistory[question.id];

  const letters = ["A", "B", "C", "D"];

  card.innerHTML = `
    <div class="question-header">
      <div class="flex-gap-2">
        <span class="badge ${question.subject ? `badge-${question.subject.substring(0,4)}` : 'badge-phy'}">
          ${question.topic || "Practice Question"}
        </span>
        <span class="badge badge-neutral">${question.difficulty || "Medium"}</span>
        ${question.tag ? `<span class="badge badge-cet">${question.tag}</span>` : ""}
      </div>
      <button class="btn btn-outline btn-sm bookmark-btn" title="Bookmark Question" style="padding: 4px 8px;">
        ${isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
      </button>
    </div>

    <div class="question-text">
      ${index !== undefined ? `<strong>Q${index + 1}. </strong>` : ""}${question.question}
    </div>

    <div class="options-grid">
      ${question.options.map((opt, i) => `
        <div class="option-item" data-opt-index="${i}">
          <div class="option-letter">${letters[i]}</div>
          <div class="option-text" style="flex: 1;">${opt}</div>
        </div>
      `).join("")}
    </div>

    <div class="flex-between">
      <button class="btn btn-primary btn-sm check-ans-btn" disabled>Check Answer</button>
      <button class="btn btn-outline btn-sm view-sol-btn" style="display: none;">Show Explanation</button>
    </div>

    <div class="explanation-box" id="exp-${question.id}">
      <div class="explanation-title">
        <span>💡 Step-by-Step Solution & Concept Insight</span>
      </div>
      <div class="explanation-content" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
        ${question.explanation}
      </div>
    </div>
  `;

  let selectedIndex = null;
  let isAnswered = false;

  const optionElements = card.querySelectorAll(".option-item");
  const checkBtn = card.querySelector(".check-ans-btn");
  const solBtn = card.querySelector(".view-sol-btn");
  const expBox = card.querySelector(`#exp-${question.id}`);
  const bookmarkBtn = card.querySelector(".bookmark-btn");

  // Handle option selection
  optionElements.forEach(opt => {
    opt.addEventListener("click", () => {
      if (isAnswered) return;
      optionElements.forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
      selectedIndex = parseInt(opt.getAttribute("data-opt-index"), 10);
      checkBtn.removeAttribute("disabled");
    });
  });

  // Handle check answer
  checkBtn.addEventListener("click", () => {
    if (selectedIndex === null || isAnswered) return;
    isAnswered = true;
    checkBtn.style.display = "none";
    solBtn.style.display = "inline-flex";
    expBox.classList.add("show");

    const isCorrect = selectedIndex === question.correct;
    optionElements.forEach((opt, i) => {
      if (i === question.correct) {
        opt.classList.add("correct");
      } else if (i === selectedIndex && !isCorrect) {
        opt.classList.add("incorrect");
      }
    });

    // Record attempt in LocalStorage
    StorageManager.recordPracticeAttempt(question.id, isCorrect, selectedIndex, question);
    Store.refresh();

    // Sync to cloud (non-blocking — queued if offline)
    SyncManager.syncQuestionAttempt({
      questionId: question.id,
      subject: question.subject || null,
      chapterId: question.chapterId || null,
      selectedAnswer: selectedIndex,
      correct: isCorrect
    });

    if (isCorrect) {
      Store.showToast("Correct Answer! +1 Mark", "success");
    } else {
      Store.showToast("Incorrect. Added to Mistake Notebook for retry.", "warning");
    }

    if (options.onAnswer) {
      options.onAnswer(isCorrect, selectedIndex);
    }
  });

  // Toggle explanation button
  solBtn.addEventListener("click", () => {
    expBox.classList.toggle("show");
    solBtn.textContent = expBox.classList.contains("show") ? "Hide Explanation" : "Show Explanation";
  });

  // Bookmark button
  bookmarkBtn.addEventListener("click", () => {
    const bookmarked = StorageManager.toggleBookmark(question.id);
    bookmarkBtn.textContent = bookmarked ? "★ Bookmarked" : "☆ Bookmark";
    Store.showToast(bookmarked ? "Saved to Bookmarks" : "Removed from Bookmarks");
    // Sync bookmark change to cloud
    SyncManager.syncBookmark(question.id, "question", bookmarked);
  });

  return card;
}
