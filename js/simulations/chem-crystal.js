/**
 * Chemistry Crystal Lattice Unit Cell Visualizer
 * Interactive 2D/3D projection of SC, BCC, and FCC lattices.
 */

export class CrystalLatticeSimulation {
  constructor(canvasId, controlsContainerId) {
    this.canvas = document.getElementById(canvasId);
    this.controlsContainer = document.getElementById(controlsContainerId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.unitType = 'fcc'; // 'sc' | 'bcc' | 'fcc'
    this.angleY = 0.55;
    this.angleX = 0.35;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

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

  renderControls() {
    if (!this.controlsContainer) return;
    this.controlsContainer.innerHTML = `
      <div class="flex-between" style="flex-wrap: wrap; gap: 12px;">
        <div class="flex-gap-2">
          <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-muted);">UNIT CELL TYPE:</span>
          <div class="graph-type-selector">
            <button class="graph-tab-btn ${this.unitType === 'sc' ? 'active' : ''}" data-type="sc">Simple Cubic (SC)</button>
            <button class="graph-tab-btn ${this.unitType === 'bcc' ? 'active' : ''}" data-type="bcc">Body-Centered (BCC)</button>
            <button class="graph-tab-btn ${this.unitType === 'fcc' ? 'active' : ''}" data-type="fcc">Face-Centered (FCC)</button>
          </div>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          <span style="display: inline-block; padding: 4px 8px; background: var(--bg-surface-muted); border-radius: 4px; border: 1px solid var(--border-subtle);">
            🖱 Drag inside box to rotate 3D crystal lattice
          </span>
        </div>
      </div>
    `;

    this.controlsContainer.querySelectorAll('.graph-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.unitType = btn.getAttribute('data-type');
        this.controlsContainer.querySelectorAll('.graph-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.draw();
      });
    });
  }

  bindEvents() {
    if (!this.canvas) return;
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.angleY += dx * 0.01;
      this.angleX += dy * 0.01;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.draw();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  project(x, y, z, cx, cy, size) {
    // Rotate Y
    let x1 = x * Math.cos(this.angleY) + z * Math.sin(this.angleY);
    let z1 = -x * Math.sin(this.angleY) + z * Math.cos(this.angleY);
    // Rotate X
    let y2 = y * Math.cos(this.angleX) - z1 * Math.sin(this.angleX);
    let z2 = y * Math.sin(this.angleX) + z1 * Math.cos(this.angleX);

    const scale = 280 / (300 + z2);
    return {
      px: cx + x1 * size * scale,
      py: cy + y2 * size * scale,
      z: z2
    };
  }

  draw() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const cubeSize = 85;

    // Cube vertices (-1 to 1)
    const corners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ];

    // Edges
    const edges = [
      [0,1], [1,2], [2,3], [3,0],
      [4,5], [5,6], [6,7], [7,4],
      [0,4], [1,5], [2,6], [3,7]
    ];

    // Draw unit cell wireframe
    this.ctx.strokeStyle = '#94A3B8';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    edges.forEach(([i, j]) => {
      const p1 = this.project(corners[i][0], corners[i][1], corners[i][2], cx, cy, cubeSize);
      const p2 = this.project(corners[j][0], corners[j][1], corners[j][2], cx, cy, cubeSize);
      this.ctx.moveTo(p1.px, p1.py);
      this.ctx.lineTo(p2.px, p2.py);
    });
    this.ctx.stroke();

    // Atoms to render
    const atoms = [];
    // 8 Corners for all types
    corners.forEach(c => atoms.push({ x: c[0], y: c[1], z: c[2], color: '#2563EB', r: 9, label: '1/8' }));

    // BCC: 1 Body center
    if (this.unitType === 'bcc') {
      atoms.push({ x: 0, y: 0, z: 0, color: '#D97706', r: 14, label: '1' });
    }

    // FCC: 6 Face centers
    if (this.unitType === 'fcc') {
      const faces = [
        [0, 0, -1], [0, 0, 1],
        [-1, 0, 0], [1, 0, 0],
        [0, -1, 0], [0, 1, 0]
      ];
      faces.forEach(f => atoms.push({ x: f[0], y: f[1], z: f[2], color: '#0D9488', r: 11, label: '1/2' }));
    }

    // Sort atoms by Z depth for realistic rendering
    const projectedAtoms = atoms.map(a => {
      const proj = this.project(a.x, a.y, a.z, cx, cy, cubeSize);
      return { ...a, px: proj.px, py: proj.py, zDepth: proj.z };
    }).sort((a, b) => b.zDepth - a.zDepth);

    // Draw atoms
    projectedAtoms.forEach(a => {
      this.ctx.fillStyle = a.color;
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(a.px, a.py, a.r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    });

    // Draw Info Overlay
    let zEff = '1 atom', packing = '52.4%', coord = '6', formula = 'a = 2r';
    if (this.unitType === 'bcc') {
      zEff = '2 atoms (8×1/8 + 1)';
      packing = '68.0%';
      coord = '8';
      formula = '√3a = 4r';
    } else if (this.unitType === 'fcc') {
      zEff = '4 atoms (8×1/8 + 6×1/2)';
      packing = '74.0%';
      coord = '12';
      formula = '√2a = 4r';
    }

    this.ctx.fillStyle = '#1E2229';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Atoms per unit cell (Z): ${zEff}`, 20, 30);
    this.ctx.fillText(`Packing Efficiency: ${packing}`, 20, 50);
    this.ctx.fillText(`Coordination Number: ${coord}`, 20, 70);
    this.ctx.fillText(`Radius-Edge Relation: ${formula}`, 20, 90);
  }
}
