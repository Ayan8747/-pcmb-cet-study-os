/**
 * Interactive Formula Card Component
 * Displays mathematical formulas with live numerical solvers.
 */

export function renderFormulaCard(formula) {
  const card = document.createElement("div");
  card.className = "formula-card";
  card.id = `formula-${formula.id}`;

  const inputsHTML = formula.variables.map(v => `
    <div class="solver-field">
      <label>${v.name} (${v.unit}):</label>
      <input type="number" step="any" class="formula-var-input" data-var="${v.id}" value="${v.default}">
    </div>
  `).join("");

  // Initial calculation
  const initialInputs = {};
  formula.variables.forEach(v => { initialInputs[v.id] = v.default; });
  const initialResult = formula.calculate(initialInputs);

  card.innerHTML = `
    <div class="flex-between">
      <h4 style="font-size: 1rem; color: var(--text-primary);">${formula.name}</h4>
      <span class="badge badge-neutral">Formula & Solver</span>
    </div>

    <div class="formula-display">
      ${formula.latex}
    </div>

    <div class="formula-solver">
      <div style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
        Live Variable Calculator (Change values to solve):
      </div>
      <div class="solver-grid">
        ${inputsHTML}
      </div>
      <div class="solver-result" id="res-${formula.id}">
        ${formula.resultLabel}: <strong>${initialResult} ${formula.resultUnit}</strong>
      </div>
    </div>
  `;

  // Bind live calculation listeners
  const inputElements = card.querySelectorAll(".formula-var-input");
  const updateCalc = () => {
    const currentInputs = {};
    inputElements.forEach(inp => {
      currentInputs[inp.getAttribute("data-var")] = parseFloat(inp.value) || 0;
    });
    const result = formula.calculate(currentInputs);
    const resultBox = card.querySelector(`#res-${formula.id}`);
    if (resultBox) {
      resultBox.innerHTML = `${formula.resultLabel}: <strong>${result} ${formula.resultUnit}</strong>`;
    }
  };

  inputElements.forEach(inp => inp.addEventListener("input", updateCalc));

  return card;
}
