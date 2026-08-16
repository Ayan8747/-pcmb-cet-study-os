/**
 * 2D Projectile Motion Laboratory Engine:
 * Realistic trajectory computation, live parameter sliders, vector resolution, and apex/range markers.
 */

export class ProjectileSimulation {
  constructor(canvasId, controlsContainerId, telemetryContainerId) {
    this.canvas = document.getElementById(canvasId);
    this.controlsContainer = document.getElementById(controlsContainerId);
    this.telemetryContainer = document.getElementById(telemetryContainerId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // Simulation Parameters
    this.u = 35;          // Initial velocity in m/s
    this.theta = 45;      // Launch angle in degrees
    this.g = 9.8;         // Gravity in m/s^2
    this.h0 = 0;          // Initial launch height in meters

    // Animation state
    this.t = 0;
    this.isPlaying = false;
    this.animationId = null;
    this.lastTimestamp = null;
    this.trajectoryPoints = [];

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    this.renderControls();
    this.computeTrajectory();
    this.updateTelemetry();
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
    this.canvas.height = 360;
  }

  getMetrics() {
    const rad = (this.theta * Math.PI) / 180;
    const ux = this.u * Math.cos(rad);
    const uy = this.u * Math.sin(rad);

    // Time of flight solving: h0 + uy*t - 0.5*g*t^2 = 0
    // 0.5*g*t^2 - uy*t - h0 = 0
    const discriminant = Math.pow(uy, 2) + 2 * this.g * this.h0;
    const totalFlightTime = (uy + Math.sqrt(discriminant)) / this.g;
    const maxH = this.h0 + Math.pow(uy, 2) / (2 * this.g);
    const horizontalRange = ux * totalFlightTime;

    return { rad, ux, uy, totalFlightTime, maxH, horizontalRange };
  }

  computeTrajectory() {
    const { rad, ux, uy, totalFlightTime } = this.getMetrics();
    this.trajectoryPoints = [];
    const dt = totalFlightTime / 120;
    for (let t = 0; t <= totalFlightTime; t += dt) {
      const px = ux * t;
      const py = this.h0 + uy * t - 0.5 * this.g * Math.pow(t, 2);
      this.trajectoryPoints.push({ x: px, y: Math.max(0, py), t });
    }
  }

  renderControls() {
    if (!this.controlsContainer) return;
    this.controlsContainer.innerHTML = `
      <div class="sim-control-grid">
        <div class="sim-control-item">
          <div class="sim-control-label">
            <span>Launch Speed (u)</span>
            <span class="sim-control-val" id="proj-u-val">${this.u} m/s</span>
          </div>
          <input type="range" class="sim-slider" id="proj-u-slider" min="10" max="60" step="1" value="${this.u}">
        </div>

        <div class="sim-control-item">
          <div class="sim-control-label">
            <span>Launch Angle (θ)</span>
            <span class="sim-control-val" id="proj-theta-val">${this.theta}°</span>
          </div>
          <input type="range" class="sim-slider" id="proj-theta-slider" min="0" max="90" step="1" value="${this.theta}">
        </div>

        <div class="sim-control-item">
          <div class="sim-control-label">
            <span>Gravity (g)</span>
            <span class="sim-control-val" id="proj-g-val">${this.g} m/s²</span>
          </div>
          <input type="range" class="sim-slider" id="proj-g-slider" min="1.6" max="20" step="0.2" value="${this.g}">
        </div>

        <div class="sim-control-item">
          <div class="sim-control-label">
            <span>Initial Height (h₀)</span>
            <span class="sim-control-val" id="proj-h0-val">${this.h0} m</span>
          </div>
          <input type="range" class="sim-slider" id="proj-h0-slider" min="0" max="40" step="1" value="${this.h0}">
        </div>
      </div>

      <div class="flex-between" style="margin-top: 14px;">
        <div class="flex-gap-2">
          <button class="btn btn-primary btn-sm" id="proj-play-btn">
            ${this.isPlaying ? '⏸ Pause' : '▶ Launch Projectile'}
          </button>
          <button class="btn btn-outline btn-sm" id="proj-reset-btn">↺ Reset</button>
          <button class="btn btn-outline btn-sm" id="proj-preset-45">Set Max Range (45°)</button>
        </div>
        <div style="font-size: 0.85rem; font-family: var(--font-family-mono); color: var(--text-secondary);">
          t = <strong id="proj-time-readout">${this.t.toFixed(2)}s</strong>
        </div>
      </div>
    `;

    // Sliders
    const uSlider = document.getElementById('proj-u-slider');
    const thetaSlider = document.getElementById('proj-theta-slider');
    const gSlider = document.getElementById('proj-g-slider');
    const h0Slider = document.getElementById('proj-h0-slider');

    if (uSlider) {
      uSlider.addEventListener('input', (e) => {
        this.u = parseFloat(e.target.value);
        document.getElementById('proj-u-val').textContent = `${this.u} m/s`;
        this.onParamChange();
      });
    }

    if (thetaSlider) {
      thetaSlider.addEventListener('input', (e) => {
        this.theta = parseFloat(e.target.value);
        document.getElementById('proj-theta-val').textContent = `${this.theta}°`;
        this.onParamChange();
      });
    }

    if (gSlider) {
      gSlider.addEventListener('input', (e) => {
        this.g = parseFloat(e.target.value);
        document.getElementById('proj-g-val').textContent = `${this.g} m/s²`;
        this.onParamChange();
      });
    }

    if (h0Slider) {
      h0Slider.addEventListener('input', (e) => {
        this.h0 = parseFloat(e.target.value);
        document.getElementById('proj-h0-val').textContent = `${this.h0} m`;
        this.onParamChange();
      });
    }

    // Play/Reset
    const playBtn = document.getElementById('proj-play-btn');
    const resetBtn = document.getElementById('proj-reset-btn');
    const preset45 = document.getElementById('proj-preset-45');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.isPlaying = !this.isPlaying;
        playBtn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Launch Projectile';
        if (this.isPlaying) {
          if (this.t >= this.getMetrics().totalFlightTime) this.t = 0;
          this.lastTimestamp = performance.now();
          this.loop();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.isPlaying = false;
        this.t = 0;
        if (playBtn) playBtn.textContent = '▶ Launch Projectile';
        this.draw();
        this.updateTelemetry();
      });
    }

