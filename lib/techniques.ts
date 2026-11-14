import type { Emotion } from "./types";

export interface Technique {
  title: string;
  why: string;
  steps: string[];
}

/** Evidence-informed, 60–90 second techniques. Used directly when no AI key is set, and as AI fallback. */
export const TECHNIQUES: Record<Emotion, Technique> = {
  tired: {
    title: "The 4-minute reset",
    why: "When you're drained, your brain looks for the fastest energy and comfort it can find — usually food.",
    steps: [
      "Drink a full glass of water slowly.",
      "Sit down, close your eyes, and take 6 slow breaths (in for 4, out for 6).",
      "Ask: is it food I need, or rest? If rest, give yourself 10 minutes horizontal — no screen.",
    ],
  },
  stressed: {
    title: "Physiological sigh",
    why: "A double inhale and long exhale is one of the fastest ways to lower stress in real time.",
    steps: [
      "Breathe in through your nose, then take a second short sip of air on top.",
      "Let it all out slowly through your mouth.",
      "Repeat 5 times. Notice where the tension sits in your body and let your shoulders drop.",
    ],
  },
  bored: {
    title: "Swap the stimulation",
    why: "Boredom wants novelty, not calories. Give it something new for 5 minutes.",
    steps: [
      "Stand up and change rooms — or step outside for 2 minutes.",
      "Pick one tiny thing: text a friend, stretch, tidy one surface, put on one song.",
      "Check back in: is the urge the same, smaller, or gone?",
    ],
  },
  lonely: {
    title: "Reach out, not in",
    why: "Food can stand in for connection. A small real connection often softens the urge more than a snack.",
    steps: [
      "Send one message to someone — even just a meme or 'thinking of you'.",
      "Put a hand on your chest and say: 'This is a lonely moment. It will pass.'",
      "If you still want to eat, sit down and eat slowly — no shame either way.",
    ],
  },
  anxious: {
    title: "5-4-3-2-1 grounding",
    why: "Anxiety lives in the future. Your senses pull you back into right now.",
    steps: [
      "Name 5 things you can see and 4 things you can feel (feet on floor, fabric, air).",
      "Name 3 things you can hear and 2 things you can smell.",
      "Name 1 slow breath. Then rate the urge again.",
    ],
  },
  sad: {
    title: "Kind check-in",
    why: "Sadness asks for comfort. You can give it comfort without autopilot eating.",
    steps: [
      "Wrap yourself in something warm — a blanket, a hoodie, a hot drink.",
      "Write one sentence: 'Right now I feel ___ because ___.'",
      "Ask: what would I tell a friend feeling this? Do one small version of that for yourself.",
    ],
  },
  angry: {
    title: "Move it out",
    why: "Anger is energy in the body. Burning a bit of it off lowers the pull to crunch and chew it away.",
    steps: [
      "Do 20 seconds of something physical: squeeze your fists hard, then release. Repeat 3 times.",
      "Take 3 long exhales, longer than your inhales.",
      "Name what crossed a line for you. You don't have to fix it right now.",
    ],
  },
  celebrating: {
    title: "Savor on purpose",
    why: "Celebrating is great. The goal isn't to skip it — it's to actually enjoy it instead of eating on autopilot.",
    steps: [
      "Decide what you'll have and put a portion on a plate.",
      "Sit down. Take the first 3 bites slowly and notice the taste and texture.",
      "Check in halfway: still enjoying it, or just finishing it?",
    ],
  },
  "not sure": {
    title: "Urge surfing",
    why: "Urges rise, peak, and fall like a wave — usually within 10–20 minutes — if you don't feed them right away.",
    steps: [
      "Notice where you feel the urge in your body (mouth, stomach, chest, hands).",
      "Breathe into that spot and rate the urge 1–10. Watch it like a wave instead of obeying it.",
      "Re-rate every minute. You don't have to make it go away — just watch it change.",
    ],
  },
};

export const EMOTIONS: { key: Emotion; label: string; emoji: string }[] = [
  { key: "tired", label: "Tired", emoji: "🥱" },
  { key: "stressed", label: "Stressed", emoji: "😣" },
  { key: "bored", label: "Bored", emoji: "😐" },
  { key: "lonely", label: "Lonely", emoji: "🫥" },
  { key: "anxious", label: "Anxious", emoji: "😟" },
  { key: "sad", label: "Sad", emoji: "😔" },
  { key: "angry", label: "Frustrated", emoji: "😤" },
  { key: "celebrating", label: "Celebrating", emoji: "🥳" },
  { key: "not sure", label: "Not sure", emoji: "🤷" },
];

export function emotionLabel(e: Emotion) {
  return EMOTIONS.find((x) => x.key === e)?.label ?? e;
}
