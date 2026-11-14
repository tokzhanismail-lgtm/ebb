/**
 * Lightweight safety layer. Ebb is a wellness skill trainer, not therapy or a medical device.
 * If a message suggests crisis or eating-disorder behaviors, we stop the normal flow and show resources.
 */

const CRISIS = [
  "kill myself",
  "suicide",
  "suicidal",
  "end my life",
  "want to die",
  "self harm",
  "self-harm",
  "hurt myself",
  "cut myself",
];

const ED = [
  "make myself throw up",
  "make myself vomit",
  "throw up after",
  "purge",
  "purging",
  "laxative",
  "starve myself",
  "not eat for days",
  "haven't eaten in days",
];

export type SafetyLevel = "ok" | "ed" | "crisis";

export function checkSafety(text: string): SafetyLevel {
  const t = text.toLowerCase();
  if (CRISIS.some((k) => t.includes(k))) return "crisis";
  if (ED.some((k) => t.includes(k))) return "ed";
  return "ok";
}

export const RESOURCES = {
  crisis: {
    title: "You deserve support right now",
    body: "If you're thinking about hurting yourself, please reach out to a person now. In the US you can call or text 988 (Suicide & Crisis Lifeline), any time. If you're in immediate danger, call 911.",
  },
  ed: {
    title: "This sounds bigger than a craving",
    body: "What you're describing can be a sign of an eating disorder, and you deserve specialized support. The National Alliance for Eating Disorders helpline is staffed by licensed therapists: 1-866-662-1235 (Mon–Fri, 9am–7pm ET). If you're in crisis, call or text 988.",
  },
};
