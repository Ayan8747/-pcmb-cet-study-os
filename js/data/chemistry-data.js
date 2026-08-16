/**
 * Chemistry Subject Data - Solid State & Crystal Chemistry (Std XII Ch 1)
 */

export const SOLID_STATE_CHAPTER_DATA = {
  id: "solid-state",
  subject: "chemistry",
  num: 1,
  title: "Solid State & Crystal Lattices",
  shortTitle: "Solid State",
  std: "Std XII",
  estimatedTime: "2.5 Hours",
  cetWeightage: "4 - 6 Marks",
  summary: "Classification of crystalline and amorphous solids, Bravais lattices, unit cell parameters (Simple Cubic, BCC, FCC), coordination numbers, packing efficiency, and point defects.",
  
  prerequisites: [
    "Atomic Structure & Radius",
    "Chemical Bonding (Ionic, Covalent, Metallic)",
    "Density = Mass / Volume fundamentals"
  ],

  learningObjectives: [
    "Differentiate between crystalline and amorphous solids based on anisotropy and melting points.",
    "Calculate the number of constituent atoms per unit cell in SC ($Z=1$), BCC ($Z=2$), and FCC ($Z=4$).",
    "Derive packing efficiencies for SC ($52.4\\%$), BCC ($68\\%$), and FCC ($74\\%$).",
    "Apply the crystal density equation $\\rho = \\frac{Z \\cdot M}{a^3 \\cdot N_A}$ in MHT-CET numericals.",
    "Identify Schottky and Frenkel point defects and their effects on crystal density."
  ],

  conceptMap: [
    { id: "cs-1", title: "Types of Solids (Crystalline vs Amorphous)", level: 1, connectsTo: ["cs-2"] },
    { id: "cs-2", title: "Crystal Lattice & Unit Cells", level: 2, connectsTo: ["cs-3", "cs-4"] },
    { id: "cs-3", title: "Cubic Systems (SC, BCC, FCC)", level: 3, connectsTo: ["cs-4", "cs-5"] },
    { id: "cs-4", title: "Packing Efficiency & Density Formula", level: 4, connectsTo: ["cs-5"] },
    { id: "cs-5", title: "Defects & Electrical Properties", level: 5, connectsTo: [] }
  ],

  modules: [
    {
      id: "chem-mod-1",
      num: 1,
      title: "Classification of Solids",
      simulationType: "crystal-lattice-sim",
      summary: "Crystalline solids possess long-range order, sharp melting points, and are anisotropic. Amorphous solids are pseudo-solids or supercooled liquids with isotropic properties.",
      explanation: `
        <p>Solids are classified into two broad categories based on the arrangement of constituent particles:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.9rem;">
          <thead>
            <tr style="background: var(--bg-surface-muted);">
              <th style="padding: 8px; border: 1px solid var(--border-subtle);">Property</th>
              <th style="padding: 8px; border: 1px solid var(--border-subtle);">Crystalline Solids</th>
              <th style="padding: 8px; border: 1px solid var(--border-subtle);">Amorphous Solids</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);"><strong>Structure</strong></td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);">Long-range regular order</td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);">Short-range random order</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);"><strong>Melting Point</strong></td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);">Sharp and characteristic</td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);">Softens over temperature range</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);"><strong>Directionality</strong></td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);"><strong>Anisotropic</strong> (values vary with direction)</td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);"><strong>Isotropic</strong> (values equal in all directions)</td>
            </tr>
          </tbody>
        </table>
      `,
      quickCheck: {
        question: "Which of the following is an amorphous solid?",
        options: ["Graphite", "Quartz glass (SiO2)", "Crystalline quartz", "Sodium chloride"],
        correct: 1,
        explanation: "Quartz glass has randomly oriented silicate tetrahedra without long-range periodicity, making it an amorphous solid (supercooled liquid)."
      }
    },
    {
      id: "chem-mod-2",
      num: 2,
      title: "Cubic Unit Cells & Atomic Parameters",
      simulationType: "crystal-lattice-sim",
      summary: "Comparison of Simple Cubic (SC), Body-Centered Cubic (BCC), and Face-Centered Cubic (FCC) structures.",
      explanation: `
        <div style="background: var(--bg-surface-muted); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle); margin: 12px 0;">
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.95rem;">
            <li>• <strong>Simple Cubic (SC):</strong> $Z = 8 \\times \\frac{1}{8} = 1$, $a = 2r$, Packing Efficiency = $52.4\\%$, Coord No = 6</li>
            <li>• <strong>Body-Centered (BCC):</strong> $Z = 8 \\times \\frac{1}{8} + 1 = 2$, $\\sqrt{3}a = 4r$, Packing Efficiency = $68\\%$, Coord No = 8</li>
            <li>• <strong>Face-Centered (FCC/CCP):</strong> $Z = 8 \\times \\frac{1}{8} + 6 \\times \\frac{1}{2} = 4$, $\\sqrt{2}a = 4r$, Packing Efficiency = $74\\%$, Coord No = 12</li>
          </ul>
        </div>
      `,
      quickCheck: {
        question: "An element crystallizes in a BCC lattice with edge length $a$. The atomic radius $r$ of the atom is:",
        options: ["a / 2", "sqrt(3) * a / 4", "sqrt(2) * a / 4", "a / (2 * sqrt(2))"],
        correct: 1,
        explanation: "In a BCC unit cell, atoms touch along the body diagonal of length $\\sqrt{3}a = 4r \\implies r = \\frac{\\sqrt{3}a}{4}$."
      }
    }
  ],

  formulas: [
    {
      id: "chem-f-1",
      name: "Density of Cubic Crystal",
      latex: "\\rho = \\frac{Z \\cdot M}{a^3 \\cdot N_A}",
      variables: [
        { id: "Z", name: "Atoms per Unit Cell (Z)", unit: "atoms", default: 4 },
        { id: "M", name: "Molar Mass (M)", unit: "g/mol", default: 58.5 },
        { id: "a", name: "Edge Length (a in pm)", unit: "pm", default: 564 }
      ],
      calculate: (inputs) => {
        const a_cm = inputs.a * 1e-10;
        const volume = Math.pow(a_cm, 3);
        const NA = 6.022e23;
        const density = (inputs.Z * inputs.M) / (volume * NA);
        return density.toFixed(2);
      },
      resultUnit: "g/cm³",
      resultLabel: "Crystal Density (ρ)"
    }
  ],

  workedExamples: [
    {
      id: "chem-ex-1",
      title: "Worked Example: Unit Cell Density & Edge Length Calculation",
      difficulty: "MHT-CET Level",
      statement: "Copper crystallizes into an FCC lattice with an edge length of 361 pm. If the molar mass of copper is 63.5 g/mol, calculate its theoretical density. (NA = 6.022 × 10²³ mol⁻¹)",
      steps: [
        {
          title: "Step 1: Identify Parameters",
          body: "For FCC crystal: $Z = 4$.<br>Edge length $a = 361\\text{ pm} = 3.61 \\times 10^{-8}\\text{ cm}$.<br>Molar mass $M = 63.5\\text{ g/mol}$."
        },
        {
          title: "Step 2: Calculate Volume of Unit Cell",
          body: "$$a^3 = (3.61 \\times 10^{-8})^3 = 4.704 \\times 10^{-23}\\text{ cm}^3$$"
        },
        {
          title: "Step 3: Apply Density Formula",
          body: "$$\\rho = \\frac{Z \\cdot M}{a^3 \\cdot N_A} = \\frac{4 \\times 63.5}{(4.704 \\times 10^{-23}) \\times (6.022 \\times 10^{23})} = \\frac{254}{28.33} = \\mathbf{8.96\\text{ g/cm}^3}$$"
        }
      ]
    }
  ],

  practiceMCQs: [
    {
      id: "mcq-chem-1",
      topic: "Point Defects",
      difficulty: "Easy",
      tag: "MHT-CET 2022",
      question: "Which type of defect decreases the density of an ionic crystal without altering its stoichiometry?",
      options: ["Frenkel defect", "Schottky defect", "Metal excess defect", "Interstitial defect"],
      correct: 1,
      explanation: "In Schottky defects, equal numbers of cations and anions are missing from their lattice sites creating vacancies, which directly decreases crystal density."
    },
    {
      id: "mcq-chem-2",
      topic: "Packing Efficiency",
      difficulty: "Medium",
      tag: "MHT-CET 2023",
      question: "The percentage of void space (empty space) in a Body-Centered Cubic (BCC) unit cell is:",
      options: ["26%", "32%", "47.6%", "68%"],
      correct: 1,
      explanation: "Packing efficiency of BCC = $68\\%$.<br>Percentage of void space = $100\\% - 68\\% = \\mathbf{32\\%}$."
    }
  ],

  chapterTest: [
    {
      id: "chem-ct-1",
      question: "Coordination number of an atom in a Face-Centered Cubic (FCC) lattice is:",
      options: ["6", "8", "12", "14"],
      correct: 2,
      explanation: "In FCC (or CCP), each atom touches 12 nearest neighbours (6 in its own layer, 3 above, and 3 below)."
    }
  ]
};
