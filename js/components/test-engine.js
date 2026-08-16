/**
 * MHT-CET Full Test Simulator & Timed Exam Engine
 */

import { StorageManager } from "../state/storage.js";
import { Store } from "../state/store.js";
import { SyncManager } from "../state/sync-manager.js";

export class TestEngine {
  constructor(containerId, testConfig) {
    this.container = document.getElementById(containerId);
    this.title = testConfig.title || "MHT-CET Practice Test";
    this.subject = testConfig.subject || "physics";
    this.questions = testConfig.questions || [];
    this.timeLimitSeconds = testConfig.durationMinutes ? testConfig.durationMinutes * 60 : 600; // default 10 mins
    this.onFinish = testConfig.onFinish || null;

    this.currentIndex = 0;
    this.answers = {}; // { questionIndex: selectedOptionIndex }
    this.statusMap = {}; // { questionIndex: 'unvisited' | 'answered' | 'marked' }
    this.remainingSeconds = this.timeLimitSeconds;
    this.timerInterval = null;
    this.isSubmitted = false;

    // Initialize statuses
    this.questions.forEach((_, idx) => {
      this.statusMap[idx] = idx === 0 ? "unanswered" : "unvisited";
    });

    this.init();
  }

  init() {
    if (!this.container) return;
    this.startTimer();
    this.render();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds -= 1;
        this.updateTimerDisplay();
      } else {
        this.submitTest(true);
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timerEl = document.getElementById("exam-timer-display");
    if (!timerEl) return;
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    timerEl.textContent = `⏱ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  submitTest(auto = false) {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    clearInterval(this.timerInterval);

    // Calculate score
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const detailedResults = this.questions.map((q, idx) => {
      const selected = this.answers[idx];
      const isAttempted = selected !== undefined;
      const isCorrect = selected === q.correct;

      if (!isAttempted) {
        unattemptedCount++;
      } else if (isCorrect) {
        correctCount++;
        score += this.subject === "mathematics" ? 2 : 1;
      } else {
        incorrectCount++;
        // Record mistake in local storage
        StorageManager.recordPracticeAttempt(q.id || `test-q-${idx}`, false, selected, { ...q, subject: this.subject });
      }

      return {
        question: q,
        selected,
        isCorrect,
        isAttempted
      };
    });

    const totalMarks = this.questions.length * (this.subject === "mathematics" ? 2 : 1);
    const accuracy = correctCount + incorrectCount > 0 
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
      : 0;
    const timeSpent = this.timeLimitSeconds - this.remainingSeconds;

    const resultSummary = {
      id: `test-${Date.now()}`,
      title: this.title,
      subject: this.subject,
      score,
      total: totalMarks,
      accuracy,
      correctCount,
      incorrectCount,
      unattemptedCount,
      timeSpentSeconds: timeSpent,
      results: detailedResults
    };

    StorageManager.recordTestResult(resultSummary);
    Store.refresh();

    // Sync test result to cloud (non-blocking — queued if offline)
    SyncManager.syncTestResult(resultSummary);

    this.renderScorecard(resultSummary);
  }

  renderScorecard(result) {
    const mins = Math.floor(result.timeSpentSeconds / 60);
    const secs = result.timeSpentSeconds % 60;

    this.container.innerHTML = `
      <div class="scorecard-container">
        <span class="badge ${result.accuracy >= 75 ? 'badge-success' : 'badge-warning'}" style="font-size: 0.85rem; padding: 6px 12px;">
          Test Completed
        </span>
        <h2 style="margin-top: 12px; font-size: 1.5rem; color: var(--text-primary);">${result.title}</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Diagnostic Scorecard & Performance Analytics</p>

        <div class="score-hero-circle">
          <span class="score-number">${result.score}</span>
          <span class="score-label">OUT OF ${result.total}</span>
        </div>

        <div class="score-stats-grid">
          <div class="score-stat-box">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: bold;">ACCURACY</span>
            <div style="font-size: 1.2rem; font-weight: bold; color: var(--subject-phy); margin-top: 2px;">
              ${result.accuracy}%
            </div>
          </div>
          <div class="score-stat-box">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: bold;">CORRECT</span>
            <div style="font-size: 1.2rem; font-weight: bold; color: var(--color-success); margin-top: 2px;">
              ${result.correctCount}
            </div>
          </div>
          <div class="score-stat-box">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: bold;">INCORRECT</span>
            <div style="font-size: 1.2rem; font-weight: bold; color: var(--color-error); margin-top: 2px;">
              ${result.incorrectCount}
            </div>
          </div>
          <div class="score-stat-box">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: bold;">TIME SPENT</span>
            <div style="font-size: 1.2rem; font-weight: bold; color: var(--text-primary); margin-top: 2px;">
              ${mins}m ${secs}s
            </div>
          </div>
        </div>

        <div class="flex-gap-3" style="justify-content: center; margin-top: 24px;">
          <button class="btn btn-primary" id="review-solutions-btn">Review All Questions & Solutions</button>
          <a href="#dashboard" class="btn btn-outline">Back to Dashboard</a>
        </div>

        <div id="test-solutions-accordion" style="display: none; margin-top: 32px; text-align: left;">
          <h3 style="margin-bottom: 16px; font-size: 1.15rem; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
            Detailed Question Analysis:
          </h3>
          ${result.results.map((res, i) => `
            <div class="card" style="margin-bottom: 16px; border-left: 4px solid ${res.isCorrect ? 'var(--color-success)' : (res.isAttempted ? 'var(--color-error)' : 'var(--border-strong)')};">
              <div class="flex-between" style="margin-bottom: 8px;">
                <span style="font-weight: bold; font-size: 0.9rem;">Question ${i + 1}</span>
                <span class="badge ${res.isCorrect ? 'badge-success' : (res.isAttempted ? 'badge-danger' : 'badge-neutral')}">
                  ${res.isCorrect ? 'Correct (+1)' : (res.isAttempted ? 'Incorrect (0)' : 'Unattempted')}
                </span>
              </div>
              <p style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 12px;">${res.question.question}</p>
              <div style="font-size: 0.85rem; margin-bottom: 8px;">
                <strong>Your Answer:</strong> ${res.isAttempted ? `${String.fromCharCode(65 + res.selected)}. ${res.question.options[res.selected]}` : 'None'}
              </div>
              <div style="font-size: 0.85rem; color: var(--color-success); font-weight: 600; margin-bottom: 10px;">
                <strong>Correct Answer:</strong> ${String.fromCharCode(65 + res.question.correct)}. ${res.question.options[res.question.correct]}
              </div>
              <div style="background: var(--bg-surface-muted); padding: 10px; border-radius: 6px; font-size: 0.85rem; color: var(--text-secondary);">
                <strong>Explanation:</strong> ${res.question.explanation}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const reviewBtn = this.container.querySelector("#review-solutions-btn");
    const solAccordion = this.container.querySelector("#test-solutions-accordion");
    if (reviewBtn && solAccordion) {
      reviewBtn.addEventListener("click", () => {
        solAccordion.style.display = solAccordion.style.display === "none" ? "block" : "none";
        reviewBtn.textContent = solAccordion.style.display === "none" ? "Review All Questions & Solutions" : "Hide Detailed Solutions";
      });
    }
  }

  render() {
    if (!this.container || this.isSubmitted) return;

    const currentQ = this.questions[this.currentIndex];
    const selectedOpt = this.answers[this.currentIndex];
    const isMarked = this.statusMap[this.currentIndex] === "marked";
    const letters = ["A", "B", "C", "D"];

    this.container.innerHTML = `
      <div class="test-engine-container">
        <!-- Header -->
        <div class="test-header-bar">
          <div class="test-info-group">
            <span class="badge ${this.subject ? `badge-${this.subject.substring(0,4)}` : 'badge-phy'}">${this.subject.toUpperCase()}</span>
            <span class="test-name">${this.title}</span>
          </div>
          <div class="test-timer" id="exam-timer-display">
            ⏱ 00:00
          </div>
        </div>

        <!-- Body Layout -->
        <div class="test-body-layout">
          <!-- Question Area -->
          <div class="test-question-area">
            <div class="test-question-meta">
              <span style="font-weight: bold; color: var(--text-primary);">
                Question ${this.currentIndex + 1} of ${this.questions.length}
              </span>
              <span class="badge badge-neutral">Marks: +${this.subject === 'mathematics' ? '2' : '1'} / -0</span>
            </div>

            <div class="test-question-body">
              ${currentQ.question}
            </div>

            <div class="test-options-list">
              ${currentQ.options.map((opt, i) => `
                <button class="test-option-btn ${selectedOpt === i ? 'selected' : ''}" data-idx="${i}">
                  <div class="test-option-key">${letters[i]}</div>
                  <div style="flex: 1;">${opt}</div>
                </button>
              `).join('')}
            </div>

            <div class="test-footer-actions">
              <div class="flex-gap-2">
                <button class="btn btn-outline btn-sm" id="test-mark-review-btn">
                  ${isMarked ? '★ Unmark Review' : '☆ Mark for Review'}
                </button>
                <button class="btn btn-outline btn-sm" id="test-clear-btn" ${selectedOpt === undefined ? 'disabled' : ''}>
                  Clear Response
                </button>
              </div>

              <div class="flex-gap-2">
                <button class="btn btn-outline btn-sm" id="test-prev-btn" ${this.currentIndex === 0 ? 'disabled' : ''}>
                  ← Previous
                </button>
                ${this.currentIndex < this.questions.length - 1 ? `
                  <button class="btn btn-primary btn-sm" id="test-next-btn">Save & Next →</button>
                ` : `
                  <button class="btn btn-phy btn-sm" id="test-submit-btn">Submit Test ✓</button>
                `}
              </div>
            </div>
          </div>

          <!-- Question Palette Sidebar -->
          <div class="test-palette-sidebar">
            <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-primary); text-transform: uppercase;">
              Question Palette
            </div>

            <div class="palette-status-legend">
              <div class="legend-item"><div class="legend-swatch answered"></div> Answered</div>
              <div class="legend-item"><div class="legend-swatch unanswered"></div> Not Answered</div>
              <div class="legend-item"><div class="legend-swatch marked"></div> Marked Review</div>
            </div>

            <div class="palette-grid">
              ${this.questions.map((_, idx) => {
                const status = this.statusMap[idx];
                const isCur = idx === this.currentIndex;
                return `
                  <button class="palette-btn ${status} ${isCur ? 'active' : ''}" data-q-idx="${idx}">
                    ${idx + 1}
                  </button>
                `;
              }).join('')}
            </div>

            <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-primary" style="width: 100%; font-size: 0.85rem;" id="test-direct-submit">
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.updateTimerDisplay();
    this.bindEvents();
  }

  bindEvents() {
    // Option clicks
    this.container.querySelectorAll(".test-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        this.answers[this.currentIndex] = idx;
        if (this.statusMap[this.currentIndex] !== "marked") {
          this.statusMap[this.currentIndex] = "answered";
        }
        this.render();
      });
    });

    // Clear response
    const clearBtn = this.container.querySelector("#test-clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        delete this.answers[this.currentIndex];
        this.statusMap[this.currentIndex] = "unanswered";
        this.render();
      });
    }

    // Mark review
    const markBtn = this.container.querySelector("#test-mark-review-btn");
    if (markBtn) {
      markBtn.addEventListener("click", () => {
        if (this.statusMap[this.currentIndex] === "marked") {
          this.statusMap[this.currentIndex] = this.answers[this.currentIndex] !== undefined ? "answered" : "unanswered";
        } else {
          this.statusMap[this.currentIndex] = "marked";
        }
        this.render();
      });
    }

    // Next
    const nextBtn = this.container.querySelector("#test-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.currentIndex < this.questions.length - 1) {
          this.currentIndex++;
          if (this.statusMap[this.currentIndex] === "unvisited") {
            this.statusMap[this.currentIndex] = "unanswered";
          }
          this.render();
        }
      });
    }

    // Prev
    const prevBtn = this.container.querySelector("#test-prev-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.render();
        }
      });
    }

    // Palette direct jumps
    this.container.querySelectorAll(".palette-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetIdx = parseInt(btn.getAttribute("data-q-idx"), 10);
        this.currentIndex = targetIdx;
        if (this.statusMap[this.currentIndex] === "unvisited") {
          this.statusMap[this.currentIndex] = "unanswered";
        }
        this.render();
      });
    });

    // Submit
    const submitBtn = this.container.querySelector("#test-submit-btn");
    const directSubmitBtn = this.container.querySelector("#test-direct-submit");
    const handleSubmit = () => {
      if (confirm("Are you sure you want to submit your test?")) {
        this.submitTest(false);
      }
    };

    if (submitBtn) submitBtn.addEventListener("click", handleSubmit);
    if (directSubmitBtn) directSubmitBtn.addEventListener("click", handleSubmit);
  }
}
