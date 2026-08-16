/**
 * MHT-CET Exam Center & Mock Test Launcher
 */

import { TestEngine } from "../components/test-engine.js";
import { KINEMATICS_CHAPTER_DATA } from "../data/physics-kinematics.js";
import { SOLID_STATE_CHAPTER_DATA } from "../data/chemistry-data.js";
import { TRIGONOMETRY_CHAPTER_DATA } from "../data/maths-data.js";
import { BIOLOGY_CHAPTER_DATA } from "../data/biology-data.js";
import { QUESTION_BANK } from "../data/question-bank.js";
import { StorageManager } from "../state/storage.js";

export function renderTestView(container, queryParams = {}) {
  let activeTest = null;

  const mockTests = [
    {
      id: "mock-kinematics",
      title: "Physics: Kinematics & 2D Motion Mock",
      subject: "physics",
      badge: "badge-phy",
      questionsCount: 10,
      durationMinutes: 12,
      description: "Timed chapter test covering rectilinear motion, displacement vectors, graph calculus, and projectile trajectories.",
      getQuestions: () => KINEMATICS_CHAPTER_DATA.chapterTest
    },
    {
      id: "mock-solid-state",
      title: "Chemistry: Solid State Unit Cell Exam",
      subject: "chemistry",
      badge: "badge-chem",
      questionsCount: 8,
      durationMinutes: 10,
      description: "Timed test on crystal geometry, SC/BCC/FCC packing fractions, Bragg's law, and point defect equilibria.",
      getQuestions: () => [
        ...SOLID_STATE_CHAPTER_DATA.chapterTest,
        ...QUESTION_BANK.filter(q => q.chapterId === "solid-state")
      ]
    },
    {
      id: "mock-trigonometry",
      title: "Mathematics: Trigonometric Functions Test",
      subject: "mathematics",
      badge: "badge-math",
      questionsCount: 10,
      durationMinutes: 15,
      description: "Timed test on compound angles, double angle transformations, unit circle identities, and periodic graph values (+2 marks each).",
      getQuestions: () => [
        ...TRIGONOMETRY_CHAPTER_DATA.chapterTest,
        ...QUESTION_BANK.filter(q => q.subject === "mathematics")
      ]
    },
    {
      id: "mock-pcmb-full",
      title: "Full MHT-CET PCMB Grand Diagnostic Test",
      subject: "mixed",
      badge: "badge-cet",
      questionsCount: 15,
      durationMinutes: 20,
      description: "Comprehensive mixed-subject examination testing Physics, Chemistry, Mathematics, and Biology concepts simultaneously.",
      getQuestions: () => [
        ...KINEMATICS_CHAPTER_DATA.chapterTest.slice(0, 4),
        ...SOLID_STATE_CHAPTER_DATA.practiceMCQs.slice(0, 4),
        ...TRIGONOMETRY_CHAPTER_DATA.practiceMCQs.slice(0, 4),
        ...BIOLOGY_CHAPTER_DATA.practiceMCQs.slice(0, 3)
      ]
    }
  ];

  function renderLauncher() {
    const state = StorageManager.load();
    const pastTests = state.testScores || [];

    container.innerHTML = `
      <div class="card" style="margin-bottom: var(--space-6);">
        <div class="flex-between" style="flex-wrap: wrap; gap: 16px;">
          <div>
            <span class="badge badge-cet">Exam Center</span>
            <h1 style="font-size: 1.6rem; color: var(--text-primary); margin-top: 4px;">
              MHT-CET Timed Exam Simulator
            </h1>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Realistic CET exam environment (+2 for Mathematics, +1 for Physics/Chemistry/Biology, 0 negative marking).
            </p>
          </div>
        </div>
      </div>

      <!-- Test Catalog Grid -->
      <div style="margin-bottom: var(--space-4);">
        <h2 style="font-size: 1.25rem; color: var(--text-primary);">Available Mock Tests</h2>
      </div>

      <div class="grid-2" style="margin-bottom: var(--space-8);">
        ${mockTests.map(t => `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="flex-between" style="margin-bottom: 8px;">
                <span class="badge ${t.badge}">${t.subject.toUpperCase()}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: bold;">⏱ ${t.durationMinutes} Mins</span>
              </div>
              <h3 style="font-size: 1.15rem; color: var(--text-primary); margin-bottom: 6px;">${t.title}</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
                ${t.description}
              </p>
            </div>

            <div class="flex-between" style="border-top: 1px dashed var(--border-subtle); padding-top: 12px;">
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">
                📝 ${t.questionsCount} Questions
              </span>
              <button class="btn btn-primary btn-sm launch-test-btn" data-test-id="${t.id}">
                Launch Exam →
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Past Exam History -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 12px;">📜 Past Mock Test Performance History</h3>
        ${pastTests.length === 0 ? `
          <p style="font-size: 0.9rem; color: var(--text-muted);">No mock tests completed yet. Launch a test above to record your score!</p>
        ` : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
              <thead>
                <tr style="background: var(--bg-surface-muted); text-align: left;">
                  <th style="padding: 10px; border: 1px solid var(--border-subtle);">Test Name</th>
                  <th style="padding: 10px; border: 1px solid var(--border-subtle);">Score</th>
                  <th style="padding: 10px; border: 1px solid var(--border-subtle);">Accuracy</th>
                  <th style="padding: 10px; border: 1px solid var(--border-subtle);">Date Completed</th>
                </tr>
              </thead>
              <tbody>
                ${pastTests.map(pt => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid var(--border-subtle); font-weight: 600;">${pt.title}</td>
                    <td style="padding: 10px; border: 1px solid var(--border-subtle);">${pt.score} / ${pt.total}</td>
                    <td style="padding: 10px; border: 1px solid var(--border-subtle);">
                      <span class="badge ${pt.accuracy >= 75 ? 'badge-success' : 'badge-warning'}">${pt.accuracy}%</span>
                    </td>
                    <td style="padding: 10px; border: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.8rem;">
                      ${new Date(pt.date).toLocaleDateString()}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    container.querySelectorAll(".launch-test-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const testId = btn.getAttribute("data-test-id");
        const found = mockTests.find(t => t.id === testId);
        if (found) {
          startTest(found);
        }
      });
    });
  }

  function startTest(testObj) {
    container.innerHTML = `<div id="active-test-container"></div>`;
    new TestEngine("active-test-container", {
      title: testObj.title,
      subject: testObj.subject,
      durationMinutes: testObj.durationMinutes,
      questions: testObj.getQuestions(),
      onFinish: () => renderLauncher()
    });
  }

  renderLauncher();
}
