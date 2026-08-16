/**
 * Mathematics Subject Data - Trigonometric Functions (Std XI Ch 2 & 3)
 */

export const TRIGONOMETRY_CHAPTER_DATA = {
  id: "trigonometry",
  subject: "mathematics",
  num: 1,
  title: "Trigonometric Functions & Graph Transformations",
  shortTitle: "Trigonometry",
  std: "Std XI",
  estimatedTime: "3.0 Hours",
  cetWeightage: "8 - 10 Marks (High Priority)",
  summary: "Directed angles, standard position on the Cartesian unit circle, compound angle identities, multiple/submultiple angles, factorisation formulas, and periodic graphs.",
  
  prerequisites: [
    "Radian vs Degree Conversion (π rad = 180°)",
    "Right-angled triangle Pythagoras theorem",
    "Cartesian Quadrants (All-Silver-Tea-Cups ASTC rule)"
  ],

  learningObjectives: [
    "Define trigonometric ratios for angles of any measure using the unit circle $x = \\cos\\theta, y = \\sin\\theta$.",
    "State sign conventions across Quadrants I, II, III, and IV using the ASTC rule.",
    "Apply compound angle theorems for $\\sin(A \\pm B)$, $\\cos(A \\pm B)$, and $\\tan(A \\pm B)$.",
    "Master multiple angle formulas: $\\sin 2\\theta, \\cos 2\\theta, \\tan 2\\theta$ and half-angle substitutions.",
    "Transform sums to products (Defactorisation) and products to sums in MHT-CET problem solving."
  ],

  conceptMap: [
    { id: "tm-1", title: "Directed Angle & Radian Measure", level: 1, connectsTo: ["tm-2"] },
    { id: "tm-2", title: "Unit Circle & ASTC Quadrants", level: 2, connectsTo: ["tm-3", "tm-4"] },
    { id: "tm-3", title: "Fundamental Identities", level: 3, connectsTo: ["tm-4"] },
    { id: "tm-4", title: "Compound Angle Theorems", level: 4, connectsTo: ["tm-5"] },
    { id: "tm-5", title: "Multiple & Submultiple Angles", level: 5, connectsTo: [] }
  ],

  modules: [
    {
      id: "math-mod-1",
      num: 1,
      title: "The Unit Circle & Trigonometric Definitions",
      simulationType: "unit-circle-sim",
      summary: "For a point $P(x,y)$ on a unit circle $x^2 + y^2 = 1$ making angle $\\theta$ with the positive x-axis, $x = \\cos\\theta$ and $y = \\sin\\theta$.",
      explanation: `
        <p>In standard position on a coordinate plane with unit circle radius $r=1$:</p>
        <div style="background: var(--bg-surface-muted); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle); margin: 12px 0;">
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px; font-family: var(--font-family-math); font-size: 1.05rem;">
            <li>• $\\cos\\theta = x$</li>
            <li>• $\\sin\\theta = y$</li>
            <li>• $\\tan\\theta = \\frac{y}{x} = \\frac{\\sin\\theta}{\\cos\\theta}$ ($x \\neq 0$)</li>
            <li>• ASTC Rule: <strong>Quadrant I</strong> (All +), <strong>Quadrant II</strong> (Sin/Cosec +), <strong>Quadrant III</strong> (Tan/Cot +), <strong>Quadrant IV</strong> (Cos/Sec +)</li>
          </ul>
        </div>
      `,
      quickCheck: {
        question: "If $\\sin\\theta = -\\frac{3}{5}$ and $\\theta$ lies in the 3rd quadrant, the value of $\\tan\\theta$ is:",
        options: ["3 / 4", "-3 / 4", "4 / 3", "-4 / 3"],
        correct: 0,
        explanation: "In Quadrant III, $\\tan\\theta$ is positive. $\\cos\\theta = -\\sqrt{1 - (-3/5)^2} = -\\frac{4}{5}$. Thus $\\tan\\theta = \\frac{-3/5}{-4/5} = \\mathbf{\\frac{3}{4}}$."
      }
    }
  ],

  formulas: [
    {
      id: "math-f-1",
      name: "Double Angle Formulas",
      latex: "\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 2\\cos^2\\theta - 1 = 1 - 2\\sin^2\\theta",
      variables: [
        { id: "theta", name: "Angle (θ in deg)", unit: "deg", default: 30 }
      ],
      calculate: (inputs) => {
        const rad = (inputs.theta * Math.PI) / 180;
        return Math.cos(2 * rad).toFixed(3);
      },
      resultUnit: "",
      resultLabel: "cos(2θ)"
    }
  ],

  workedExamples: [
    {
      id: "math-ex-1",
      title: "Worked Example: Value of tan 15° using Compound Angle Identity",
      difficulty: "Medium",
      statement: "Find the exact numerical value of $\\tan 15^\\circ$ using standard angle values.",
      steps: [
        {
          title: "Step 1: Express 15° as Difference of Standard Angles",
          body: "$$\\tan 15^\\circ = \\tan(45^\\circ - 30^\\circ)$$"
        },
        {
          title: "Step 2: Apply Compound Angle Formula",
          body: "$$\\tan(A - B) = \\frac{\\tan A - \\tan B}{1 + \\tan A \\tan B} = \\frac{\\tan 45^\\circ - \\tan 30^\\circ}{1 + \\tan 45^\\circ \\tan 30^\\circ} = \\frac{1 - 1/\\sqrt{3}}{1 + 1/\\sqrt{3}} = \\frac{\\sqrt{3} - 1}{\\sqrt{3} + 1}$$"
        },
        {
          title: "Step 3: Rationalize Denominator",
          body: "$$\\frac{(\\sqrt{3} - 1)^2}{(\\sqrt{3} + 1)(\\sqrt{3} - 1)} = \\frac{3 + 1 - 2\\sqrt{3}}{3 - 1} = \\frac{4 - 2\\sqrt{3}}{2} = \\mathbf{2 - \\sqrt{3}}$$"
        }
      ]
    }
  ],

  practiceMCQs: [
    {
      id: "mcq-math-1",
      topic: "Compound Angles",
      difficulty: "Medium",
      tag: "MHT-CET 2022",
      question: "The value of $\\cos 20^\\circ \\cos 40^\\circ \\cos 80^\\circ$ is equal to:",
      options: ["1 / 2", "1 / 4", "1 / 8", "1 / 16"],
      correct: 2,
      explanation: "Standard Identity: $\\cos\\theta \\cos(60^\\circ - \\theta) \\cos(60^\\circ + \\theta) = \\frac{1}{4}\\cos(3\\theta)$.<br>For $\\theta = 20^\\circ$: $\\frac{1}{4}\\cos(60^\\circ) = \\frac{1}{4} \\times \\frac{1}{2} = \\mathbf{\\frac{1}{8}}$."
    }
  ],

  chapterTest: [
    {
      id: "math-ct-1",
      question: "If $\\tan A = 1/2$ and $\\tan B = 1/3$, then $(A + B)$ equals:",
      options: ["π / 6", "π / 4", "π / 3", "π / 2"],
      correct: 1,
      explanation: "$\\tan(A+B) = \\frac{\\tan A + \\tan B}{1 - \\tan A \\tan B} = \\frac{1/2 + 1/3}{1 - (1/2)(1/3)} = \\frac{5/6}{5/6} = 1 \\implies A+B = 45^\\circ = \\pi/4$."
    }
  ]
};
