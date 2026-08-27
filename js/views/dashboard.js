/**
 * Dashboard View for PCMB Interactive CET
 * Answers: What did I study? What am I weak at? What should I do next?
 * Integrated with Syllabus Study OS metrics.
 */

import { StorageManager } from "../state/storage.js";
import { SYLLABUS_DATA } from "../data/syllabus.js";
import { FREE_RESOURCES_DATA } from "../data/resources.js";

export function renderDashboard(container) {
  const state = StorageManager.load();
  const mistakes = state.mistakes.filter(m => !m.mastered);
  const attemptedCount = Object.keys(state.practiceHistory).length;
  const correctCount = Object.values(state.practiceHistory).filter(p => p.correct).length;
  const overallAccuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 85;

  // Syllabus stats
  const sylStats = StorageManager.getSyllabusStats(SYLLABUS_DATA);

  container.innerHTML = `
    <!-- Top Personalized Action Hero -->
    <div class="card" style="background: linear-gradient(135deg, #FFFFFF 0%, #FAF8F2 100%); margin-bottom: var(--space-6); border-left: 4px solid var(--subject-phy);">
      <div class="flex-between" style="flex-wrap: wrap; gap: 16px;">
        <div>
          <div class="flex-gap-2" style="margin-bottom: 4px;">
            <span class="badge badge-phy">Target: MHT-CET 2025</span>
            <span class="badge badge-cet">⚡ ${state.user.streakDays || 4} Day Streak</span>
            <span class="badge badge-success">${sylStats.totalCompleted} / ${sylStats.totalChapters} Chapters Done</span>
          </div>
          <h1 style="font-size: 1.6rem; color: var(--text-primary); margin-bottom: 6px;">
            Welcome back, ${state.user.name}
          </h1>
          <p style="font-size: 0.95rem; color: var(--text-secondary);">
            Your current PCMB syllabus coverage is <strong>${sylStats.overallPercent}%</strong> complete across Std XI & XII.
          </p>
        </div>

        <div class="flex-gap-3">
          <a href="#syllabus" class="btn btn-primary btn-lg">
            📚 Open Syllabus Study OS
          </a>
          <a href="#practice" class="btn btn-outline btn-lg">
            Practice MCQs
          </a>
        </div>
      </div>
    </div>

    <!-- MHT-CET Syllabus Progress Widget -->
    <div class="card" style="margin-bottom: var(--space-8); padding: 18px 20px;">
      <div class="flex-between" style="margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="flex-gap-2" style="margin-bottom: 4px;">
            <span class="badge badge-neutral" style="font-weight: 600;">SYLLABUS MASTERY</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">MHT-CET Class 11 (20%) + Class 12 (80%)</span>
          </div>
          <h3 style="font-size: 1.2rem; color: var(--text-primary); margin: 0;">
            PCMB Curriculum Completion Summary
          </h3>
        </div>

        <a href="#syllabus" class="btn btn-outline btn-sm">View Full Syllabus →</a>
      </div>

      <!-- Top Summary Bar Grid -->
      <div class="grid-3" style="gap: 14px; margin-bottom: 16px;">
        <div style="background: var(--bg-surface-muted); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div class="flex-between" style="font-size: 0.85rem; margin-bottom: 4px;">
            <span style="font-weight: 600; color: var(--text-primary);">Overall Completion</span>
            <strong style="color: var(--subject-phy);">${sylStats.overallPercent}%</strong>
          </div>
          <div class="progress-bar-container" style="height: 8px;">
            <div class="progress-bar-fill" style="width: ${sylStats.overallPercent}%; background: var(--subject-phy);"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
            ${sylStats.totalCompleted} completed • ${sylStats.totalRemaining} remaining
          </div>
        </div>

        <div style="background: var(--bg-surface-muted); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div class="flex-between" style="font-size: 0.85rem; margin-bottom: 4px;">
            <span style="font-weight: 600; color: var(--text-primary);">Class 11th Progress</span>
            <strong>${sylStats.c11Percent}%</strong>
          </div>
          <div class="progress-bar-container" style="height: 8px;">
            <div class="progress-bar-fill" style="width: ${sylStats.c11Percent}%; background: var(--color-warning, #f59e0b);"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
            ${sylStats.c11Completed} of ${sylStats.c11Total} chapters completed
          </div>
        </div>

        <div style="background: var(--bg-surface-muted); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div class="flex-between" style="font-size: 0.85rem; margin-bottom: 4px;">
            <span style="font-weight: 600; color: var(--text-primary);">Class 12th Progress</span>
            <strong>${sylStats.c12Percent}%</strong>
          </div>
          <div class="progress-bar-container" style="height: 8px;">
            <div class="progress-bar-fill" style="width: ${sylStats.c12Percent}%; background: var(--color-success, #10b981);"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
            ${sylStats.c12Completed} of ${sylStats.c12Total} chapters completed
          </div>
        </div>
      </div>

      <!-- Subject Mini Progress Bars -->
      <div class="grid-4" style="gap: 12px;">
        ${Object.entries(sylStats.subjects).map(([sKey, sData]) => `
          <div style="padding: 10px 12px; border: 1px solid var(--border-subtle); border-radius: 6px; cursor: pointer;" onclick="location.hash='#syllabus?subject=${sKey}'">
            <div class="flex-between" style="font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">
              <span>${sData.icon} ${sData.name}</span>
              <span style="color: ${sData.color};">${sData.percent}%</span>
            </div>
            <div class="progress-bar-container" style="height: 5px;">
              <div class="progress-bar-fill" style="width: ${sData.percent}%; background: ${sData.color};"></div>
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
              ${sData.completed} / ${sData.total} chapters
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 3 Core Questions Diagnostic Deck -->
    <div class="grid-3" style="margin-bottom: var(--space-8);">
      <!-- 1. What Did I Study? -->
      <div class="card">
        <div class="card-header">
          <div>
            <span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: var(--text-muted);">Question 1</span>
            <h3 class="card-title" style="margin-top: 2px;">What did I study?</h3>
          </div>
          <span class="badge badge-neutral">Overview</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
          You've completed <strong>${sylStats.totalCompleted} syllabus chapters</strong> and attempted <strong>${attemptedCount} practice questions</strong>.
        </p>
        <div style="background: var(--bg-surface-muted); padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; border: 1px solid var(--border-subtle);">
          <div class="flex-between" style="margin-bottom: 4px;">
            <span>Syllabus Covered:</span>
            <strong>${sylStats.overallPercent}%</strong>
          </div>
          <div class="daily-goal-bar">
            <div class="daily-goal-progress" style="width: ${sylStats.overallPercent}%;"></div>
          </div>
        </div>
      </div>

      <!-- 2. What Am I Weak At? -->
      <div class="card">
        <div class="card-header">
          <div>
            <span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: var(--color-error);">Question 2</span>
            <h3 class="card-title" style="margin-top: 2px;">What am I weak at?</h3>
          </div>
          <span class="badge badge-danger">${mistakes.length} Weak Area${mistakes.length === 1 ? '' : 's'}</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
          ${mistakes.length > 0 
            ? `Calculus in s-t / v-t Graphs & Projectile Heights require immediate revision.` 
            : `All tracked questions are currently mastered! Keep up the momentum.`}
        </p>
        ${mistakes.length > 0 ? `
          <a href="#revision" class="btn btn-outline btn-sm" style="width: 100%; color: var(--color-error); border-color: var(--color-error-border);">
            Review ${mistakes.length} Mistakes in Notebook →
          </a>
        ` : `
          <div style="font-size: 0.85rem; color: var(--color-success); font-weight: 600;">✓ 100% Concept Accuracy</div>
        `}
      </div>

      <!-- 3. What Should I Do Next? -->
      <div class="card">
        <div class="card-header">
          <div>
            <span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: var(--color-success);">Question 3</span>
            <h3 class="card-title" style="margin-top: 2px;">What should I do next?</h3>
          </div>
          <span class="badge badge-success">Recommended</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
          Complete the <strong>Syllabus Study OS</strong> chapter roadmap and practice <strong>MHT-CET Question Banks</strong>.
        </p>
        <a href="#syllabus" class="btn btn-phy btn-sm" style="width: 100%;">
          Launch Syllabus Study OS →
        </a>
      </div>
    </div>

    <!-- Subject Progress Overview -->
    <div style="margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <h2 style="font-size: 1.3rem; color: var(--text-primary);">PCMB Subject Tracks</h2>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Explore syllabus, visual simulations, and chapter test banks</p>
      </div>
      <span class="badge badge-neutral">4 Tracks Active</span>
    </div>

    <div class="grid-4" style="margin-bottom: var(--space-8);">
      ${Object.values(SYLLABUS_DATA).map(subj => `
        <div class="subject-card ${subj.id.substring(0, 4)}" onclick="location.hash='#subject/${subj.id}'">
          <div class="subject-icon">${subj.icon}</div>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: bold; color: var(--text-primary); margin-bottom: 4px;">${subj.name}</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px;">${subj.tagline}</p>
          </div>
          <div class="flex-between" style="border-top: 1px dashed var(--border-subtle); padding-top: 10px; font-size: 0.8rem;">
            <span style="color: var(--text-muted); font-weight: 500;">${subj.chapters.length} Chapters</span>
            <span style="font-weight: 600; color: ${subj.color};">Explore →</span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Quick Practice, MHT-CET Exam & Free Resources Cards -->
    <div class="grid-3">
      <!-- Practice Question Bank Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <span class="badge badge-cet">Practice Center</span>
            <h3 class="card-title" style="margin-top: 4px;">Topic-wise Question Bank</h3>
          </div>
          <span style="font-size: 1.4rem;">🎯</span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">
          Filter over 100+ curated MHT-CET questions by subject, chapter, and difficulty with instant step-by-step solutions.
        </p>
        <div class="flex-gap-3">
          <a href="#practice" class="btn btn-primary btn-sm">Start Practice</a>
          <a href="#practice?difficulty=Hard" class="btn btn-outline btn-sm">Hard PYQs</a>
        </div>
      </div>

      <!-- CET Mock Test Simulator Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <span class="badge badge-phy">Exam Simulator</span>
            <h3 class="card-title" style="margin-top: 4px;">Timed Mock Tests</h3>
          </div>
          <span style="font-size: 1.4rem;">⏱</span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">
          Practice under official MHT-CET exam conditions (+2 Maths, +1 Phy/Chem/Bio) with countdown timer.
        </p>
        <div class="flex-gap-3">
          <a href="#tests" class="btn btn-phy btn-sm">Launch Mock Test</a>
          <a href="#progress" class="btn btn-outline btn-sm">Scorecards</a>
        </div>
      </div>

      <!-- Free Study Materials Hub Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <span class="badge badge-success">Verified Free</span>
            <h3 class="card-title" style="margin-top: 4px;">Free Study Materials Hub</h3>
          </div>
          <span style="font-size: 1.4rem;">🎁</span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">
          Access ${FREE_RESOURCES_DATA.length} verified open resources including official DIKSHA/eBalbharati guides, OpenStax textbooks, and formula sheets.
        </p>
        <div class="flex-gap-3">
          <a href="#resources" class="btn btn-primary btn-sm">Browse Materials ↗</a>
          <a href="#resources?type=official" class="btn btn-outline btn-sm">Official Portals</a>
        </div>
      </div>
    </div>
  `;
}
