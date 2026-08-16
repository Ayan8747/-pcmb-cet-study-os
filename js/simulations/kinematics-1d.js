/**
 * 1D Kinematics Simulation Engine:
 * - Interactive Number Line for Distance vs. Displacement
 * - Live Motion Runner with velocity & acceleration controls
 */

export class NumberLineSimulation {
  constructor(containerId, onChange) {
    this.container = document.getElementById(containerId);
    this.onChange = onChange;
    this.waypoints = [0, 6, -3, 4];
    this.currentPos = 4;
    this.minVal = -10;
    this.maxVal = 10;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  calculateMetrics() {
    let distance = 0;
    for (let i = 1; i < this.waypoints.length; i++) {
      distance += Math.abs(this.waypoints[i] - this.waypoints[i - 1]);
    }
    const initial = this.waypoints[0];
    const final = this.waypoints[this.waypoints.length - 1];
    const displacement = final - initial;
    return { distance, displacement, initial, final };
  }

  addWaypoint(val) {
    if (val < this.minVal || val > this.maxVal) return;
    this.waypoints.push(val);
    this.currentPos = val;
    this.render();
    if (this.onChange) this.onChange(this.calculateMetrics());
  }

  reset() {
    this.waypoints = [0];
    this.currentPos = 0;
    this.render();
    if (this.onChange) this.onChange(this.calculateMetrics());
  }

  render() {
    if (!this.container) return;
    const { distance, displacement, initial, final } = this.calculateMetrics();

    this.container.innerHTML = `
      <div class="simulation-container">
        <div class="sim-header">
          <div class="sim-title-group">
            <span class="badge badge-phy">Interactive Number Line</span>
            <span class="sim-title">Distance vs. Displacement Explorer</span>
          </div>
          <div class="flex-gap-2">
            <button class="btn btn-outline btn-sm" id="reset-num-line-btn">Reset Path</button>
          </div>
        </div>

        <div style="padding: 24px; background: #FCFCFA;">
          <div style="margin-bottom: 12px; font-size: 0.85rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
            <span>Click any tick on the number line to move the particle to a new waypoint:</span>
            <span><strong>Path History:</strong> [ ${this.waypoints.join(" → ")} ]</span>
          </div>

          <div style="position: relative; height: 100px; margin: 30px 10px 20px;">
            <!-- Main Axis Line -->
            <div style="position: absolute; top: 40px; left: 0; right: 0; height: 4px; background: var(--border-strong); border-radius: 2px;"></div>
            <!-- Zero Marker Highlight -->
            <div style="position: absolute; top: 20px; left: 50%; width: 2px; height: 44px; background: var(--subject-phy); opacity: 0.5;"></div>

            <!-- Ticks -->
            ${Array.from({ length: 21 }, (_, i) => i - 10).map(tick => {
              const leftPercent = ((tick + 10) / 20) * 100;
              const isOrigin = tick === 0;
              const isCurrent = tick === this.currentPos;
              return `
                <div 
                  class="number-line-tick-hit" 
                  data-val="${tick}"
                  style="position: absolute; top: 20px; left: ${leftPercent}%; transform: translateX(-50%); width: 28px; height: 60px; cursor: pointer; display: flex; flex-direction: column; align-items: center;"
                  title="Click to move to ${tick}m"
                >
                  <div style="width: 2px; height: ${isOrigin ? '24px' : '14px'}; background: ${isOrigin ? 'var(--subject-phy)' : 'var(--border-strong)'};"></div>
                  <span style="font-size: 0.75rem; font-family: var(--font-family-mono); color: ${isOrigin ? 'var(--subject-phy)' : 'var(--text-muted)'}; font-weight: ${isOrigin ? 'bold' : 'normal'}; margin-top: 18px;">${tick}</span>
                </div>
              `;
            }).join('')}

            <!-- Animated Particle Marker -->
            <div style="
              position: absolute; 
              top: 24px; 
              left: ${((this.currentPos + 10) / 20) * 100}%; 
              transform: translateX(-50%);
              width: 34px; 
              height: 34px; 
              border-radius: 50%; 
              background: var(--subject-phy); 
              color: white; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              font-size: 0.8rem;
              box-shadow: 0 4px 12px rgba(37,99,235,0.4);
              transition: left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
              z-index: 10;
              pointer-events: none;
            ">
              P
            </div>
          </div>
        </div>

        <div class="sim-telemetry">
          <div class="telemetry-card">
            <span class="telemetry-label">Current Position (x)</span>
            <span class="telemetry-value" style="color: var(--subject-phy);">${this.currentPos > 0 ? '+' : ''}${this.currentPos} m</span>
          </div>
          <div class="telemetry-card">
            <span class="telemetry-label">Total Distance Traveled</span>
            <span class="telemetry-value">${distance} m</span>
          </div>
          <div class="telemetry-card">
            <span class="telemetry-label">Net Displacement (Δx)</span>
            <span class="telemetry-value" style="color: ${displacement >= 0 ? 'var(--color-success)' : 'var(--color-error)'};">
              ${displacement > 0 ? '+' : ''}${displacement} m
            </span>
          </div>
          <div class="telemetry-card">
            <span class="telemetry-label">Inequality Verification</span>
            <span class="telemetry-value" style="font-size: 0.9rem; color: var(--text-secondary);">
              ${distance} ≥ |${displacement}| (${distance >= Math.abs(displacement) ? '✓ True' : 'False'})
            </span>
          </div>
        </div>
      </div>
    `;

    // Bind event listeners
    this.container.querySelectorAll('.number-line-tick-hit').forEach(el => {
      el.addEventListener('click', () => {
        const val = parseInt(el.getAttribute('data-val'), 10);
        this.addWaypoint(val);
      });
    });

    const resetBtn = this.container.querySelector('#reset-num-line-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }
  }
}

export class MotionRunnerSimulation {
  constructor(canvasId, controlsContainerId) {
    this.canvas = document.getElementById(canvasId);
    this.controlsContainer = document.getElementById(controlsContainerId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    
    // Physics variables
    this.x = 20; // in meters (scaled for display)
    this.v = 10; // m/s
    this.a = 2;  // m/s^2
    this.time = 0;
    this.isRunning = false;
    this.animationFrame = null;
    this.lastTimestamp = null;
    this.trackLength = 200; // meters

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    this.renderControls();
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
    this.canvas.height = 160;
  }

  renderControls() {
    if (!this.controlsContainer) return;
    this.controlsContainer.innerHTML = `
      <div class="sim-control-grid">
        <div class="sim-control-item">
          <div class="sim-control-label">
            <span>Initial Velocity (u)</span>
            <span class="sim-control-val" id="vel-val">${this.v} m/s</span>
          </div>
          <input type="range" class="sim-slider" id="vel-slider" min="-20" max="30" step="1" value="${this.v}">
        </div>
        <div class="sim-control-item">
          <div class="sim-control-label">
            <span>Acceleration (a)</span>
            <span class="sim-control-val" id="acc-val">${this.a} m/s²</span>
          </div>
          <input type="range" class="sim-slider" id="acc-slider" min="-10" max="10" step="0.5" value="${this.a}">
        </div>
      </div>
      <div class="flex-between" style="margin-top: 12px;">
        <div class="flex-gap-2">
          <button class="btn btn-primary btn-sm" id="runner-toggle-btn">
            ${this.isRunning ? '⏸ Pause' : '▶ Start Run'}
          </button>
          <button class="btn btn-outline btn-sm" id="runner-reset-btn">↺ Reset</button>
        </div>
        <div class="flex-gap-3" style="font-family: var(--font-family-mono); font-size: 0.85rem;">
          <span>t = <strong id="time-readout">${this.time.toFixed(1)}s</strong></span>
          <span>v = <strong id="v-readout">${this.v.toFixed(1)} m/s</strong></span>
          <span>x = <strong id="x-readout">${this.x.toFixed(1)} m</strong></span>
        </div>
      </div>
    `;

    const velSlider = document.getElementById('vel-slider');
    const accSlider = document.getElementById('acc-slider');
    const toggleBtn = document.getElementById('runner-toggle-btn');
    const resetBtn = document.getElementById('runner-reset-btn');

    if (velSlider) {
      velSlider.addEventListener('input', (e) => {
        this.v = parseFloat(e.target.value);
        document.getElementById('vel-val').textContent = `${this.v} m/s`;
        this.draw();
      });
    }

    if (accSlider) {
      accSlider.addEventListener('input', (e) => {
        this.a = parseFloat(e.target.value);
        document.getElementById('acc-val').textContent = `${this.a} m/s²`;
        this.draw();
      });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isRunning = !this.isRunning;
        toggleBtn.textContent = this.isRunning ? '⏸ Pause' : '▶ Start Run';
        if (this.isRunning) {
          this.lastTimestamp = performance.now();
          this.loop();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.isRunning = false;
        this.x = 20;
        this.time = 0;
        if (toggleBtn) toggleBtn.textContent = '▶ Start Run';
        this.updateReadouts();
        this.draw();
      });
    }
  }

  updateReadouts() {
    const timeEl = document.getElementById('time-readout');
    const vEl = document.getElementById('v-readout');
    const xEl = document.getElementById('x-readout');
    if (timeEl) timeEl.textContent = `${this.time.toFixed(1)}s`;
    if (vEl) vEl.textContent = `${this.v.toFixed(1)} m/s`;
    if (xEl) xEl.textContent = `${this.x.toFixed(1)} m`;
  }

  loop() {
    if (!this.isRunning) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTimestamp) / 1000, 0.05); // seconds
    this.lastTimestamp = now;

    // Physics step: v = u + at, dx = v*dt
    this.v += this.a * dt;
    this.x += this.v * dt;
    this.time += dt;

    // Wrap around or bounce within track
    if (this.x > this.trackLength) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = this.trackLength;
    }

