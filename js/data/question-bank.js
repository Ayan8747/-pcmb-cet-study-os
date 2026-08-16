/**
 * Centralized Practice Question Bank for PCMB MHT-CET Platform
 */

export const QUESTION_BANK = [
  // Physics Questions
  {
    id: "qb-phy-1",
    subject: "physics",
    chapterId: "kinematics",
    chapterTitle: "Kinematics & Motion in a Plane",
    topic: "Distance and Displacement",
    difficulty: "Easy",
    tag: "PYQ 2021",
    type: "mcq",
    question: "A body moves along a circular path of radius r. What is the displacement after completing 3/4th of a revolution?",
    options: [
      "2r",
      "r * sqrt(2)",
      "3 * pi * r / 2",
      "pi * r"
    ],
    correct: 1,
    explanation: "At 3/4th revolution, the angle between initial and final position vectors is 90°. The displacement is the straight line chord length: $\\sqrt{r^2 + r^2} = r\\sqrt{2}$."
  },
  {
    id: "qb-phy-2",
    subject: "physics",
    chapterId: "kinematics",
    chapterTitle: "Kinematics & Motion in a Plane",
    topic: "Projectile Motion",
    difficulty: "Medium",
    tag: "PYQ 2022",
    type: "mcq",
    question: "The horizontal range of a projectile is 4 times its maximum height. The angle of projection is:",
    options: [
      "30°",
      "45°",
      "60°",
      "90°"
    ],
    correct: 1,
    explanation: "We know $R = 4H \\cot\\theta$. Since $R = 4H$, we have $4H = 4H \\cot\\theta \\implies \\cot\\theta = 1 \\implies \\theta = 45^\\circ$."
  },
  {
    id: "qb-phy-3",
    subject: "physics",
    chapterId: "kinematics",
    chapterTitle: "Kinematics & Motion in a Plane",
    topic: "Kinematic Graphs",
    difficulty: "Hard",
    tag: "Concept Mastery",
    type: "mcq",
    question: "The displacement-time graph of a moving particle is a parabola opening downwards. The acceleration of the particle is:",
    options: [
      "Zero",
      "Constant and positive",
      "Constant and negative",
      "Linearly increasing"
    ],
    correct: 2,
    explanation: "Equation of a downward-opening parabola is $s(t) = -kt^2 + bt + c$. Differentiating twice yields $a(t) = \\frac{d^2s}{dt^2} = -2k < 0$, which is constant and negative."
  },

  // Chemistry Questions
  {
    id: "qb-chem-1",
    subject: "chemistry",
    chapterId: "solid-state",
    chapterTitle: "Solid State",
    topic: "Unit Cell Calculations",
    difficulty: "Easy",
    tag: "MHT-CET 2020",
    type: "mcq",
    question: "How many total lattice points are there in one Face-Centered Cubic (FCC) unit cell?",
    options: [
      "8",
      "12",
      "14",
      "4"
    ],
    correct: 2,
    explanation: "An FCC unit cell has 8 corner lattice points + 6 face-center lattice points = 14 lattice points. (The net number of constituent atoms is 4, but total lattice points is 14)."
  },
  {
    id: "qb-chem-2",
    subject: "chemistry",
    chapterId: "solid-state",
    chapterTitle: "Solid State",
    topic: "Crystal Geometry",
    difficulty: "Medium",
    tag: "MHT-CET 2021",
    type: "mcq",
    question: "In a face-centered cubic lattice, atom A occupies the corners and atom B occupies the face centres. If one atom B is missing from one face, the empirical formula of the compound is:",
    options: [
      "AB2",
      "A2B5",
      "A2B3",
      "AB3"
    ],
    correct: 1,
    explanation: "Number of A atoms (corners) = $8 \\times 1/8 = 1$.<br>Number of B atoms (5 faces remaining) = $5 \\times 1/2 = 2.5 = 5/2$.<br>Ratio $A : B = 1 : 5/2 = 2 : 5 \\implies \\mathbf{A_2B_5}$."
  },

  // Mathematics Questions
  {
    id: "qb-math-1",
    subject: "mathematics",
    chapterId: "trigonometry",
    chapterTitle: "Trigonometric Functions",
    topic: "Identities",
    difficulty: "Easy",
    tag: "MHT-CET 2021",
    type: "mcq",
    question: "If sin θ + cos θ = 1, then the value of sin(2θ) is:",
    options: [
      "0",
      "1",
      "1/2",
      "-1"
    ],
    correct: 0,
    explanation: "Squaring both sides: $(\\sin\\theta + \\cos\\theta)^2 = 1^2 \\implies \\sin^2\\theta + \\cos^2\\theta + 2\\sin\\theta\\cos\\theta = 1 \\implies 1 + \\sin(2\\theta) = 1 \\implies \\sin(2\\theta) = \\mathbf{0}$."
  },
  {
    id: "qb-math-2",
    subject: "mathematics",
    chapterId: "trigonometry",
    chapterTitle: "Trigonometric Functions",
    topic: "Range and Periodicity",
    difficulty: "Medium",
    tag: "MHT-CET 2023",
    type: "mcq",
    question: "The maximum value of 3 sin x + 4 cos x + 7 is:",
    options: [
      "12",
      "14",
      "7",
      "5"
    ],
    correct: 0,
    explanation: "The expression $a\\sin x + b\\cos x$ has a maximum value of $\\sqrt{a^2 + b^2} = \\sqrt{3^2 + 4^2} = 5$. Thus maximum value of $(3\\sin x + 4\\cos x + 7) = 5 + 7 = \\mathbf{12}$."
  },

  // Biology Questions
  {
    id: "qb-bio-1",
    subject: "biology",
    chapterId: "plant-reproduction",
    chapterTitle: "Reproduction in Lower & Higher Plants",
    topic: "Microsporogenesis",
    difficulty: "Easy",
    tag: "MHT-CET 2022",
    type: "mcq",
    question: "The hard, highly resistant outer layer of pollen grain (exine) is made of:",
    options: [
      "Pectocellulose",
      "Sporopollenin",
      "Lignin",
      "Cellulose"
    ],
    correct: 1,
    explanation: "Exine is composed of sporopollenin, one of the most resistant biological substances known, which protects pollen from enzymatic degradation and temperature extremes."
  },
  {
    id: "qb-bio-2",
    subject: "biology",
    chapterId: "plant-reproduction",
    chapterTitle: "Reproduction in Lower & Higher Plants",
    topic: "Embryo Sac Structure",
    difficulty: "Medium",
    tag: "MHT-CET 2023",
    type: "mcq",
    question: "The filiform apparatus is a characteristic cellular feature of:",
    options: [
      "Antipodal cells",
      "Egg cell",
      "Synergids",
      "Central cell"
    ],
    correct: 2,
    explanation: "Synergids possess prominent finger-like cytoplasmic projections known as filiform apparatus at their micropylar end, which guides the pollen tube entry into the synergid."
  }
];
