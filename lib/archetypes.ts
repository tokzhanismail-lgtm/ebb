import type { ArchetypeKey } from "./types";

export const ARCHETYPES: Record<ArchetypeKey, { name: string; blurb: string; focus: string; emoji: string }> = {
  unwinder: {
    name: "The Evening Unwinder",
    emoji: "🌙",
    blurb:
      "You hold it together all day. Then the evening comes, the tank is empty, and food becomes the fastest way to switch off.",
    focus: "Your first skill: tell tiredness from hunger, and give yourself a real way to wind down.",
  },
  stress: {
    name: "The Stress Snacker",
    emoji: "⚡",
    blurb: "When pressure spikes, your hands reach for food before your head catches up. It's a fast, familiar release valve.",
    focus: "Your first skill: a 60-second pause that lowers stress in your body before you decide anything.",
  },
  boredom: {
    name: "The Boredom Grazer",
    emoji: "🌀",
    blurb: "Downtime feels empty, and snacks fill it. You're often not hungry — just under-stimulated.",
    focus: "Your first skill: notice the 'nothing to do' moment and swap in something that actually feels good.",
  },
  comfort: {
    name: "The Comfort Seeker",
    emoji: "🫶",
    blurb: "Lonely, low, or hurting — food has been a reliable way to feel held. That makes complete sense.",
    focus: "Your first skill: name the feeling kindly, and reach out instead of in.",
  },
};
