/**
 * Revision & Mistake Review Center
 * Searchable Formula Book and Mistake Notebook with instant Retry mode.
 */

import { StorageManager } from "../state/storage.js";
import { Store } from "../state/store.js";
import { renderFormulaCard } from "../components/formula-card.js";
import { KINEMATICS_CHAPTER_DATA } from "../data/physics-kinematics.js";
import { SOLID_STATE_CHAPTER_DATA } from "../data/chemistry-data.js";
import { TRIGONOMETRY_CHAPTER_DATA } from "../data/maths-data.js";
import { BIOLOGY_CHAPTER_DATA } from "../data/biology-data.js";

export function renderRevisionView(container, queryParams = {}) {
  let activeTab = queryParams.tab || "mistakes"; // 'mistakes' | 'formulas' | 'facts'
  let formulaSearch = "";

  // Combine formulas across all chapters
  const allFormulas = [
    ...KINEMATICS_CHAPTER_DATA.formulas.map(f => ({ ...f, subject: "Physics: Kinematics" })),
    ...SOLID_STATE_CHAPTER_DATA.formulas.map(f => ({ ...f, subject: "Chemistry: Solid State" })),
    ...TRIGONOMETRY_CHAPTER_DATA.formulas.map(f => ({ ...f, subject: "Mathematics: Trigonometry" })),
    ...BIOLOGY_CHAPTER_DATA.formulas.map(f => ({ ...f, subject: "Biology: Plant Reproduction" }))
  ];

  function render() {
    const state = StorageManager.load();
    const mistakes = state.mistakes;
    const unmasteredCount = mistakes.filter(m => !m.mastered).length;

    container.innerHTML = `
      <div class="card" style="margin-bottom: var(--space-6);">
        <div class="flex-between" style="flex-wrap: wrap; gap: 16px;">
          <div>
            <span class="badge badge-cet">Revision Hub</span>
            <h1 style="font-size: 1.6rem; color: var(--text-primary); margin-top: 4px;">
              Formulas & Mistake Notebook
            </h1>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Review recorded pitfalls, re-attempt mistakes, and use dynamic formula calculators.
            </p>
          </div>

          <div class="flex-gap-2">
            <span class="badge ${unmasteredCount > 0 ? 'badge-danger' : 'badge-success'}">
              ${unmasteredCount} Active Mistake${unmasteredCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <!-- Revision Tabs -->
        <div class="tabs-container" style="margin-top: 20px; margin-bottom: 0;">
          <button class="tab-btn ${activeTab === 'mistakes' ? 'active' : ''}" data-tab="mistakes">
            📖 Mistake Notebook (${unmasteredCount})
          </button>
          <button class="tab-btn ${activeTab === 'formulas' ? 'active' : ''}" data-tab="formulas">
            📐 Formula Book & Solvers (${allFormulas.length})
          </button>
          <button class="tab-btn ${activeTab === 'facts' ? 'active' : ''}" data-tab="facts">
            ⚡ Key Facts & High-Yield Summary
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div id="revision-tab-content"></div>
    `;

    // Bind tab clicks
    container.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeTab = btn.getAttribute("data-tab");
        render();
      });
    });

    const tabContainer = container.querySelector("#revision-tab-content");
    if (activeTab === "mistakes") {
      renderMistakesTab(tabContainer, mistakes);
    } else if (activeTab === "formulas") {
      renderFormulasTab(tabContainer);
    } else if (activeTab === "facts") {
      renderFactsTab(tabContainer);
    }
  }

  function renderMistakesTab(c, mistakes) {
    if (mistakes.length === 0) {
      c.innerHTML = `
        <div class="card" style="text-align: center; padding: 48px;">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">🎉</span>
          <h3 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 6px;">Your Mistake Notebook is Clean!</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 16px;">
            Any questions answered incorrectly during practice sessions or mock tests will automatically appear here for focused re-attempt.
          </p>
          <a href="#practice" class="btn btn-primary btn-sm">Solve Practice MCQs</a>
        </div>
      `;
      return;
    }

    c.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${mistakes.map((m, idx) => `
          <div class="mistake-card" id="mistake-box-${m.id}" style="border-left-color: ${m.mastered ? 'var(--color-success)' : 'var(--color-error)'};">
            <div class="flex-between" style="margin-bottom: 10px;">
              <div class="flex-gap-2">
                <span class="badge badge-phy">${m.subject.toUpperCase()}</span>
                <span class="badge ${m.mastered ? 'badge-success' : 'badge-danger'}">
                  ${m.mastered ? '✓ Mastered' : `Wrong (${m.wrongCount}x)`}
                </span>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">
                Logged: ${new Date(m.timestamp).toLocaleDateString()}
              </span>
            </div>

            <p style="font-size: 0.95rem; font-weight: 500; color: var(--text-primary); margin-bottom: 12px;">
              ${m.question}
            </p>

            <div class="options-grid" style="margin-bottom: 12px;">
              ${m.options.map((opt, optIdx) => `
                <button class="option-item retry-opt-btn" data-mistake-id="${m.id}" data-opt-idx="${optIdx}" ${m.mastered ? 'disabled' : ''}>
                  <div class="option-letter">${String.fromCharCode(65 + optIdx)}</div>
                  <div style="flex: 1; text-align: left;">${opt}</div>
                </button>
              `).join('')}
            </div>

            <div style="background: var(--bg-surface-muted); padding: 12px; border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary); border: 1px solid var(--border-subtle);">
              <strong>Solution & Concept Insight:</strong><br>
              ${m.explanation}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Bind retry clicks
    c.querySelectorAll(".retry-opt-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const mistakeId = btn.getAttribute("data-mistake-id");
        const selectedIdx = parseInt(btn.getAttribute("data-opt-idx"), 10);
        const m = mistakes.find(item => item.id === mistakeId);
        if (!m) return;

        if (selectedIdx === m.correct) {
          btn.classList.add("correct");
          StorageManager.recordPracticeAttempt(m.id, true, selectedIdx, m);
          Store.showToast("Mistake Mastered! Marked as Resolved.", "success");
          setTimeout(() => render(), 700);
        } else {
          btn.classList.add("incorrect");
          Store.showToast("Still incorrect. Review explanation below.", "warning");
        }
      });
    });
  }

  function renderFormulasTab(c) {
    const filtered = allFormulas.filter(f => {
      if (!formulaSearch) return true;
      return `${f.name} ${f.subject}`.toLowerCase().includes(formulaSearch.toLowerCase());
    });

    c.innerHTML = `
      <div style="margin-bottom: 20px;">
        <input type="text" id="formula-search-box" placeholder="Search formula name (e.g., Projectile, Velocity, Unit Cell)..." value="${formulaSearch}" style="width: 100%; max-width: 400px; padding: 8px 14px; background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-md);">
      </div>

      <div class="grid-2" id="all-formulas-grid"></div>
    `;

    const grid = c.querySelector("#all-formulas-grid");
    filtered.forEach(f => {
      grid.appendChild(renderFormulaCard(f));
    });

    const searchBox = c.querySelector("#formula-search-box");
    if (searchBox) {
      searchBox.addEventListener("input", (e) => {
        formulaSearch = e.target.value;
        renderFormulasTab(c);
      });
    }
  }

  function renderFactsTab(c) {
    c.innerHTML = `
      <div class="grid-2">
        <div class="card">
          <span class="badge badge-phy" style="margin-bottom: 8px;">Physics Mechanics</span>
          <h3 class="card-title" style="margin-bottom: 10px;">Kinematics Key Principles</h3>
          <ul style="padding-left: 18px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.7;">
            <li>Distance is always $\\ge$ |Displacement|. Equality holds for straight unidirectional motion.</li>
            <li>Average speed for equal distances = Harmonic Mean: $\\frac{2v_1v_2}{v_1+v_2}$.</li>
            <li>Average speed for equal time intervals = Arithmetic Mean: $\\frac{v_1+v_2}{2}$.</li>
            <li>Slope of $s-t$ graph is velocity ($ds/dt$); Slope of $v-t$ is acceleration ($dv/dt$).</li>
            <li>Area under $v-t$ graph represents displacement; Area under $a-t$ is velocity change.</li>
            <li>Projectile range is equal for complementary angles: $\\theta$ and $(90^\\circ - \\theta)$.</li>
            <li>Range and Max Height relation: $R = 4H\\cot\\theta$. At $\\theta = 45^\\circ$, $R = 4H$.</li>
          </ul>
        </div>

        <div class="card">
          <span class="badge badge-chem" style="margin-bottom: 8px;">Physical Chemistry</span>
          <h3 class="card-title" style="margin-bottom: 10px;">Solid State Fast Facts</h3>
          <ul style="padding-left: 18px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.7;">
            <li>Simple Cubic (SC): $Z = 1$, $a = 2r$, Packing = $52.4\\%$, Coordination No = 6.</li>
            <li>Body-Centered (BCC): $Z = 2$, $\\sqrt{3}a = 4r$, Packing = $68.0\\%$, Coordination No = 8.</li>
            <li>Face-Centered (FCC): $Z = 4$, $\\sqrt{2}a = 4r$, Packing = $74.0\\%$, Coordination No = 12.</li>
            <li>Schottky Defect: Equal cations and anions missing $\\implies$ Density <strong>decreases</strong>.</li>
            <li>Frenkel Defect: Ion occupies interstitial site $\\implies$ Density <strong>remains unchanged</strong>.</li>
          </ul>
        </div>
      </div>
    `;
  }

  render();
}
