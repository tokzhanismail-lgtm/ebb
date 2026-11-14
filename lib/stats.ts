import type { Emotion, IfThenPlan, Urge } from "./types";

const DAY = 24 * 60 * 60 * 1000;

export interface WeekStat {
  label: string;
  count: number;
  pauseRate: number; // 0-100
  choiceRate: number; // 0-100
  avgDrop: number; // intensity before - after
}

export function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

/** Group urges into consecutive 7-day weeks starting from the first urge. */
export function weeklyStats(urges: Urge[]): WeekStat[] {
  if (urges.length === 0) return [];
  const sorted = [...urges].sort((a, b) => a.ts - b.ts);
  const start = startOfDay(sorted[0].ts);
  const weeks: Urge[][] = [];
  for (const u of sorted) {
    const w = Math.floor((u.ts - start) / (7 * DAY));
    (weeks[w] ||= []).push(u);
  }
  return weeks.map((list = [], i) => ({
    label: `Week ${i + 1}`,
    count: list.length,
    pauseRate: pct(list.filter((u) => u.paused).length, list.length),
    choiceRate: pct(list.filter((u) => u.outcome !== "usual").length, list.length),
    avgDrop: avgDrop(list),
  }));
}

export function avgDrop(list: Urge[]) {
  const withAfter = list.filter((u) => typeof u.intensityAfter === "number");
  if (withAfter.length === 0) return 0;
  const sum = withAfter.reduce((s, u) => s + (u.intensityBefore - (u.intensityAfter ?? u.intensityBefore)), 0);
  return Math.round((sum / withAfter.length) * 10) / 10;
}

export function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface DangerWindow {
  startHour: number;
  endHour: number;
  share: number; // % of urges in this window
  weekdayShare: number; // % of window urges on weekdays
}

/** The 2-hour window of the day where most urges happen. */
export function dangerWindow(urges: Urge[]): DangerWindow | null {
  if (urges.length < 3) return null;
  let best = { h: 0, n: -1 };
  for (let h = 0; h < 24; h++) {
    const n = urges.filter((u) => inWindow(u.ts, h)).length;
    if (n > best.n) best = { h, n };
  }
  const inW = urges.filter((u) => inWindow(u.ts, best.h));
  const weekday = inW.filter((u) => {
    const d = new Date(u.ts).getDay();
    return d >= 1 && d <= 5;
  }).length;
  return {
    startHour: best.h,
    endHour: (best.h + 2) % 24,
    share: pct(best.n, urges.length),
    weekdayShare: pct(weekday, inW.length),
  };
}

export function inWindow(ts: number, startHour: number) {
  const h = new Date(ts).getHours();
  const end = startHour + 2;
  return end <= 24 ? h >= startHour && h < end : h >= startHour || h < end - 24;
}

export function emotionCounts(urges: Urge[]): { emotion: Emotion; count: number; share: number }[] {
  const map = new Map<Emotion, number>();
  for (const u of urges) map.set(u.emotion, (map.get(u.emotion) ?? 0) + 1);
  return [...map.entries()]
    .map(([emotion, count]) => ({ emotion, count, share: pct(count, urges.length) }))
    .sort((a, b) => b.count - a.count);
}

export interface Skill {
  key: "notice" | "pause" | "choose" | "predict";
  name: string;
  verb: string;
  score: number; // 0-100
  level: number; // 1-5
  hint: string;
}

export function levelFor(score: number) {
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

/** Skill scores are computed on the most recent 14 days so improvement shows up. */
export function skills(urges: Urge[], plans: IfThenPlan[]): Skill[] {
  const now = Date.now();
  const recent = urges.filter((u) => now - u.ts <= 14 * DAY);
  const base = recent.length ? recent : urges;
  const notice = pct(base.filter((u) => u.emotion !== "not sure").length, base.length);
  const pause = pct(base.filter((u) => u.paused).length, base.length);
  const choose = pct(base.filter((u) => u.outcome !== "usual").length, base.length);
  const dw = dangerWindow(urges);
  const inDanger = dw ? base.filter((u) => inWindow(u.ts, dw.startHour)) : [];
  let predict = inDanger.length ? pct(inDanger.filter((u) => u.usedPlan).length, inDanger.length) : 0;
  if (plans.length > 0 && predict < 20) predict = Math.max(predict, 20);

  const mk = (key: Skill["key"], name: string, verb: string, score: number, hint: string): Skill => ({
    key,
    name,
    verb,
    score,
    level: base.length ? levelFor(score) : 1,
    hint,
  });

  return [
    mk("notice", "Notice", "Name the feeling behind the urge", base.length ? notice : 0, "Tell hunger from emotion, then name it."),
    mk("pause", "Pause", "Wait it out before eating", base.length ? pause : 0, "Ride the wave for 10 minutes. Urges peak and fade."),
    mk("choose", "Choose", "Pick on purpose, not on autopilot", base.length ? choose : 0, "Skip, swap, or eat mindfully — all count."),
    mk("predict", "Predict", "Plan ahead for your danger window", predict, "Set an if-then plan for the hour that gets you."),
  ];
}

/** Things the garden grows from: every urge you met with awareness. */
export function gardenPoints(urges: Urge[]) {
  return urges.filter((u) => u.paused || u.outcome !== "usual").length;
}

export function hourLabel(h: number) {
  const hh = ((h + 11) % 12) + 1;
  return `${hh}${h < 12 ? "am" : "pm"}`;
}

export function windowLabel(dw: DangerWindow) {
  return `${hourLabel(dw.startHour)}–${hourLabel(dw.endHour)}`;
}

/** Compact, anonymous summary sent to the AI for insights (no personal identifiers). */
export function summaryForAI(urges: Urge[], plans: IfThenPlan[]) {
  const dw = dangerWindow(urges);
  const em = emotionCounts(urges).slice(0, 4);
  const weeks = weeklyStats(urges);
  const hungry = pct(urges.filter((u) => u.hunger >= 6).length, urges.length);
  const outcomes = (["skipped", "alternative", "mindful", "usual"] as const).map(
    (o) => `${o}: ${pct(urges.filter((u) => u.outcome === o).length, urges.length)}%`
  );
  const notes = urges
    .filter((u) => u.note)
    .slice(-6)
    .map((u) => `"${u.note}"`)
    .join("; ");
  return [
    `Total urges logged: ${urges.length} over ${weeks.length} week(s).`,
    dw
      ? `Danger window: ${windowLabel(dw)} (${dw.share}% of urges; ${dw.weekdayShare}% of those on weekdays).`
      : "Not enough data for a danger window yet.",
    `Top feelings: ${em.map((e) => `${e.emotion} ${e.share}%`).join(", ") || "none yet"}.`,
    `Physically hungry (6+/10) in ${hungry}% of urges.`,
    `Outcomes: ${outcomes.join(", ")}.`,
    `Weekly pause rate: ${weeks.map((w) => `${w.label} ${w.pauseRate}%`).join(", ")}.`,
    `Average urge intensity drop after the pause: ${avgDrop(urges)} points.`,
    `Existing if-then plans: ${plans.map((p) => `If ${p.ifText}, then ${p.thenText}`).join(" | ") || "none"}.`,
    notes ? `Recent reflection notes: ${notes}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
