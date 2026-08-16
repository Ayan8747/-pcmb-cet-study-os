/**
 * Biology Subject Data - Reproduction in Lower & Higher Plants (Std XII Ch 1)
 */

export const BIOLOGY_CHAPTER_DATA = {
  id: "plant-reproduction",
  subject: "biology",
  num: 1,
  title: "Reproduction in Lower & Higher Plants",
  shortTitle: "Plant Reproduction",
  std: "Std XII",
  estimatedTime: "2.5 Hours",
  cetWeightage: "6 - 8 Marks (High Priority)",
  summary: "Asexual & sexual reproduction modes, microsporogenesis (pollen formation), megasporogenesis (embryo sac development), anemophily/hydrophily/entomophily pollination, double fertilization, endosperm types, and apomixis.",
  
  prerequisites: [
    "Flower Morphology (Calyx, Corolla, Androecium, Gynoecium)",
    "Mitosis & Meiosis cell division basics",
    "Haploid ($n$) vs Diploid ($2n$) ploidy states"
  ],

  learningObjectives: [
    "Diagram the transverse section of mature anther showing epidermis, endothecium, middle layers, and tapetum.",
    "Describe the 7-celled, 8-nucleate structure of the female gametophyte (Polygonum type embryo sac).",
    "Explain outbreeding devices that prevent autogamy (self-pollination).",
    "Elucidate the events and evolutionary significance of Double Fertilization (Syngamy + Triple Fusion).",
    "Distinguish between cellular, nuclear, and helobial endosperm development."
  ],

  conceptMap: [
    { id: "bm-1", title: "Flower Anatomy & Structure", level: 1, connectsTo: ["bm-2", "bm-3"] },
    { id: "bm-2", title: "Microsporogenesis (Pollen Grain)", level: 2, connectsTo: ["bm-4"] },
    { id: "bm-3", title: "Megasporogenesis (Embryo Sac)", level: 2, connectsTo: ["bm-4"] },
    { id: "bm-4", title: "Pollination & Outbreeding Devices", level: 3, connectsTo: ["bm-5"] },
    { id: "bm-5", title: "Double Fertilization & Seed Formation", level: 4, connectsTo: [] }
  ],

  modules: [
    {
      id: "bio-mod-1",
      num: 1,
      title: "Structure of Anther & Microsporogenesis",
      simulationType: "anther-diagram-explorer",
      summary: "Anther is bilobed and tetrasporangiate. The four wall layers are Epidermis, Endothecium (hygroscopic fibrous thickenings), Middle Layers (ephemeral), and Tapetum (nourishing layer).",
      explanation: `
        <div style="background: var(--bg-surface-muted); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle); margin: 12px 0;">
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 0.95rem;">
            <li>• <strong>Epidermis:</strong> Outermost single protective layer.</li>
            <li>• <strong>Endothecium:</strong> Cells with α-cellulosic fibrous bands; facilitates anther dehiscence.</li>
            <li>• <strong>Middle Layers:</strong> 1-3 layers of cells that degenerate in mature anther.</li>
            <li>• <strong>Tapetum:</strong> Innermost nutritive layer; secretes sporopollenin, callase, and pollenkit.</li>
          </ul>
        </div>
      `,
      quickCheck: {
        question: "Which layer of the anther wall provides nourishment to developing microspores (pollen grains)?",
        options: ["Epidermis", "Endothecium", "Middle layers", "Tapetum"],
        correct: 3,
        explanation: "The tapetum is the innermost nourishing tissue containing dense cytoplasm and multiple nuclei that nourishes microspore mother cells and developing pollen grains."
      }
    },
    {
      id: "bio-mod-2",
      num: 2,
      title: "Double Fertilization & Embryo Development",
      simulationType: "fertilization-step-explorer",
      summary: "Double fertilization is unique to Angiosperms, involving Syngamy (formation of $2n$ Zygote) and Triple Fusion (formation of $3n$ Primary Endosperm Nucleus PEN).",
      explanation: `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0;">
          <div style="padding: 12px; background: var(--bg-surface-muted); border-radius: 8px; border: 1px solid var(--border-subtle);">
            <strong>1. Syngamy (Generative):</strong>
            <p style="margin-top: 4px; font-size: 0.9rem;">1st Male Gamete ($n$) + Egg Cell ($n$) $\\rightarrow$ <strong>Diploid Zygote ($2n$)</strong></p>
          </div>
          <div style="padding: 12px; background: var(--bg-surface-muted); border-radius: 8px; border: 1px solid var(--border-subtle);">
            <strong>2. Triple Fusion (Vegetative):</strong>
            <p style="margin-top: 4px; font-size: 0.9rem;">2nd Male Gamete ($n$) + Secondary Nucleus ($2n$) $\\rightarrow$ <strong>Triploid PEN ($3n$)</strong></p>
          </div>
        </div>
      `,
      quickCheck: {
        question: "The ploidy level of Primary Endosperm Nucleus (PEN) in typical angiosperms is:",
        options: ["Haploid (n)", "Diploid (2n)", "Triploid (3n)", "Tetraploid (4n)"],
        correct: 2,
        explanation: "Triple fusion involves the fusion of one haploid male gamete ($n$) with the diploid secondary nucleus ($2n$), resulting in a triploid ($3n$) PEN."
      }
    }
  ],

  formulas: [
    {
      id: "bio-f-1",
      name: "Meiotic Divisions required for N seeds",
      latex: "\\text{Divisions} = N + \\frac{N}{4} = \\frac{5N}{4}",
      variables: [
        { id: "N", name: "Number of Seeds (N)", unit: "seeds", default: 100 }
      ],
      calculate: (inputs) => Math.ceil(inputs.N + inputs.N / 4),
      resultUnit: "meiotic divisions",
      resultLabel: "Total Meioses Needed"
    }
  ],

  workedExamples: [
    {
      id: "bio-ex-1",
      title: "Worked Example: Calculation of Meiotic Divisions for Grain Production",
      difficulty: "MHT-CET Level",
      statement: "How many meiotic divisions are required to produce 200 viable seeds of wheat?",
      steps: [
        {
          title: "Step 1: Microspores (Pollen Grains) Requirement",
          body: "1 meiotic division of microspore mother cell produces 4 functional pollen grains.<br>To get 200 pollen grains: $$\\frac{200}{4} = 50\\text{ meiotic divisions}$$"
        },
        {
          title: "Step 2: Megaspores (Ovules) Requirement",
          body: "1 meiotic division of megaspore mother cell produces 1 functional megaspore (3 degenerate).<br>To get 200 functional megaspores: $$200\\text{ meiotic divisions}$$"
        },
        {
          title: "Step 3: Total Meiotic Divisions",
          body: "$$\\text{Total Meioses} = 50 + 200 = \\mathbf{250\\text{ divisions}}$$"
        }
      ]
    }
  ],

  practiceMCQs: [
    {
      id: "mcq-bio-1",
      topic: "Ploidy & Endosperm",
      difficulty: "Medium",
      tag: "MHT-CET 2022",
      question: "If the root cells of a gymnosperm plant have 24 chromosomes, the number of chromosomes in its endosperm will be:",
      options: ["12", "24", "36", "48"],
      correct: 0,
      explanation: "In gymnosperms, endosperm is formed before fertilization directly from the female gametophyte and is haploid ($n$). Since root cells are diploid ($2n = 24$), the haploid endosperm has $n = \\mathbf{12}$ chromosomes."
    }
  ],

  chapterTest: [
    {
      id: "bio-ct-1",
      question: "Entry of pollen tube through the micropyle into the ovule is called:",
      options: ["Porogamy", "Chalazogamy", "Mesogamy", "Apogamy"],
      correct: 0,
      explanation: "Porogamy is the common mode of pollen tube entry through the micropyle."
    }
  ]
};
