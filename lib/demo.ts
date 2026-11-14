import type { AppState, Emotion, Outcome, Urge } from "./types";

const DAY = 24 * 60 * 60 * 1000;

type Seed = [daysAgo: number, hour: number, min: number, emotion: Emotion, hunger: number, before: number, after: number | null, paused: boolean, outcome: Outcome, note?: string, usedPlan?: boolean, withBuddy?: boolean];

// 3 weeks of a realistic "evening unwinder" — skills visibly improve week over week.
const SEEDS: Seed[] = [
  // Week 1 — mostly autopilot
  [20, 21, 10, "tired", 2, 8, null, false, "usual", "Ate chips standing at the counter. Didn't even taste them."],
  [19, 15, 30, "stressed", 4, 6, null, false, "usual"],
  [18, 21, 40, "tired", 1, 7, 6, true, "mindful", "Waited a bit, then had a small bowl sitting down."],
  [17, 22, 5, "bored", 2, 6, null, false, "usual", "Scrolling + snacking combo again."],
  [16, 20, 50, "stressed", 3, 8, null, false, "usual", "Work call ran late."],
  [14, 21, 20, "lonely", 2, 7, 6, false, "usual"],
  // Week 2 — starting to pause
  [13, 21, 0, "tired", 1, 7, 4, true, "alternative", "Tea + shower instead. Urge faded around minute 8."],
  [12, 15, 40, "stressed", 5, 6, 4, true, "mindful", "Actually hungry — had a real snack."],
  [11, 21, 30, "tired", 2, 8, 6, false, "usual"],
  [10, 22, 15, "anxious", 2, 7, 4, true, "skipped", "Grounding helped more than I expected."],
  [9, 20, 45, "stressed", 3, 8, 5, true, "alternative", "Texted Sam instead.", false, true],
  [8, 21, 10, "bored", 1, 5, 3, false, "mindful"],
  // Week 3 — pausing most of the time, using the plan
  [6, 21, 5, "tired", 1, 7, 3, true, "skipped", "Plan worked: tea on the balcony.", true],
  [5, 21, 35, "stressed", 2, 8, 4, true, "alternative", "Walked around the block.", true],
  [4, 15, 20, "stressed", 5, 5, 3, true, "mindful", "Hungry for real, ate lunch leftovers slowly."],
  [3, 20, 55, "lonely", 2, 7, 3, true, "alternative", "Called mom for 10 min.", true, true],
  [2, 22, 10, "not sure", 2, 6, 5, false, "usual", "Long day. Ate in front of the TV — noticing it is a start."],
  [1, 21, 15, "tired", 1, 7, 2, true, "skipped", "Barely noticed the urge pass.", true],
];

export function buildDemoState(): AppState {
  const now = Date.now();
  const urges: Urge[] = SEEDS.map((s, i) => {
    const d = new Date(now - s[0] * DAY);
    d.setHours(s[1], s[2], 0, 0);
    return {
      id: `demo-${i}`,
      ts: d.getTime(),
      emotion: s[3],
      hunger: s[4],
      intensityBefore: s[5],
      intensityAfter: s[6] ?? undefined,
      paused: s[7],
      outcome: s[8],
      note: s[9],
      usedPlan: s[10],
      withBuddy: s[11],
      technique: undefined,
    };
  });

  const checkins = Array.from({ length: 20 }, (_, i) => ({
    ts: now - (20 - i) * DAY,
    mood: Math.min(5, 2 + Math.floor(i / 7) + (i % 3 === 0 ? 1 : 0)),
    stress: Math.max(1, 4 - Math.floor(i / 8)),
    sleep: 3 + (i % 2),
  }));

  return {
    profile: {
      createdAt: now - 21 * DAY,
      archetype: "The Evening Unwinder",
      archetypeKey: "unwinder",
      peakTime: "evening",
      triggers: ["tired", "stressed"],
      frequency: "3–5 times a week",
      goal: "Stop eating on autopilot",
      safetyFlag: false,
      buddyName: "Sam",
    },
    urges,
    plans: [
      {
        id: "demo-plan",
        ifText: "it's 9pm on a weeknight and I feel the pull to the pantry",
        thenText: "I make a cup of tea and take it to the balcony for 5 minutes first",
        createdAt: now - 7 * DAY,
      },
    ],
    checkins,
    premium: false,
    demo: true,
  };
}
