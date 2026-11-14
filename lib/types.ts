export type Emotion =
  | "tired"
  | "stressed"
  | "bored"
  | "lonely"
  | "anxious"
  | "sad"
  | "angry"
  | "celebrating"
  | "not sure";

export type Outcome = "skipped" | "alternative" | "mindful" | "usual";

export interface Urge {
  id: string;
  ts: number; // epoch ms
  hunger: number; // 0-10 physical hunger
  emotion: Emotion;
  intensityBefore: number; // 1-10
  intensityAfter?: number; // 1-10
  technique?: string;
  paused: boolean; // completed the pause
  outcome: Outcome;
  note?: string;
  withBuddy?: boolean;
  usedPlan?: boolean; // followed an if-then plan
}

export interface IfThenPlan {
  id: string;
  ifText: string;
  thenText: string;
  createdAt: number;
}

export interface Profile {
  createdAt: number;
  archetype: string;
  archetypeKey: ArchetypeKey;
  peakTime: "morning" | "afternoon" | "evening" | "late night";
  triggers: Emotion[];
  frequency: string;
  goal: string;
  safetyFlag: boolean;
  buddyName?: string;
}

export type ArchetypeKey = "unwinder" | "stress" | "boredom" | "comfort";

export interface CheckIn {
  ts: number;
  mood: number; // 1-5
  stress: number; // 1-5
  sleep: number; // 1-5
}

export interface AppState {
  profile: Profile | null;
  urges: Urge[];
  plans: IfThenPlan[];
  checkins: CheckIn[];
  premium: boolean;
  demo: boolean;
}
