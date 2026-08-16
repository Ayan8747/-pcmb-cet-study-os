/**
 * Complete Chapter Experience (8-Step Learning Journey)
 * Chapter overview -> Concept map -> Interactive lesson -> Worked examples -> Guided practice -> CET MCQs -> Chapter test -> Revision summary
 */

import { KINEMATICS_CHAPTER_DATA } from "../data/physics-kinematics.js";
import { SOLID_STATE_CHAPTER_DATA } from "../data/chemistry-data.js";
import { TRIGONOMETRY_CHAPTER_DATA } from "../data/maths-data.js";
import { BIOLOGY_CHAPTER_DATA } from "../data/biology-data.js";
import { renderFormulaCard } from "../components/formula-card.js";
import { renderMCQCard } from "../components/mcq-card.js";
import { TestEngine } from "../components/test-engine.js";
import { NumberLineSimulation, MotionRunnerSimulation } from "../simulations/kinematics-1d.js";
import { KinematicGraphsEngine } from "../simulations/graphs-engine.js";
import { ProjectileSimulation } from "../simulations/projectile.js";
import { CrystalLatticeSimulation } from "../simulations/chem-crystal.js";
import { StorageManager } from "../state/storage.js";
import { Store } from "../state/store.js";

export function renderChapterView(container, subjectId, chapterId, queryStep = "overview") {
  // Select chapter dataset
  let chapter = KINEMATICS_CHAPTER_DATA;
  if (subjectId === "chemistry") chapter = SOLID_STATE_CHAPTER_DATA;
  else if (subjectId === "mathematics") chapter = TRIGONOMETRY_CHAPTER_DATA;
  else if (subjectId === "biology") chapter = BIOLOGY_CHAPTER_DATA;

  let currentStep = queryStep;
  const steps = [
    { id: "overview", name: "1. Overview", icon: "📋" },
    { id: "concept-map", name: "2. Concept Map", icon: "🗺" },
    { id: "lesson", name: "3. Interactive Lesson", icon: "🔬" },
    { id: "formulas", name: "4. Formula Lab", icon: "📐" },
    { id: "examples", name: "5. Worked Examples", icon: "💡" },
    { id: "practice", name: "6. Guided Practice", icon: "🎯" },
    { id: "test", name: "7. Chapter Test", icon: "⏱" },
    { id: "revision", name: "8. Revision Summary", icon: "🔄" }
  ];

  function renderLayout() {
    container.innerHTML = `
      <!-- Chapter Top Bar -->
      <div class="card" style="margin-bottom: var(--space-5); padding: var(--space-4) var(--space-6);">
        <div class="flex-between" style="flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="flex-gap-2" style="margin-bottom: 2px;">
              <a href="#subject/${subjectId}" class="badge ${subjectId === 'chemistry' ? 'badge-chem' : (subjectId === 'mathematics' ? 'badge-math' : (subjectId === 'biology' ? 'badge-bio' : 'badge-phy'))}">
                ← ${chapter.subject.toUpperCase()}
              </a>
              <span class="badge badge-neutral">${chapter.std} • Chapter ${chapter.num}</span>
              <span class="badge badge-cet">${chapter.cetWeightage}</span>
            </div>
            <h1 style="font-size: 1.5rem; color: var(--text-primary);">${chapter.title}</h1>
          </div>

          <div class="flex-gap-2">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Est. Time: <strong>${chapter.estimatedTime}</strong></span>
          </div>
        </div>
      </div>

      <!-- 8-Step Navigation Bar -->
      <div class="journey-nav">
        ${steps.map((s, idx) => `
          <button class="journey-step-btn ${currentStep === s.id ? 'active' : ''}" data-step="${s.id}">
            <span class="journey-step-num">${idx + 1}</span>
            <span>${s.name.split('. ')[1]}</span>
          </button>
        `).join('')}
      </div>

      <!-- Step Content Area -->
      <div id="journey-step-content"></div>
    `;

    // Bind step buttons
    container.querySelectorAll(".journey-step-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentStep = btn.getAttribute("data-step");
        container.querySelectorAll(".journey-step-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderStepContent();
      });
    });

    renderStepContent();
  }

  function renderStepContent() {
    const stepContainer = container.querySelector("#journey-step-content");
    if (!stepContainer) return;

    if (currentStep === "overview") {
      renderOverviewStep(stepContainer);
    } else if (currentStep === "concept-map") {
      renderConceptMapStep(stepContainer);
    } else if (currentStep === "lesson") {
      renderLessonStep(stepContainer);
    } else if (currentStep === "formulas") {
      renderFormulasStep(stepContainer);
    } else if (currentStep === "examples") {
      renderExamplesStep(stepContainer);
    } else if (currentStep === "practice") {
      renderPracticeStep(stepContainer);
    } else if (currentStep === "test") {
      renderTestStep(stepContainer);
    } else if (currentStep === "revision") {
      renderRevisionStep(stepContainer);
    }
  }

  // --- Step 1: Overview ---
  function renderOverviewStep(c) {
    c.innerHTML = `
      <div class="grid-2">
        <div class="card">
          <h3 class="card-title" style="margin-bottom: 12px;">🎯 Learning Objectives</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem; color: var(--text-secondary);">
            ${chapter.learningObjectives.map(obj => `
              <li style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="color: var(--color-success); font-weight: bold;">✓</span>
                <span>${obj}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="card">
          <h3 class="card-title" style="margin-bottom: 12px;">🔑 Prerequisites</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px;">
            ${chapter.prerequisites.map(prereq => `
              <li style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="color: var(--subject-phy); font-weight: bold;">•</span>
                <span>${prereq}</span>
              </li>
            `).join('')}
          </ul>

          <div style="background: var(--bg-surface-muted); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">
              MHT-CET Weightage Breakdown:
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">
              This chapter typically contributes <strong>2 to 3 questions (4 - 6 marks)</strong> in the Physics section, focusing heavily on kinematic graphs and projectile ranges.
            </p>
          </div>
        </div>
      </div>

      <div class="flex-gap-3" style="margin-top: 24px; justify-content: flex-end;">
        <button class="btn btn-primary btn-lg" id="start-journey-btn">
          Proceed to Concept Map →
        </button>
      </div>
    `;

    c.querySelector("#start-journey-btn").addEventListener("click", () => {
      currentStep = "concept-map";
      renderLayout();
    });
  }

  // --- Step 2: Concept Map ---
  function renderConceptMapStep(c) {
    c.innerHTML = `
      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 class="card-title" style="margin-bottom: 6px;">🗺 Interactive Chapter Concept Map</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
          Logical prerequisite flow and concept dependency tree. Click any concept to launch its interactive simulation module.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          ${chapter.conceptMap.map(node => `
            <div class="card" style="background: var(--bg-surface-muted); border: 1px solid var(--border-default); cursor: pointer;" onclick="location.hash='#chapter/${subjectId}/${chapterId}?step=lesson'">
              <div class="flex-between" style="margin-bottom: 6px;">
                <span class="badge badge-neutral">Stage ${node.level}</span>
                <span style="color: var(--subject-phy); font-size: 0.85rem; font-weight: bold;">Explore →</span>
              </div>
              <h4 style="font-size: 0.95rem; color: var(--text-primary);">${node.title}</h4>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="flex-between">
        <button class="btn btn-outline" id="prev-map-btn">← Overview</button>
        <button class="btn btn-primary" id="next-map-btn">Start Interactive Lesson →</button>
      </div>
    `;

    c.querySelector("#prev-map-btn").addEventListener("click", () => { currentStep = "overview"; renderLayout(); });
    c.querySelector("#next-map-btn").addEventListener("click", () => { currentStep = "lesson"; renderLayout(); });
  }

  // --- Step 3: Interactive Lesson & Simulations ---
  function renderLessonStep(c) {
    c.innerHTML = `
      <div style="display: flex; gap: 24px; flex-direction: column;">
        ${chapter.modules.map((mod, idx) => `
          <div class="card" style="padding: var(--space-6);">
            <div class="flex-between" style="margin-bottom: 12px;">
              <div class="flex-gap-2">
                <span class="badge ${subjectId === 'chemistry' ? 'badge-chem' : 'badge-phy'}">Module ${mod.num} of ${chapter.modules.length}</span>
                <h3 style="font-size: 1.25rem; color: var(--text-primary);">${mod.title}</h3>
              </div>
            </div>

            <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
              ${mod.summary}
            </p>

            <div style="margin-bottom: 20px;">
              ${mod.explanation}
            </div>

            <!-- Embedded Interactive Simulation depending on type -->
            ${mod.simulationType === 'number-line-1d' ? `
              <div id="sim-number-line-container"></div>
            ` : ''}

            ${mod.simulationType === 'velocity-runner' || mod.simulationType === 'acceleration-1d' ? `
              <div class="simulation-container">
                <div class="sim-header">
                  <div class="sim-title-group">
                    <span class="badge badge-phy">Interactive Lab</span>
                    <span class="sim-title">1D Kinematics Motion Runner</span>
                  </div>
                </div>
                <div class="sim-canvas-wrapper" style="height: 160px;">
                  <canvas id="runner-canvas-${mod.id}" class="sim-canvas"></canvas>
                </div>
                <div class="sim-controls" id="runner-controls-${mod.id}"></div>
              </div>
            ` : ''}

            ${mod.simulationType === 'graphs-engine' ? `
              <div class="simulation-container">
                <div class="sim-header">
                  <div class="sim-title-group">
                    <span class="badge badge-phy">Calculus & Graph Lab</span>
                    <span class="sim-title">Live s-t, v-t, and a-t Curve Visualizer</span>
                  </div>
                </div>
                <div class="sim-canvas-wrapper">
                  <canvas id="graphs-canvas" class="sim-canvas"></canvas>
                </div>
                <div class="sim-controls" id="graphs-controls"></div>
                <div id="graph-callout-panel" style="padding: 10px 20px; background: var(--bg-surface-muted); border-top: 1px solid var(--border-subtle);"></div>
              </div>
            ` : ''}

            ${mod.simulationType === 'projectile-2d' ? `
              <div class="simulation-container">
                <div class="sim-header">
                  <div class="sim-title-group">
                    <span class="badge badge-phy">2D Kinematics Lab</span>
                    <span class="sim-title">Projectile Motion Trajectory & Vector Simulator</span>
                  </div>
                </div>
                <div class="sim-canvas-wrapper">
                  <canvas id="projectile-canvas" class="sim-canvas"></canvas>
                </div>
                <div class="sim-controls" id="projectile-controls"></div>
                <div class="sim-telemetry" id="projectile-telemetry"></div>
              </div>
            ` : ''}

            ${mod.simulationType === 'crystal-lattice-sim' ? `
              <div class="simulation-container">
                <div class="sim-header">
                  <div class="sim-title-group">
                    <span class="badge badge-chem">3D Unit Cell Lab</span>
                    <span class="sim-title">Crystal Lattice & Coordination Geometry</span>
                  </div>
                </div>
                <div class="sim-canvas-wrapper">
                  <canvas id="chem-crystal-canvas" class="sim-canvas"></canvas>
                </div>
                <div class="sim-controls" id="chem-crystal-controls"></div>
              </div>
            ` : ''}

            <!-- Quick Check Card -->
            ${mod.quickCheck ? `
              <div style="margin-top: 24px; padding: 16px; background: var(--bg-surface-muted); border-radius: 8px; border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.8rem; font-weight: bold; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
                  Quick Check for Understanding:
                </div>
                <div id="quick-check-${mod.id}"></div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="flex-between" style="margin-top: 24px;">
        <button class="btn btn-outline" id="prev-lesson-btn">← Concept Map</button>
        <button class="btn btn-primary" id="next-lesson-btn">Open Formula Lab →</button>
      </div>
    `;

    // Instantiate Sim 1: Number line
    if (document.getElementById("sim-number-line-container")) {
      new NumberLineSimulation("sim-number-line-container");
    }

    // Instantiate Sim 2: Motion runners
    chapter.modules.forEach(mod => {
      if (mod.simulationType === 'velocity-runner' || mod.simulationType === 'acceleration-1d') {
        const cId = `runner-canvas-${mod.id}`;
        const ctrlId = `runner-controls-${mod.id}`;
        if (document.getElementById(cId)) {
          new MotionRunnerSimulation(cId, ctrlId);
        }
      }
    });

    // Instantiate Sim 3: Graphs engine
    if (document.getElementById("graphs-canvas")) {
      new KinematicGraphsEngine("graphs-canvas", "graphs-controls");
    }

    // Instantiate Sim 4: Projectile 2D
    if (document.getElementById("projectile-canvas")) {
      new ProjectileSimulation("projectile-canvas", "projectile-controls", "projectile-telemetry");
    }

    // Instantiate Sim 5: Chem Crystal
    if (document.getElementById("chem-crystal-canvas")) {
      new CrystalLatticeSimulation("chem-crystal-canvas", "chem-crystal-controls");
    }

    // Mount Quick-Check MCQ cards
    chapter.modules.forEach(mod => {
      if (mod.quickCheck) {
        const qcContainer = document.getElementById(`quick-check-${mod.id}`);
        if (qcContainer) {
          const qcCard = renderMCQCard({
            id: `qc-${mod.id}`,
            question: mod.quickCheck.question,
            options: mod.quickCheck.options,
            correct: mod.quickCheck.correct,
            explanation: mod.quickCheck.explanation,
            subject: subjectId
          });
          qcContainer.appendChild(qcCard);
        }
      }
    });

    c.querySelector("#prev-lesson-btn").addEventListener("click", () => { currentStep = "concept-map"; renderLayout(); });
    c.querySelector("#next-lesson-btn").addEventListener("click", () => { currentStep = "formulas"; renderLayout(); });
  }

  // --- Step 4: Formula Lab ---
  function renderFormulasStep(c) {
    c.innerHTML = `
      <div style="margin-bottom: var(--space-6);">
        <h3 class="card-title" style="margin-bottom: 6px;">📐 Interactive Formula Laboratory</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
          Explore standard mathematical equations. Use the dynamic variable solvers to compute results with live parameter updates.
        </p>

        <div class="grid-2" id="formula-cards-grid"></div>
      </div>

      <div class="flex-between">
        <button class="btn btn-outline" id="prev-formulas-btn">← Interactive Lesson</button>
        <button class="btn btn-primary" id="next-formulas-btn">Worked Examples →</button>
      </div>
    `;

    const grid = c.querySelector("#formula-cards-grid");
    if (grid && chapter.formulas) {
      chapter.formulas.forEach(f => {
        grid.appendChild(renderFormulaCard(f));
      });
    }

    c.querySelector("#prev-formulas-btn").addEventListener("click", () => { currentStep = "lesson"; renderLayout(); });
    c.querySelector("#next-formulas-btn").addEventListener("click", () => { currentStep = "examples"; renderLayout(); });
  }

  // --- Step 5: Worked Examples ---
  function renderExamplesStep(c) {
    c.innerHTML = `
      <div style="margin-bottom: var(--space-6);">
        <h3 class="card-title" style="margin-bottom: 6px;">💡 Step-by-Step Worked Examples</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
          Detailed step-by-step solutions breaking down problem interpretation, formula selection, and arithmetic steps.
        </p>

        ${chapter.workedExamples.map((ex, idx) => `
          <div class="worked-example-card">
            <div class="example-header">
              <span class="badge badge-phy">${ex.title}</span>
              <span class="badge badge-neutral">${ex.difficulty}</span>
            </div>
            <div class="example-statement">
              ${ex.statement}
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${ex.steps.map(s => `
                <div class="step-solution-box">
                  <div class="step-title">${s.title}</div>
                  <div style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.5;">${s.body}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="flex-between">
        <button class="btn btn-outline" id="prev-examples-btn">← Formula Lab</button>
        <button class="btn btn-primary" id="next-examples-btn">Guided Practice MCQs →</button>
      </div>
    `;

    c.querySelector("#prev-examples-btn").addEventListener("click", () => { currentStep = "formulas"; renderLayout(); });
    c.querySelector("#next-examples-btn").addEventListener("click", () => { currentStep = "practice"; renderLayout(); });
  }

  // --- Step 6: Guided Practice ---
  function renderPracticeStep(c) {
    c.innerHTML = `
      <div style="margin-bottom: var(--space-6);">
        <div class="flex-between" style="margin-bottom: 12px;">
          <div>
            <h3 class="card-title">🎯 Guided Practice Questions (${chapter.practiceMCQs.length})</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted);">
              Instant step-by-step feedback. Incorrect questions are automatically saved to your Mistake Notebook.
            </p>
          </div>
        </div>

        <div id="practice-mcqs-container"></div>
      </div>

      <div class="flex-between">
        <button class="btn btn-outline" id="prev-practice-btn">← Worked Examples</button>
        <button class="btn btn-primary" id="next-practice-btn">Take Chapter Test →</button>
      </div>
    `;

    const container = c.querySelector("#practice-mcqs-container");
    chapter.practiceMCQs.forEach((mcq, idx) => {
      container.appendChild(renderMCQCard(mcq, idx));
    });

    c.querySelector("#prev-practice-btn").addEventListener("click", () => { currentStep = "examples"; renderLayout(); });
    c.querySelector("#next-practice-btn").addEventListener("click", () => { currentStep = "test"; renderLayout(); });
  }

  // --- Step 7: Chapter Test ---
  function renderTestStep(c) {
    c.innerHTML = `
      <div id="chapter-test-mount"></div>
    `;

    new TestEngine("chapter-test-mount", {
      title: `${chapter.title} Mock Exam`,
      subject: subjectId,
      durationMinutes: 12,
      questions: chapter.chapterTest
    });
  }

  // --- Step 8: Revision Summary ---
  function renderRevisionStep(c) {
    const state = StorageManager.load();
    const mistakes = state.mistakes.filter(m => m.chapterId === chapterId && !m.mastered);

    c.innerHTML = `
      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 class="card-title" style="margin-bottom: 6px;">🔄 Chapter Mastery & Revision Summary</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
          Review core takeaways, key formulas, and unmastered mistakes for <strong>${chapter.title}</strong>.
        </p>

        <div class="grid-2" style="margin-bottom: 24px;">
          <div style="background: var(--bg-surface-muted); padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <div style="font-weight: bold; font-size: 0.9rem; color: var(--text-primary); margin-bottom: 8px;">
              ⚡ Core Takeaways:
            </div>
            <ul style="padding-left: 18px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              <li>Distance is scalar path length; Displacement is vector change in position.</li>
              <li>Slope of s-t = Velocity; Slope of v-t = Acceleration.</li>
              <li>Area under v-t = Displacement; Area under a-t = Change in Velocity.</li>
              <li>For projectiles, horizontal motion is uniform ($v_x = u\\cos\\theta$); vertical motion has $a_y = -g$.</li>
              <li>Max range occurs at $\\theta = 45^\\circ$ where $R_{max} = u^2/g$.</li>
            </ul>
          </div>

          <div style="background: var(--bg-surface-muted); padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <div class="flex-between" style="margin-bottom: 8px;">
              <span style="font-weight: bold; font-size: 0.9rem; color: var(--text-primary);">
                📖 Mistake Notebook:
              </span>
              <span class="badge ${mistakes.length > 0 ? 'badge-danger' : 'badge-success'}">
                ${mistakes.length} Unresolved
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
              ${mistakes.length > 0 
                ? `You have ${mistakes.length} recorded mistake(s) from practice or tests in this chapter.` 
                : `Great job! You have zero unresolved mistakes in this chapter.`}
            </p>
            ${mistakes.length > 0 ? `
              <a href="#revision" class="btn btn-outline btn-sm" style="color: var(--color-error); border-color: var(--color-error-border);">
                Open Mistake Notebook →
              </a>
            ` : ''}
          </div>
        </div>

        <div class="flex-gap-3" style="justify-content: center;">
          <a href="#subject/${subjectId}" class="btn btn-outline">Back to ${chapter.subject} Library</a>
          <a href="#dashboard" class="btn btn-primary">Return to Dashboard</a>
        </div>
      </div>
    `;
  }

  renderLayout();
}
