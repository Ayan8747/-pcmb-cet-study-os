/**
 * Subject View: Chapter library, weightage distribution, and subject navigation
 */

import { SYLLABUS_DATA } from "../data/syllabus.js";

export function renderSubjectView(container, subjectId) {
  const subject = SYLLABUS_DATA[subjectId] || SYLLABUS_DATA.physics;

  container.innerHTML = `
    <!-- Header Banner -->
    <div class="card" style="margin-bottom: var(--space-6); border-left: 4px solid ${subject.color};">
      <div class="flex-between" style="flex-wrap: wrap; gap: 16px;">
        <div>
          <div class="flex-gap-2" style="margin-bottom: 6px;">
            <span class="badge ${subject.badgeClass}">${subject.name.toUpperCase()}</span>
            <span class="badge badge-neutral">MHT-CET Weightage: ${subject.weightageCET}</span>
          </div>
          <h1 style="font-size: 1.75rem; color: var(--text-primary); margin-bottom: 6px;">
            ${subject.icon} ${subject.name} Chapter Library
          </h1>
          <p style="font-size: 0.95rem; color: var(--text-secondary); max-width: 680px;">
            ${subject.tagline}
          </p>
        </div>

        <div class="flex-gap-2">
          <a href="#practice" class="btn btn-outline">Practice ${subject.name} MCQs</a>
          <a href="#tests" class="btn ${subject.btnClass}">Take Subject Mock</a>
        </div>
      </div>
    </div>

    <!-- Chapter Grid -->
    <div style="margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: center;">
      <h2 style="font-size: 1.25rem; color: var(--text-primary);">Syllabus Chapters (${subject.chapters.length})</h2>
      <span style="font-size: 0.85rem; color: var(--text-muted);">Standard XI (20%) + Standard XII (80%)</span>
    </div>

    <div class="grid-2" style="margin-bottom: var(--space-8);">
      ${subject.chapters.map(ch => `
        <div class="chapter-card">
          <div class="flex-between">
            <div class="flex-gap-2">
              <span class="chapter-num">${ch.std} • Chapter ${ch.num}</span>
              <span class="badge ${ch.isReady ? 'badge-success' : 'badge-neutral'}">${ch.status}</span>
            </div>
            <span class="badge badge-cet" style="font-size: 0.7rem;">${ch.cetWeightage}</span>
          </div>

          <div>
            <h3 class="chapter-title" style="margin-bottom: 6px;">${ch.title}</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
              ${ch.description}
            </p>
          </div>

          <div class="chapter-meta">
            <span style="font-size: 0.75rem; color: var(--text-muted);">⏱ ${ch.estimatedTime}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">📚 ${ch.modulesCount} Interactive Modules</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">🎯 ${ch.practiceCount} Practice MCQs</span>
          </div>

          <div class="flex-gap-2" style="margin-top: 8px;">
            ${ch.isReady ? `
              <a href="#chapter/${subject.id}/${ch.id}" class="btn ${subject.btnClass} btn-sm" style="flex: 1;">
                ▶ Open Chapter Lab
              </a>
              <a href="#chapter/${subject.id}/${ch.id}?step=practice" class="btn btn-outline btn-sm">
                Practice
              </a>
              <a href="#chapter/${subject.id}/${ch.id}?step=test" class="btn btn-outline btn-sm">
                Test
              </a>
            ` : `
              <button class="btn btn-outline btn-sm" style="flex: 1; opacity: 0.6; cursor: not-allowed;" disabled>
                🔒 Roadmap Chapter (Coming Soon)
              </button>
            `}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