    if (preset45) {
      preset45.addEventListener('click', () => {
        this.theta = 45;
        if (thetaSlider) thetaSlider.value = 45;
        document.getElementById('proj-theta-val').textContent = `45°`;
        this.onParamChange();
      });
    }
  }

  onParamChange() {
    this.computeTrajectory();
    this.updateTelemetry();
    this.draw();
  }

  updateTelemetry() {
    if (!this.telemetryContainer) return;
    const { totalFlightTime, maxH, horizontalRange, ux, uy } = this.getMetrics();

    // Instantaneous values
    const currentX = ux * this.t;
    const currentY = Math.max(0, this.h0 + uy * this.t - 0.5 * this.g * Math.pow(this.t, 2));
    const currentVy = uy - this.g * this.t;
    const currentV = Math.sqrt(Math.pow(ux, 2) + Math.pow(currentVy, 2));

    this.telemetryContainer.innerHTML = `
      <div class="telemetry-card">
        <span class="telemetry-label">Flight Time (T)</span>
        <span class="telemetry-value">${totalFlightTime.toFixed(2)} s</span>
      </div>
      <div class="telemetry-card">
        <span class="telemetry-label">Max Height (H_max)</span>
        <span class="telemetry-value" style="color: var(--subject-phy);">${maxH.toFixed(1)} m</span>
      </div>
      <div class="telemetry-card">
        <span class="telemetry-label">Horizontal Range (R)</span>
        <span class="telemetry-value" style="color: var(--color-success);">${horizontalRange.toFixed(1)} m</span>
      </div>
      <div class="telemetry-card">
        <span class="telemetry-label">Position (x, y)</span>
        <span class="telemetry-value" style="font-size: 0.9rem;">(${currentX.toFixed(1)}m, ${currentY.toFixed(1)}m)</span>
      </div>
      <div class="telemetry-card">
        <span class="telemetry-label">Instantaneous |v|</span>
        <span class="telemetry-value" style="font-size: 0.9rem;">${currentV.toFixed(1)} m/s</span>
      </div>
    `;

    const timeReadout = document.getElementById('proj-time-readout');
    if (timeReadout) timeReadout.textContent = `${this.t.toFixed(2)}s`;
  }

  loop() {
    if (!this.isPlaying) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = now;

    this.t += dt;
    const { totalFlightTime } = this.getMetrics();
    if (this.t >= totalFlightTime) {
      this.t = totalFlightTime;
      this.isPlaying = false;
      const playBtn = document.getElementById('proj-play-btn');
      if (playBtn) playBtn.textContent = '▶ Re-Launch';
    }

    this.updateTelemetry();
    this.draw();
    if (this.isPlaying) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  }

  draw() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    const groundY = h - 45;
    const padX = 50;
    const maxRangeTarget = Math.max(160, this.getMetrics().horizontalRange * 1.25);
    const maxHeightTarget = Math.max(70, this.getMetrics().maxH * 1.35);

    const toScreenX = (px) => padX + (px / maxRangeTarget) * (w - padX - 40);
    const toScreenY = (py) => groundY - (py / maxHeightTarget) * (groundY - 40);

    // Draw Ground
    this.ctx.fillStyle = '#EBE7DE';
    this.ctx.fillRect(0, groundY, w, 45);
    this.ctx.strokeStyle = '#D2CCC0';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundY);
    this.ctx.lineTo(w, groundY);
    this.ctx.stroke();

    // Ground hash lines
    this.ctx.strokeStyle = '#DCD7CB';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let x = 10; x < w; x += 16) {
      this.ctx.moveTo(x, groundY);
      this.ctx.lineTo(x - 8, groundY + 12);
    }
    this.ctx.stroke();

    // Cliff / Launch Platform if h0 > 0
    if (this.h0 > 0) {
      const cliffRightX = toScreenX(0);
      const cliffTopY = toScreenY(this.h0);
      this.ctx.fillStyle = '#D6D0C4';
      this.ctx.fillRect(0, cliffTopY, cliffRightX, groundY - cliffTopY);
      this.ctx.strokeStyle = '#B8B0A2';
      this.ctx.strokeRect(0, cliffTopY, cliffRightX, groundY - cliffTopY);
    }

    // Draw Trajectory Parabola (Dashed Guide)
    this.ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
    this.ctx.setLineDash([5, 5]);
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.trajectoryPoints.forEach((pt, index) => {
      const sx = toScreenX(pt.x);
      const sy = toScreenY(pt.y);
      if (index === 0) this.ctx.moveTo(sx, sy);
      else this.ctx.lineTo(sx, sy);
    });
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw Max Height Marker & Range Marker
    const { maxH, horizontalRange, rad, ux, uy } = this.getMetrics();
    const apexX = ux * (uy / this.g);
    const apexScreenX = toScreenX(apexX);
    const apexScreenY = toScreenY(maxH);

    // Max Height Apex Marker
    this.ctx.fillStyle = 'rgba(37, 99, 235, 0.7)';
    this.ctx.beginPath();
    this.ctx.arc(apexScreenX, apexScreenY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#1E2229';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.fillText(`H_max = ${maxH.toFixed(1)}m`, apexScreenX - 30, apexScreenY - 8);

    // Range Landing Flag
    const landingX = toScreenX(horizontalRange);
    this.ctx.fillStyle = '#059669';
    this.ctx.fillRect(landingX - 1, groundY - 24, 2, 24);
    this.ctx.beginPath();
    this.ctx.moveTo(landingX + 1, groundY - 24);
    this.ctx.lineTo(landingX + 14, groundY - 18);
    this.ctx.lineTo(landingX + 1, groundY - 12);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.fillText(`R = ${horizontalRange.toFixed(1)}m`, landingX - 20, groundY + 18);

    // Current Projectile Position & Vectors
    const curX = ux * this.t;
    const curY = Math.max(0, this.h0 + uy * this.t - 0.5 * this.g * Math.pow(this.t, 2));
    const curScreenX = toScreenX(curX);
    const curScreenY = toScreenY(curY);

    // Draw Projectile Ball
    this.ctx.fillStyle = '#2563EB';
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.arc(curScreenX, curScreenY, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw Velocity Vector Arrows (Vx, Vy, V_resultant)
    const curVy = uy - this.g * this.t;
    const scale = 1.0;

    // Horizontal vx (Cyan)
    this.ctx.strokeStyle = '#0284C7';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(curScreenX, curScreenY);
    this.ctx.lineTo(curScreenX + ux * scale, curScreenY);
    this.ctx.stroke();

    // Vertical vy (Emerald)
    this.ctx.strokeStyle = curVy >= 0 ? '#059669' : '#DC2626';
    this.ctx.beginPath();
    this.ctx.moveTo(curScreenX, curScreenY);
    this.ctx.lineTo(curScreenX, curScreenY - curVy * scale);
    this.ctx.stroke();

    // Resultant Velocity Vector (Orange)
    this.ctx.strokeStyle = '#EA580C';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(curScreenX, curScreenY);
    this.ctx.lineTo(curScreenX + ux * scale, curScreenY - curVy * scale);
    this.ctx.stroke();
  }
}
