/**
 * Kinematic Graph Analysis Engine:
 * Real-time s-t, v-t, and a-t curves with tangent slope calculation and area under curve integration.
 */

export class KinematicGraphsEngine {
  constructor(canvasId, controlsContainerId) {
    this.canvas = document.getElementById(canvasId);
    this.controlsContainer = document.getElementById(controlsContainerId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.currentType = 'st'; // 'st' | 'vt' | 'at'
    this.scenario = 'accelerated'; // 'uniform' | 'accelerated' | 'braking' | 'harmonic'
    this.tCursor = 4.0; // Current time cursor in seconds
    this.maxTime = 10.0;

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    this.renderControls();
    this.bindEvents();
    this.draw();
    window.addEventListener('resize', () => {
      this.resize();
      this.draw();
    });
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 320;
  }

  // Value functions depending on scenario
  getValues(t) {
    let s = 0, v = 0, a = 0;
    if (this.scenario === 'uniform') {
      v = 15;
      s = v * t;
      a = 0;
    } else if (this.scenario === 'accelerated') {
      const u = 4;
      a = 2.5;
      v = u + a * t;
      s = u * t + 0.5 * a * Math.pow(t, 2);
    } else if (this.scenario === 'braking') {
      const u = 30;
      a = -3.0;
      v = Math.max(0, u + a * t);
      s = u * t + 0.5 * a * Math.pow(t, 2);
    } else if (this.scenario === 'harmonic') {
      // Oscillatory motion
      const A = 20, omega = 0.8;
      s = A * Math.sin(omega * t);
      v = A * omega * Math.cos(omega * t);
      a = -A * Math.pow(omega, 2) * Math.sin(omega * t);
    }
    return { s, v, a };
  }

  renderControls() {
    if (!this.controlsContainer) return;
    this.controlsContainer.innerHTML = `
      <div class="flex-between" style="flex-wrap: wrap; gap: 12px;">
        <div class="flex-gap-2">
          <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-muted);">GRAPH TYPE:</span>
          <div class="graph-type-selector">
            <button class="graph-tab-btn ${this.currentType === 'st' ? 'active' : ''}" data-type="st">s-t (Displacement)</button>
            <button class="graph-tab-btn ${this.currentType === 'vt' ? 'active' : ''}" data-type="vt">v-t (Velocity)</button>
            <button class="graph-tab-btn ${this.currentType === 'at' ? 'active' : ''}" data-type="at">a-t (Acceleration)</button>
          </div>
        </div>

        <div class="flex-gap-2">
          <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-muted);">SCENARIO:</span>
          <select id="graph-scenario-select" style="padding: 4px 10px; background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-sm);">
            <option value="accelerated" ${this.scenario === 'accelerated' ? 'selected' : ''}>Constant Acceleration</option>
            <option value="uniform" ${this.scenario === 'uniform' ? 'selected' : ''}>Uniform Velocity (a = 0)</option>
            <option value="braking" ${this.scenario === 'braking' ? 'selected' : ''}>Braking / Deceleration</option>
            <option value="harmonic" ${this.scenario === 'harmonic' ? 'selected' : ''}>Simple Harmonic Wave</option>
          </select>
        </div>
      </div>

      <div style="margin-top: 12px; display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap;">Time Scrubber:</span>
        <input type="range" class="sim-slider" id="time-scrubber" min="0" max="10" step="0.1" value="${this.tCursor}" style="flex: 1;">
        <span style="font-family: var(--font-family-mono); font-weight: bold; color: var(--text-primary); min-width: 50px;" id="scrubber-label">${this.tCursor.toFixed(1)}s</span>
      </div>
    `;

    // Bind type switch buttons
    this.controlsContainer.querySelectorAll('.graph-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentType = btn.getAttribute('data-type');
        this.controlsContainer.querySelectorAll('.graph-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.draw();
      });
    });

    // Bind scenario select
    const scenarioSelect = document.getElementById('graph-scenario-select');
    if (scenarioSelect) {
      scenarioSelect.addEventListener('change', (e) => {
        this.scenario = e.target.value;
        this.draw();
      });
    }