    this.updateReadouts();
    this.draw();
    this.animationFrame = requestAnimationFrame(() => this.loop());
  }

  draw() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Background track
    const roadY = h - 50;
    this.ctx.fillStyle = '#EBE7DE';
    this.ctx.fillRect(0, roadY, w, 24);

    // Track markings
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.setLineDash([12, 12]);
    this.ctx.beginPath();
    this.ctx.moveTo(0, roadY + 12);
    this.ctx.lineTo(w, roadY + 12);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Pixel mapping for particle x
    const screenX = (this.x / this.trackLength) * (w - 60) + 30;

    // Draw particle / vehicle
    const vehicleY = roadY - 14;
    this.ctx.fillStyle = '#2563EB';
    this.ctx.beginPath();
    this.ctx.roundRect(screenX - 18, vehicleY - 10, 36, 20, 4);
    this.ctx.fill();

    // Wheels
    this.ctx.fillStyle = '#1E2229';
    this.ctx.beginPath();
    this.ctx.arc(screenX - 10, vehicleY + 10, 4, 0, Math.PI * 2);
    this.ctx.arc(screenX + 10, vehicleY + 10, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Velocity Vector Arrow
    if (Math.abs(this.v) > 0.5) {
      const arrowLen = Math.max(Math.min(this.v * 3, 60), -60);
      this.ctx.strokeStyle = '#059669';
      this.ctx.fillStyle = '#059669';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, vehicleY - 20);
      this.ctx.lineTo(screenX + arrowLen, vehicleY - 20);
      this.ctx.stroke();

      // Arrowhead
      const headDir = arrowLen >= 0 ? 1 : -1;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX + arrowLen, vehicleY - 20);
      this.ctx.lineTo(screenX + arrowLen - 6 * headDir, vehicleY - 24);
      this.ctx.lineTo(screenX + arrowLen - 6 * headDir, vehicleY - 16);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
}
