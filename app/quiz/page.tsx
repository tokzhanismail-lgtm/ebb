"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ARCHETYPES } from "@/lib/archetypes";
import { RESOURCES } from "@/lib/safety";
import { useEbb } from "@/lib/store";
import { EMOTIONS } from "@/lib/techniques";
import type { ArchetypeKey, Emotion, Profile } from "@/lib/types";

type Peak = Profile["peakTime"];

const PEAKS: { key: Peak; label: string; emoji: string }[] = [
  { key: "morning", label: "Morning", emoji: "🌅" },
  { key: "afternoon", label: "Afternoon slump", emoji: "☀️" },
  { key: "evening", label: "Evening", emoji: "🌆" },
  { key: "late night", label: "Late night", emoji: "🌙" },
];
const FREQ = ["Rarely", "1–2 times a week", "3–5 times a week", "Most days"];
const GOALS = [
  "Stop eating on autopilot",
  "Feel calmer around food",
  "Handle cravings after GLP-1 medication",
  "Understand my triggers",
];
const SCREEN = [
  "Often eating a very large amount and feeling unable to stop",
  "Making myself throw up or using laxatives to control my weight",
  "Going a day or more without eating to control my weight",
];

function pickArchetype(peak: Peak, triggers: Emotion[]): ArchetypeKey {
  if (triggers.includes("stressed") || triggers.includes("anxious") || triggers.includes("angry")) {
    if ((peak === "evening" || peak === "late night") && triggers.includes("tired")) return "unwinder";
    return "stress";
  }
  if (triggers.includes("bored")) return "boredom";
  if (triggers.includes("lonely") || triggers.includes("sad")) return "comfort";
  return "unwinder";
}

export default function Quiz() {
  const router = useRouter();
  const { setProfile } = useEbb();
  const [step, setStep] = useState(0);
  const [peak, setPeak] = useState<Peak | null>(null);
  const [triggers, setTriggers] = useState<Emotion[]>([]);
  const [freq, setFreq] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [screen, setScreen] = useState<string[]>([]);
  const [noneScreen, setNoneScreen] = useState(false);
  const [buddy, setBuddy] = useState("");

  const total = 5;
  const archetypeKey = useMemo(() => pickArchetype(peak ?? "evening", triggers), [peak, triggers]);
  const archetype = ARCHETYPES[archetypeKey];
  const flagged = screen.length > 0;

  const toggleTrigger = (e: Emotion) =>
    setTriggers((t) => (t.includes(e) ? t.filter((x) => x !== e) : t.length >= 3 ? t : [...t, e]));
  const toggleScreen = (s: string) => {
    setNoneScreen(false);
    setScreen((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));
  };

  const finish = () => {
    setProfile({
      createdAt: Date.now(),
      archetype: archetype.name,
      archetypeKey,
      peakTime: peak ?? "evening",
      triggers,
      frequency: freq ?? "",
      goal: goal ?? "",
      safetyFlag: flagged,
      buddyName: buddy.trim() || undefined,
    });
    router.push("/home");
  };

  const canNext = [peak, triggers.length > 0, freq, goal, screen.length > 0 || noneScreen][step];

  return (
    <main className="app stack-lg">
      <div className="row between">
        <Link href="/" className="logo">
          ebb
        </Link>
        {step < total && (
          <div className="dots" aria-label={`Question ${step + 1} of ${total}`}>
            {Array.from({ length: total }, (_, i) => (
              <i key={i} className={i <= step ? "on" : ""} />
            ))}
          </div>
        )}
      </div>

      {step === 0 && (
        <section className="stack-lg">
          <h2>When does the urge to eat — without being hungry — usually hit you?</h2>
          <div className="choices two">
            {PEAKS.map((p) => (
              <button key={p.key} className={`choice ${peak === p.key ? "on" : ""}`} onClick={() => setPeak(p.key)}>
                <span className="emoji">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="stack-lg">
          <div className="stack">
            <h2>What&apos;s usually going on when it happens?</h2>
            <p className="muted">Pick up to three.</p>
          </div>
          <div className="choices three">
            {EMOTIONS.filter((e) => e.key !== "not sure").map((e) => (
              <button
                key={e.key}
                className={`choice ${triggers.includes(e.key) ? "on" : ""}`}
                onClick={() => toggleTrigger(e.key)}
                aria-pressed={triggers.includes(e.key)}
              >
                <span className="emoji">{e.emoji}</span>
                {e.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="stack-lg">
          <h2>How often does it happen?</h2>
          <div className="choices">
            {FREQ.map((f) => (
              <button key={f} className={`choice ${freq === f ? "on" : ""}`} onClick={() => setFreq(f)}>
                {f}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="stack-lg">
          <h2>What would help you most?</h2>
          <div className="choices">
            {GOALS.map((g) => (
              <button key={g} className={`choice ${goal === g ? "on" : ""}`} onClick={() => setGoal(g)}>
                {g}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="stack-lg">
          <div className="stack">
            <h2>One more, so we can point you to the right kind of help</h2>
            <p className="muted">In the last 3 months, has any of this happened? Your answer stays on your device.</p>
          </div>
          <div className="choices">
            {SCREEN.map((s) => (
              <button key={s} className={`choice ${screen.includes(s) ? "on" : ""}`} onClick={() => toggleScreen(s)}>
                {s}
              </button>
            ))}
            <button
              className={`choice ${noneScreen ? "on" : ""}`}
              onClick={() => {
                setScreen([]);
                setNoneScreen(true);
              }}
            >
              None of these
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="stack-lg">
          {flagged && (
            <div className="panel tide stack">
              <h3>{RESOURCES.ed.title}</h3>
              <p>{RESOURCES.ed.body}</p>
              <p className="small muted">
                You&apos;re welcome to use Ebb alongside professional support. It&apos;s a skills tool, not a treatment.
              </p>
            </div>
          )}
          <div className="panel deep stack">
            <span style={{ fontSize: "2.4rem" }}>{archetype.emoji}</span>
            <p className="muted">Your pattern</p>
            <h2>{archetype.name}</h2>
            <p>{archetype.blurb}</p>
          </div>
          <div className="panel stack">
            <h3>Your first four weeks</h3>
            <p className="muted">{archetype.focus}</p>
            <ol className="stack" style={{ margin: 0, paddingLeft: 20 }}>
              <li>
                <strong>Notice.</strong> Name the feeling behind the urge.
              </li>
              <li>
                <strong>Pause.</strong> Ride the wave for 10 minutes before you decide.
              </li>
              <li>
                <strong>Choose.</strong> Skip, swap, or eat mindfully — on purpose.
              </li>
              <li>
                <strong>Predict.</strong> Plan ahead for your danger window
                {peak ? ` (${peak === "late night" ? "late nights" : peak + "s"} for you)` : ""}.
              </li>
            </ol>
          </div>
          <div className="panel stack">
            <label className="field" htmlFor="buddy">
              Who could you message when a craving hits? (optional)
            </label>
            <input
              id="buddy"
              type="text"
              placeholder="A friend's name, e.g. Sam"
              value={buddy}
              onChange={(e) => setBuddy(e.target.value)}
            />
            <p className="small muted">People who feel supported stress-eat less on those days. We&apos;ll add a one-tap message to SOS.</p>
          </div>
          <button className="btn btn-primary btn-block" onClick={finish}>
            Start training
          </button>
        </section>
      )}

      {step < 5 && (
        <div className="row between">
          {step > 0 ? (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
            {step === 4 ? "See my pattern" : "Next"}
          </button>
        </div>
      )}
    </main>
  );
}
