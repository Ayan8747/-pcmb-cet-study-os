/**
 * Production Chapter Data: Physics - Motion in a Plane & Kinematics
 * Fully conforming to Maharashtra State Board Textbook (Std XI Ch 3) & MHT-CET specs.
 */

export const KINEMATICS_CHAPTER_DATA = {
  id: "kinematics",
  subject: "physics",
  num: 1,
  title: "Motion in a Plane & 1D Kinematics",
  shortTitle: "Kinematics",
  std: "Std XI",
  estimatedTime: "2.5 Hours",
  cetWeightage: "4 - 6 Marks (High Priority)",
  summary: "Comprehensive study of rectilinear motion, position vectors, displacement vs distance, uniform & variable velocity, acceleration, calculus analysis of s-t/v-t/a-t graphs, and 2D projectile trajectory dynamics.",
  
  prerequisites: [
    "Basic Trigonometry (sin, cos, tan, standard angles)",
    "Vector Addition & Rectangular Components (Ax = A cosθ, Ay = A sinθ)",
    "Introductory Calculus (dx/dt as rate of change, ∫ dt as summation)"
  ],
  
  learningObjectives: [
    "Distinguish clearly between scalar path length (distance) and vector displacement.",
    "Derive and apply the three kinematic equations of rectilinear motion with uniform acceleration.",
    "Interpret physical meanings of slopes and areas under s-t, v-t, and a-t graphs.",
    "Model 2D projectile motion by resolving horizontal (uniform) and vertical (free fall) components.",
    "Calculate time of flight, maximum height, horizontal range, and trajectory equation."
  ],

  conceptMap: [
    { id: "cm-1", title: "Frame of Reference & Position", level: 1, connectsTo: ["cm-2", "cm-3"] },
    { id: "cm-2", title: "Distance vs. Displacement", level: 2, connectsTo: ["cm-4"] },
    { id: "cm-3", title: "Speed & Velocity Vectors", level: 2, connectsTo: ["cm-4", "cm-5"] },
    { id: "cm-4", title: "Acceleration & Kinematic Eqns", level: 3, connectsTo: ["cm-5", "cm-6"] },
    { id: "cm-5", title: "s-t, v-t, a-t Graphs Analysis", level: 4, connectsTo: ["cm-6"] },
    { id: "cm-6", title: "2D Projectile Motion", level: 5, connectsTo: [] }
  ],

  modules: [
    {
      id: "mod-1",
      num: 1,
      title: "Position, Reference Frames & Coordinate Systems",
      simulationType: "position-ref",
      summary: "Motion is purely relative. To specify the state of rest or motion of an object, we must define a reference point (origin) and a coordinate frame.",
      explanation: `
        <p>In physics, <strong>motion</strong> is defined as a continuous change in the position of an object over time relative to a chosen reference frame.</p>
        <div class="note-box" style="margin: 12px 0; padding: 12px; background: var(--subject-phy-light); border-left: 3px solid var(--subject-phy); border-radius: 4px;">
          <strong>Core Principle:</strong> Rest and motion are relative terms. An object resting inside a moving train is at rest relative to co-passengers, but in motion relative to an observer on the platform.
        </div>
        <p>The position vector $\\vec{r}$ of a point $P(x, y, z)$ in a Cartesian coordinate system with origin $O(0,0,0)$ is given by:</p>
        <p style="font-family: var(--font-family-math); text-align: center; font-size: 1.15rem; margin: 8px 0;">$$\\vec{r} = x\\hat{i} + y\\hat{j} + z\\hat{k}$$</p>
      `,
      quickCheck: {
        question: "A passenger sitting in an airplane flying with constant velocity at 800 km/h drops a coin. For the passenger, the path of the coin is:",
        options: [
          "A vertical straight line downwards",
          "A parabolic curve towards the back of plane",
          "A forward curved path",
          "A circular arc"
        ],
        correct: 0,
        explanation: "Because both the passenger and the coin share the same horizontal velocity, with respect to the passenger's reference frame, the coin accelerates straight down vertically under gravity."
      }
    },
    {
      id: "mod-2",
      num: 2,
      title: "Distance vs. Displacement",
      simulationType: "number-line-1d",
      summary: "Distance is the actual scalar path length traversed, while displacement is the shortest directed straight-line vector from initial to final position.",
      explanation: `
        <p>Understanding the fundamental distinction between scalar distance and vector displacement is vital for MHT-CET mechanics:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.9rem;">
          <thead>
            <tr style="background: var(--bg-surface-muted); text-align: left;">
              <th style="padding: 8px; border: 1px solid var(--border-subtle);">Parameter</th>
              <th style="padding: 8px; border: 1px solid var(--border-subtle);">Distance ($s$)</th>
              <th style="padding: 8px; border: 1px solid var(--border-subtle);">Displacement ($\\Delta \\vec{r}$)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);"><strong>Nature</strong></td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);">Scalar (Magnitude only)</td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);">Vector (Magnitude & Direction)</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);"><strong>Sign</strong></td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);">Always $\\ge 0$</td>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);">Can be positive, negative, or zero</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid var(--border-subtle);"><strong>Key Relation</strong></td>
              <td colspan="2" style="padding: 8px; border: 1px solid var(--border-subtle); text-align: center;"><strong>Distance $\\ge$ |Displacement|</strong> (Equality holds only for 1D unidirectional motion)</td>
            </tr>
          </tbody>
        </table>
      `,
      quickCheck: {
        question: "A particle travels along a semicircle of radius $R$ from point A to point B. The ratio of distance travelled to the magnitude of displacement is:",
        options: [
          "π : 2",
          "2 : π",
          "π : 1",
          "1 : 1"
        ],
        correct: 0,
        explanation: "Distance along semicircle = $\\pi R$. Magnitude of straight line displacement from A to B (diameter) = $2R$. Ratio = $\\frac{\\pi R}{2R} = \\frac{\\pi}{2}$."
      }
    },
    {
      id: "mod-3",
      num: 3,
      title: "Speed, Velocity & Instantaneous Rates",
      simulationType: "velocity-runner",
      summary: "Speed is the scalar rate of distance covered. Velocity is the vector rate of change of displacement ($v = ds/dt$).",
      explanation: `
        <p>In non-uniform motion, we differentiate between average and instantaneous quantities:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0;">
          <div style="padding: 12px; background: var(--bg-surface-muted); border-radius: 8px; border: 1px solid var(--border-subtle);">
            <strong>Average Velocity:</strong>
            <p style="font-family: var(--font-family-math); margin-top: 4px;">$$\\vec{v}_{avg} = \\frac{\\Delta \\vec{r}}{\\Delta t} = \\frac{\\vec{r}_2 - \\vec{r}_1}{t_2 - t_1}$$</p>
          </div>
          <div style="padding: 12px; background: var(--bg-surface-muted); border-radius: 8px; border: 1px solid var(--border-subtle);">
            <strong>Instantaneous Velocity:</strong>
            <p style="font-family: var(--font-family-math); margin-top: 4px;">$$\\vec{v} = \\lim_{\\Delta t \\to 0} \\frac{\\Delta \\vec{r}}{\\Delta t} = \\frac{d\\vec{r}}{dt}$$</p>
          </div>
        </div>
      `,
      quickCheck: {
        question: "A car covers first half of total distance with speed $v_1$ and second half with speed $v_2$. The average speed of the car for the entire journey is:",
        options: [
          "(v1 + v2) / 2",
          "2 * v1 * v2 / (v1 + v2)",
          "sqrt(v1 * v2)",
          "v1 * v2 / (v1 + v2)"
        ],
        correct: 1,
        explanation: "Total distance = $2s$. Total time = $t_1 + t_2 = \\frac{s}{v_1} + \\frac{s}{v_2} = s(\\frac{v_1+v_2}{v_1 v_2})$. Average speed = $\\frac{2s}{s(v_1+v_2)/(v_1 v_2)} = \\frac{2 v_1 v_2}{v_1 + v_2}$ (Harmonic Mean)."
      }
    },
    {
      id: "mod-4",
      num: 4,
      title: "Acceleration & Kinematic Equations of Motion",
      simulationType: "acceleration-1d",
      summary: "Acceleration is the time rate of change of velocity ($a = dv/dt$). For uniform acceleration, the three foundational kinematic equations govern all motion.",
      explanation: `
        <p>When acceleration $\\vec{a}$ is constant in magnitude and direction along a straight line:</p>
        <div style="background: var(--bg-surface-muted); padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle); margin: 12px 0;">
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-family: var(--font-family-math); font-size: 1.1rem;">
            <li>1. First Equation: $$v = u + at$$</li>
            <li>2. Second Equation: $$s = ut + \\frac{1}{2}at^2$$</li>
            <li>3. Third Equation: $$v^2 = u^2 + 2as$$</li>
            <li>4. Displacement in $n^{th}$ second: $$S_n = u + \\frac{a}{2}(2n - 1)$$</li>
          </ul>
        </div>
      `,
      quickCheck: {
        question: "A body starting from rest moves with uniform acceleration $a$. The ratio of distances covered by it in 1st, 2nd, and 3rd seconds is:",
        options: [
          "1 : 3 : 5",
          "1 : 4 : 9",
          "1 : 2 : 3",
          "1 : 1 : 1"
        ],
        correct: 0,
        explanation: "Using $S_n = 0 + \\frac{a}{2}(2n - 1)$. For $n = 1$: $S_1 = \\frac{a}{2}(1)$. For $n = 2$: $S_2 = \\frac{a}{2}(3)$. For $n = 3$: $S_3 = \\frac{a}{2}(5)$. Thus ratio is $1 : 3 : 5$ (Galileo's odd numbers law)."
      }
    },
    {
      id: "mod-5",
      num: 5,
      title: "Kinematic Graph Analysis (s-t, v-t, a-t)",
      simulationType: "graphs-engine",
      summary: "Graphical calculus is central to MHT-CET. The slope of s-t yields velocity; the slope of v-t yields acceleration; the area under v-t yields displacement; the area under a-t yields velocity change.",
      explanation: `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0;">
          <div style="padding: 12px; background: var(--bg-surface-muted); border-radius: 8px; border: 1px solid var(--border-subtle);">
            <strong>Slope Relationships:</strong>
            <ul style="margin-top: 6px; padding-left: 16px; font-size: 0.9rem;">
              <li>Slope of $s-t$ graph = $\\frac{ds}{dt} = v$ (Velocity)</li>
              <li>Slope of $v-t$ graph = $\\frac{dv}{dt} = a$ (Acceleration)</li>
            </ul>
          </div>
          <div style="padding: 12px; background: var(--bg-surface-muted); border-radius: 8px; border: 1px solid var(--border-subtle);">
            <strong>Area Relationships:</strong>
            <ul style="margin-top: 6px; padding-left: 16px; font-size: 0.9rem;">
              <li>Area under $v-t$ curve = $\\int v \\, dt = \\Delta s$ (Displacement)</li>
              <li>Area under $a-t$ curve = $\\int a \\, dt = \\Delta v$ (Change in Velocity)</li>
            </ul>
          </div>
        </div>
      `,
      quickCheck: {
        question: "In a velocity-time graph, a horizontal straight line parallel to the time axis signifies that:",
        options: [
          "The object is moving with constant non-zero acceleration",
          "The object is moving with uniform velocity (acceleration = 0)",
          "The object is at rest",
          "The displacement is zero"
        ],
        correct: 1,
        explanation: "A horizontal line on a v-t plot has a slope of zero ($\\frac{dv}{dt} = 0$), meaning the velocity remains constant over time and acceleration is zero."
      }
    },
    {
      id: "mod-6",
      num: 6,
      title: "Two-Dimensional Projectile Motion",
      simulationType: "projectile-2d",
      summary: "A projectile moves under gravity in two dimensions. We decouple the motion into independent horizontal (zero acceleration, $v_x = u\\cos\\theta$) and vertical ($a_y = -g$) components.",
      explanation: `
        <p>For a projectile launched with initial velocity $u$ at an angle $\\theta$ above the horizontal:</p>
        <div style="background: var(--bg-surface-muted); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle); margin: 12px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: var(--font-family-math); font-size: 1.05rem;">
            <div>1. Time of Flight: $$T = \\frac{2u \\sin\\theta}{g}$$</div>
            <div>2. Maximum Height: $$H = \\frac{u^2 \\sin^2\\theta}{2g}$$</div>
            <div>3. Horizontal Range: $$R = \\frac{u^2 \\sin(2\\theta)}{g}$$</div>
            <div>4. Trajectory Equation: $$y = x\\tan\\theta - \\frac{g x^2}{2u^2 \\cos^2\\theta}$$</div>
          </div>
        </div>
      `,
      quickCheck: {
        question: "For an initial launch speed $u$, the maximum horizontal range $R_{max}$ is attained when the projection angle $\\theta$ is:",
        options: [
          "30°",
          "45°",
          "60°",
          "90°"
        ],
        correct: 1,
        explanation: "$R = \\frac{u^2 \\sin(2\\theta)}{g}$. The value of $\\sin(2\\theta)$ reaches its maximum of $1$ when $2\\theta = 90^\\circ \\implies \\theta = 45^\\circ$. At this angle, $R_{max} = \\frac{u^2}{g}$."
      }
    }
  ],

  formulas: [
    {
      id: "f-1",
      name: "Velocity-Time Relation",
      latex: "v = u + a \\cdot t",
      variables: [
        { id: "u", name: "Initial Velocity (u)", unit: "m/s", default: 10 },
        { id: "a", name: "Acceleration (a)", unit: "m/s²", default: 2 },
        { id: "t", name: "Time (t)", unit: "s", default: 5 }
      ],
      calculate: (inputs) => (inputs.u + inputs.a * inputs.t).toFixed(2),
      resultUnit: "m/s",
      resultLabel: "Final Velocity (v)"
    },
    {
      id: "f-2",
      name: "Displacement-Time Relation",
      latex: "s = u \\cdot t + \\frac{1}{2} a \\cdot t^2",
      variables: [
        { id: "u", name: "Initial Velocity (u)", unit: "m/s", default: 10 },
        { id: "a", name: "Acceleration (a)", unit: "m/s²", default: 2 },
        { id: "t", name: "Time (t)", unit: "s", default: 5 }
      ],
      calculate: (inputs) => (inputs.u * inputs.t + 0.5 * inputs.a * Math.pow(inputs.t, 2)).toFixed(2),
      resultUnit: "m",
      resultLabel: "Displacement (s)"
    },
    {
      id: "f-3",
      name: "Velocity-Displacement Relation",
      latex: "v = \\sqrt{u^2 + 2 \\cdot a \\cdot s}",
      variables: [
        { id: "u", name: "Initial Velocity (u)", unit: "m/s", default: 10 },
        { id: "a", name: "Acceleration (a)", unit: "m/s²", default: 2 },
        { id: "s", name: "Displacement (s)", unit: "m", default: 75 }
      ],
      calculate: (inputs) => Math.sqrt(Math.max(0, Math.pow(inputs.u, 2) + 2 * inputs.a * inputs.s)).toFixed(2),
      resultUnit: "m/s",
      resultLabel: "Final Velocity (v)"
    },
    {
      id: "f-4",
      name: "Projectile Maximum Height",
      latex: "H_{max} = \\frac{u^2 \\sin^2\\theta}{2g}",
      variables: [
        { id: "u", name: "Launch Velocity (u)", unit: "m/s", default: 20 },
        { id: "theta", name: "Launch Angle (θ)", unit: "deg", default: 45 },
        { id: "g", name: "Gravity (g)", unit: "m/s²", default: 9.8 }
      ],
      calculate: (inputs) => {
        const rad = (inputs.theta * Math.PI) / 180;
        return (Math.pow(inputs.u * Math.sin(rad), 2) / (2 * inputs.g)).toFixed(2);
      },
      resultUnit: "m",
      resultLabel: "Max Height (H)"
    },
    {
      id: "f-5",
      name: "Projectile Horizontal Range",
      latex: "R = \\frac{u^2 \\sin(2\\theta)}{g}",
      variables: [
        { id: "u", name: "Launch Velocity (u)", unit: "m/s", default: 20 },
        { id: "theta", name: "Launch Angle (θ)", unit: "deg", default: 45 },
        { id: "g", name: "Gravity (g)", unit: "m/s²", default: 9.8 }
      ],
      calculate: (inputs) => {
        const rad = (inputs.theta * Math.PI) / 180;
        return ((Math.pow(inputs.u, 2) * Math.sin(2 * rad)) / inputs.g).toFixed(2);
      },
      resultUnit: "m",
      resultLabel: "Horizontal Range (R)"
    }
  ],

  workedExamples: [
    {
      id: "ex-1",
      title: "Worked Example 1: Acceleration from Rest and Stopping Distance",
      difficulty: "Medium",
      statement: "A car starts from rest and accelerates uniformly at 2.5 m/s² for 10 seconds. The driver then applies the brakes, bringing the car to a stop in 5 seconds with uniform deceleration. Determine: (a) Maximum velocity reached, (b) Deceleration magnitude, and (c) Total distance covered.",
      steps: [
        {
          title: "Phase 1: Accelerated Motion (t = 0 to 10 s)",
          body: "Initial velocity $u = 0$, $a_1 = 2.5\\text{ m/s}^2$, $t_1 = 10\\text{ s}$.<br>$$v_{max} = u + a_1 t_1 = 0 + 2.5(10) = 25\\text{ m/s}$$<br>Distance $s_1 = ut_1 + \\frac{1}{2}a_1 t_1^2 = 0 + \\frac{1}{2}(2.5)(100) = 125\\text{ m}$."
        },
        {
          title: "Phase 2: Braking & Deceleration (t = 10 to 15 s)",
          body: "Initial speed for braking $u_2 = 25\\text{ m/s}$, final speed $v_2 = 0$, $t_2 = 5\\text{ s}$.<br>$$a_2 = \\frac{v_2 - u_2}{t_2} = \\frac{0 - 25}{5} = -5\\text{ m/s}^2$$<br>Magnitude of deceleration = $5\\text{ m/s}^2$.<br>Distance during braking $s_2 = u_2 t_2 + \\frac{1}{2} a_2 t_2^2 = 25(5) + \\frac{1}{2}(-5)(25) = 125 - 62.5 = 62.5\\text{ m}$."
        },
        {
          title: "Phase 3: Total Distance",
          body: "$$s_{total} = s_1 + s_2 = 125\\text{ m} + 62.5\\text{ m} = \\mathbf{187.5\\text{ m}}$$"
        }
      ]
    },
    {
      id: "ex-2",
      title: "Worked Example 2: Projectile Motion Range & Velocity Vector at Peak",
      difficulty: "MHT-CET Level",
      statement: "A projectile is thrown with an initial velocity of 40 m/s at an angle of 30° to the horizontal. Take g = 10 m/s². Calculate: (a) Time of flight, (b) Maximum height, (c) Horizontal range, and (d) Velocity at the highest point.",
      steps: [
        {
          title: "Step 1: Resolve Velocity Components",
          body: "$$u_x = u \\cos 30^\\circ = 40 \\times \\frac{\\sqrt{3}}{2} = 20\\sqrt{3} \\approx 34.64\\text{ m/s}$$<br>$$u_y = u \\sin 30^\\circ = 40 \\times \\frac{1}{2} = 20\\text{ m/s}$$"
        },
        {
          title: "Step 2: Flight Time, Max Height, and Range",
          body: "Time of flight: $$T = \\frac{2 u_y}{g} = \\frac{2(20)}{10} = \\mathbf{4.0\\text{ s}}$$<br>Max height: $$H = \\frac{u_y^2}{2g} = \\frac{(20)^2}{2(10)} = \\frac{400}{20} = \\mathbf{20.0\\text{ m}}$$<br>Range: $$R = u_x \\times T = (20\\sqrt{3}) \\times 4 = 80\\sqrt{3} \\approx \\mathbf{138.56\\text{ m}}$$"
        },
        {
          title: "Step 3: Velocity at Highest Point",
          body: "At the peak, vertical velocity $v_y = 0$. Horizontal velocity is constant: $$v_{peak} = u_x = 20\\sqrt{3}\\text{ m/s} = \\mathbf{34.64\\text{ m/s}\\text{ horizontally}}$$"
        }
      ]
    }
  ],

  practiceMCQs: [
    {
      id: "mcq-kin-1",
      topic: "Distance and Displacement",
      difficulty: "Easy",
      tag: "Concept Check",
      question: "A runner completes one full round of a circular track of radius 70 m in 40 seconds. At the end of 2 minutes 20 seconds, what is the magnitude of the displacement from the starting point?",
      options: [
        "0 m",
        "140 m",
        "220 m",
        "440 m"
      ],
      correct: 1,
      explanation: "Total time = 2 min 20 s = 140 s.<br>Number of rounds = 140 / 40 = 3.5 rounds.<br>After 3 complete rounds, the runner is back at the starting point. The extra 0.5 round puts the runner at the diametrically opposite point.<br>Displacement = Diameter = $2R = 2 \\times 70 = \\mathbf{140\\text{ m}}$."
    },
    {
      id: "mcq-kin-2",
      topic: "Kinematic Equations",
      difficulty: "Medium",
      tag: "MHT-CET 2021",
      question: "A bullet fired into a wooden block loses half of its velocity after penetrating a distance of 3 cm. Assuming uniform resistance, how much further will it penetrate before coming to rest?",
      options: [
        "1 cm",
        "2 cm",
        "3 cm",
        "4 cm"
      ],
      correct: 0,
      explanation: "Let initial speed be $u$. In 1st case, final speed is $u/2$ over $s_1 = 3\\text{ cm}$.<br>Using $v^2 = u^2 + 2as$:<br>$(u/2)^2 = u^2 + 2a(3) \\implies \\frac{u^2}{4} - u^2 = 6a \\implies 6a = -\\frac{3u^2}{4} \\implies 2a = -\\frac{u^2}{4}$.<br>For the remainder until rest ($v = 0$):<br>$0^2 = (u/2)^2 + 2a(s_2) \\implies \\frac{u^2}{4} = -2a(s_2) = \\frac{u^2}{4} s_2 \\implies s_2 = \\mathbf{1\\text{ cm}}$."
    },
    {
      id: "mcq-kin-3",
      topic: "Galileo Odd Numbers Law",
      difficulty: "Medium",
      tag: "MHT-CET 2022",
      question: "A ball is dropped from the top of a tower. If it covers a distance of 45 m in its last second before hitting the ground, find the total height of the tower. (Take g = 10 m/s²)",
      options: [
        "80 m",
        "100 m",
        "125 m",
        "145 m"
      ],
      correct: 2,
      explanation: "Using $S_n = u + \\frac{g}{2}(2n - 1)$ with $u = 0$:<br>$45 = 0 + \\frac{10}{2}(2n - 1) \\implies 45 = 5(2n - 1) \\implies 9 = 2n - 1 \\implies 2n = 10 \\implies n = 5\\text{ seconds}$.<br>Total height $H = \\frac{1}{2}gt^2 = \\frac{1}{2}(10)(5^2) = 5 \\times 25 = \\mathbf{125\\text{ m}}$."
    },
    {
      id: "mcq-kin-4",
      topic: "Projectile Motion",
      difficulty: "MHT-CET Level",
      tag: "MHT-CET 2023",
      question: "Two projectiles are projected with the same initial speed $u$ from the same point at angles $(45^\\circ - \\alpha)$ and $(45^\\circ + \\alpha)$ to the horizontal. The ratio of their horizontal ranges is:",
      options: [
        "1 : 1",
        "1 : 2",
        "cos 2α : sin 2α",
        "tan α : 1"
      ],
      correct: 0,
      explanation: "Two angles $\\theta_1 = 45^\\circ - \\alpha$ and $\\theta_2 = 45^\\circ + \\alpha$ are complementary because $\\theta_1 + \\theta_2 = 90^\\circ$.<br>For complementary angles of projection with equal initial speeds, the horizontal ranges are always equal ($R_1 = R_2$).<br>Hence, the ratio is $\\mathbf{1 : 1}$."
    },
    {
      id: "mcq-kin-5",
      topic: "Graph Analysis",
      difficulty: "Hard",
      tag: "MHT-CET High Yield",
      question: "A particle starts from rest and its acceleration varies with time according to $a(t) = 3t^2 + 2t$. Its velocity at $t = 2\\text{ seconds}$ is:",
      options: [
        "8 m/s",
        "12 m/s",
        "16 m/s",
        "20 m/s"
      ],
      correct: 1,
      explanation: "$$v(t) = \\int_0^t a(t)\\,dt = \\int_0^2 (3t^2 + 2t)\\,dt = [t^3 + t^2]_0^2 = (2^3 + 2^2) = 8 + 4 = \\mathbf{12\\text{ m/s}}$$"
    }
  ],

  chapterTest: [
    {
      id: "ct-1",
      question: "The displacement of a particle moving along x-axis is given by $x = 8t - 2t^2$. The particle momentarily comes to rest at time $t$ equal to:",
      options: ["1 s", "2 s", "4 s", "8 s"],
      correct: 1,
      explanation: "$v = \\frac{dx}{dt} = 8 - 4t$. Setting $v = 0 \\implies 8 - 4t = 0 \\implies t = 2\\text{ s}$."
    },
    {
      id: "ct-2",
      question: "If a body is released from a height $h$, the velocity with which it strikes the ground is proportional to:",
      options: ["h", "h^(1/2)", "h^2", "h^(3/2)"],
      correct: 1,
      explanation: "Using $v^2 = u^2 + 2gh$ with $u = 0$, $v = \\sqrt{2gh} \\propto h^{1/2}$."
    },
    {
      id: "ct-3",
      question: "An object is thrown vertically upwards with speed $u$. At the highest point of its trajectory, its acceleration is:",
      options: ["0", "g downwards", "g upwards", "u / g"],
      correct: 1,
      explanation: "Gravity acts continuously downwards with acceleration $g$, regardless of the instantaneous velocity of the body."
    },
    {
      id: "ct-4",
      question: "For a projectile launched at $60^\\circ$ with kinetic energy $K$, what is the kinetic energy at the highest point of flight?",
      options: ["K", "K / 2", "K / 4", "3K / 4"],
      correct: 2,
      explanation: "At highest point, velocity is $u_x = u\\cos 60^\\circ = u/2$. Kinetic energy = $\\frac{1}{2}m(u/2)^2 = \\frac{1}{4}(\\frac{1}{2}mu^2) = K/4$."
    },
    {
      id: "ct-5",
      question: "The area under an acceleration-time ($a-t$) curve between $t_1$ and $t_2$ represents:",
      options: ["Displacement", "Change in velocity", "Average speed", "Total distance"],
      correct: 1,
      explanation: "By definition, $\\int_{t_1}^{t_2} a\\,dt = v(t_2) - v(t_1) = \\Delta v$ (change in velocity)."
    },
    {
      id: "ct-6",
      question: "A stone is dropped into a well of depth 80 m. If the speed of sound in air is 320 m/s and g = 10 m/s², the sound of splash is heard after:",
      options: ["4.00 s", "4.25 s", "4.50 s", "5.00 s"],
      correct: 1,
      explanation: "Time to drop: $t_1 = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{160}{10}} = 4\\text{ s}$. Time for sound to travel up: $t_2 = \\frac{h}{v_{sound}} = \\frac{80}{320} = 0.25\\text{ s}$. Total time = $4 + 0.25 = 4.25\\text{ s}$."
    },
    {
      id: "ct-7",
      question: "A body travels equal distances with speeds $v_1, v_2, v_3$. Its average speed is:",
      options: ["(v1 + v2 + v3)/3", "3 / (1/v1 + 1/v2 + 1/v3)", "sqrt(v1*v2*v3)", "(v1*v2*v3)/3"],
      correct: 1,
      explanation: "For 3 equal distance segments, $v_{avg} = \\frac{3s}{s/v_1 + s/v_2 + s/v_3} = \\frac{3}{1/v_1 + 1/v_2 + 1/v_3}$."
    },
    {
      id: "ct-8",
      question: "The angle between velocity and acceleration vectors at the top of a projectile's trajectory is:",
      options: ["0°", "45°", "90°", "180°"],
      correct: 2,
      explanation: "At the peak, velocity vector is purely horizontal ($v_x\\hat{i}$) while acceleration due to gravity is purely downwards ($-g\\hat{j}$), making the angle $90^\\circ$."
    },
    {
      id: "ct-9",
      question: "A particle moves in a straight line with constant acceleration. If its velocity changes from 10 m/s to 20 m/s while covering 30 m, find the acceleration.",
      options: ["2.5 m/s²", "5.0 m/s²", "7.5 m/s²", "10.0 m/s²"],
      correct: 1,
      explanation: "$v^2 = u^2 + 2as \\implies 20^2 = 10^2 + 2a(30) \\implies 400 - 100 = 60a \\implies 300 = 60a \\implies a = 5.0\\text{ m/s}^2$."
    },
    {
      id: "ct-10",
      question: "The relation between range $R$ and maximum height $H$ for a projectile launched at angle $\\theta$ is given by:",
      options: ["R = 4H cot θ", "R = 4H tan θ", "R = 2H cot θ", "R = 2H tan θ"],
      correct: 0,
      explanation: "We know $R = \\frac{2u^2\\sin\\theta\\cos\\theta}{g}$ and $H = \\frac{u^2\\sin^2\\theta}{2g}$. Dividing yields $\\frac{R}{H} = \\frac{4\\cos\\theta}{\\sin\\theta} = 4\\cot\\theta \\implies R = 4H\\cot\\theta$."
    }
  ]
};