    // Bind scrubber
    const scrubber = document.getElementById('time-scrubber');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        this.tCursor = parseFloat(e.target.value);
        document.getElementById('scrubber-label').textContent = `${this.tCursor.toFixed(1)}s`;
        this.draw();
      });
    }
  }

  bindEvents() {
    if (!this.canvas) return;
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const plotLeft = 60;
      const plotRight = this.canvas.width - 30;
      if (mouseX >= plotLeft && mouseX <= plotRight) {
        this.tCursor = ((mouseX - plotLeft) / (plotRight - plotLeft)) * this.maxTime;
        const scrubber = document.getElementById('time-scrubber');
        const label = document.getElementById('scrubber-label');
        if (scrubber) scrubber.value = this.tCursor;
        if (label) label.textContent = `${this.tCursor.toFixed(1)}s`;
        this.draw();
      }
    });
  }

  draw() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    const padLeft = 60;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 40;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Determine scale range based on current type and scenario
    let maxVal = 100, minVal = 0, yLabel = 'Displacement s (m)', strokeColor = '#2563EB';
    if (this.currentType === 'st') {
      maxVal = 150; minVal = -25;
      yLabel = 'Displacement s (m)';
      strokeColor = '#2563EB';
    } else if (this.currentType === 'vt') {
      maxVal = 40; minVal = -5;
      yLabel = 'Velocity v (m/s)';
      strokeColor = '#0D9488';
    } else if (this.currentType === 'at') {
      maxVal = 10; minVal = -10;
      yLabel = 'Acceleration a (m/s²)';
      strokeColor = '#D97706';
    }

    const tToX = (t) => padLeft + (t / this.maxTime) * plotW;
    const valToY = (v) => padTop + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;

    // Draw Grid Lines & Axes
    this.ctx.strokeStyle = '#EAE6DC';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let t = 0; t <= this.maxTime; t += 2) {
      const x = tToX(t);
      this.ctx.moveTo(x, padTop);
      this.ctx.lineTo(x, padTop + plotH);
    }
    this.ctx.stroke();

    // Axis Lines
    const zeroY = valToY(0);
    this.ctx.strokeStyle = '#8C94A0';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    // X axis (zero line)
    this.ctx.moveTo(padLeft, zeroY);
    this.ctx.lineTo(padLeft + plotW, zeroY);
    // Y axis
    this.ctx.moveTo(padLeft, padTop);
    this.ctx.lineTo(padLeft, padTop + plotH);
    this.ctx.stroke();

    // Axis Labels
    this.ctx.fillStyle = '#525866';
    this.ctx.font = '11px sans-serif';
    this.ctx.textAlign = 'center';
    for (let t = 0; t <= this.maxTime; t += 2) {
      this.ctx.fillText(`${t}s`, tToX(t), padTop + plotH + 18);
    }

    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${maxVal.toFixed(0)}`, padLeft - 8, padTop + 10);
    this.ctx.fillText('0', padLeft - 8, zeroY + 4);
    if (minVal < 0) {
      this.ctx.fillText(`${minVal.toFixed(0)}`, padLeft - 8, padTop + plotH);
    }

    // Y Axis Title
    this.ctx.save();
    this.ctx.translate(18, padTop + plotH / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#1E2229';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.fillText(yLabel, 0, 0);
    this.ctx.restore();

    // If v-t graph, shade area under curve up to tCursor (Displacement = Area)
    if (this.currentType === 'vt') {
      this.ctx.fillStyle = 'rgba(13, 148, 136, 0.12)';
      this.ctx.beginPath();
      this.ctx.moveTo(padLeft, zeroY);
      for (let t = 0; t <= this.tCursor; t += 0.05) {
        const val = this.getValues(t).v;
        this.ctx.lineTo(tToX(t), valToY(val));
      }
      this.ctx.lineTo(tToX(this.tCursor), zeroY);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Plot Curve
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    for (let t = 0; t <= this.maxTime; t += 0.05) {
      const vals = this.getValues(t);
      const yVal = this.currentType === 'st' ? vals.s : (this.currentType === 'vt' ? vals.v : vals.a);
      const px = tToX(t);
      const py = valToY(yVal);
      if (t === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.stroke();

    // Draw Cursor & Instantaneous Tangent Line
    const curVals = this.getValues(this.tCursor);
    const curYVal = this.currentType === 'st' ? curVals.s : (this.currentType === 'vt' ? curVals.v : curVals.a);
    const curX = tToX(this.tCursor);
    const curY = valToY(curYVal);

    // Vertical dashed time line
    this.ctx.strokeStyle = '#1E2229';
    this.ctx.setLineDash([4, 4]);
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(curX, padTop);
    this.ctx.lineTo(curX, padTop + plotH);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Tangent Line on s-t graph (Slope = Velocity)
    if (this.currentType === 'st') {
      const slope = curVals.v; // ds/dt = v
      const dtTangent = 1.2;
      const x1 = tToX(this.tCursor - dtTangent);
      const y1 = valToY(curYVal - slope * dtTangent);
      const x2 = tToX(this.tCursor + dtTangent);
      const y2 = valToY(curYVal + slope * dtTangent);

      this.ctx.strokeStyle = '#EA580C';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    // Active Point Circle
    this.ctx.fillStyle = strokeColor;
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Callout Box with Calculus Interpretation
    this.drawCallout(curVals);
  }

  drawCallout(vals) {
    const box = document.getElementById('graph-callout-panel');
    if (!box) return;

    let calculusNote = '';
    if (this.currentType === 'st') {
      calculusNote = `Instantaneous Slope $\\frac{ds}{dt}$ (Velocity) = <strong>${vals.v.toFixed(2)} m/s</strong>`;
    } else if (this.currentType === 'vt') {
      calculusNote = `Slope $\\frac{dv}{dt}$ (Acc) = <strong>${vals.a.toFixed(2)} m/s²</strong> | Shaded Area $\\int v\\,dt$ (Displacement) = <strong>${vals.s.toFixed(1)} m</strong>`;
    } else {
      calculusNote = `Acceleration = <strong>${vals.a.toFixed(2)} m/s²</strong> | Area under a-t curve = <strong>${vals.v.toFixed(2)} m/s</strong> (Δv)`;
    }

    box.innerHTML = `
      <div style="font-size: 0.85rem; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <span><strong>Live Calculus at t = ${this.tCursor.toFixed(1)}s:</strong> ${calculusNote}</span>
        <span class="badge ${this.currentType === 'st' ? 'badge-phy' : (this.currentType === 'vt' ? 'badge-chem' : 'badge-warning')}">
          ${this.currentType.toUpperCase()} Graph
        </span>
      </div>
    `;
  }
}
