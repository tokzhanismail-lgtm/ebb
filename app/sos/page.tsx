"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Garden from "@/components/Garden";
import Wave from "@/components/Wave";
import { checkSafety, RESOURCES, type SafetyLevel } from "@/lib/safety";
import { dangerWindow, gardenPoints, inWindow, pct } from "@/lib/stats";
import { uid, useEbb } from "@/lib/store";
import { EMOTIONS, TECHNIQUES, emotionLabel, type Technique } from "@/lib/techniques";
import type { Emotion, Outcome } from "@/lib/types";

type Step = "check" | "hungry" | "feel" | "technique" | "pause" | "choose" | "done";
type Msg = { role: "user" | "assistant"; content: string };

const PAUSE_SECONDS = 600;

const OUTCOMES: { key: Outcome; label: string; sub: string }[] = [
  { key: "skipped", label: "It passed", sub: "I didn't eat." },
  { key: "alternative", label: "I did something else", sub: "Tea, a walk, a call, a shower…" },
  { key: "mindful", label: "I ate, on purpose", sub: "Sitting down, on a plate, tasting it." },
  { key: "usual", label: "I ate on autopilot", sub: "That's okay. It's data, not a failure." },
];

export default function SOS() {
  const router = useRouter();
  const { state, ready, addUrge } = useEbb();
  const [step, setStep] = useState<Step>("check");
  const [hunger, setHunger] = useState(2);
  const [intensity, setIntensity] = useState(7);
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [note, setNote] = useState("");
  const [tech, setTech] = useState<(Technique & { line?: string }) | null>(null);
  const [source, setSource] = useState<"ai" | "library" | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [current, setCurrent] = useState(7);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [reflection, setReflection] = useState("");
  const [usedPlan, setUsedPlan] = useState(false);
  const [withBuddy, setWithBuddy] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [safety, setSafety] = useState<SafetyLevel>("ok");
  const [savedPoints, setSavedPoints] = useState<number | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  const plan = state.plans[0];
  const dw = useMemo(() => dangerWindow(state.urges), [state.urges]);
  const buddy = state.profile?.buddyName;

  useEffect(() => {
    if (step !== "pause") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, thinking]);

  const elapsed = start ? Math.floor((now - start) / 1000) : 0;
  const left = Math.max(0, PAUSE_SECONDS - elapsed);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  const fetchTechnique = async (e: Emotion) => {
    setStep("technique");
    setTech(null);
    const local = checkSafety(note);
    if (local !== "ok") {
      setSafety(local);
      return;
    }
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "technique", emotion: e, hunger, intensity, note }),
      });
      const data = await res.json();
      if (data.safety) {
        setSafety(data.safety);
        return;
      }
      setTech(data.technique);
      setSource(data.source);
    } catch {
      setTech({ ...TECHNIQUES[e], line: "This will pass. You get to choose." });
      setSource("library");
    }
  };

  const sendChat = async () => {
    const text = draft.trim();
    if (!text) return;
    const local = checkSafety(text);
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setDraft("");
    if (local !== "ok") {
      setSafety(local);
      return;
    }
    setThinking(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "chat", emotion, hunger, intensity: current, messages: next }),
      });
      const data = await res.json();
      if (data.safety) setSafety(data.safety);
      else setMsgs([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "I'm here. One slow breath: in for 4, out for 6. What's loudest right now?" }]);
    } finally {
      setThinking(false);
    }
  };

  const messageBuddy = async () => {
    const text = `Hey ${buddy ?? ""}, I'm having a tough craving moment and trying to ride it out. Could you send me something kind or call me for 2 minutes? 💛`;
    setWithBuddy(true);
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* user cancelled share sheet */
    }
    window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
  };

  const save = (finalOutcome: Outcome, paused: boolean) => {
    const before = gardenPoints(state.urges);
    addUrge({
      id: uid(),
      ts: Date.now(),
      hunger,
      emotion: emotion ?? "not sure",
      intensityBefore: intensity,
      intensityAfter: current,
      technique: tech?.title,
      paused,
      outcome: finalOutcome,
      note: [note, reflection].filter(Boolean).join(" — ") || undefined,
      withBuddy,
      usedPlan,
    });
    setSavedPoints(before + (paused || finalOutcome !== "usual" ? 1 : 0));
    setStep("done");
  };

  const pausedEnough = elapsed >= 60;
  const inDanger = dw ? inWindow(Date.now(), dw.startHour) : false;

  if (!ready) return <main className="app" />;

  return (
    <main className="app stack-lg">
      <div className="row between">
        <Link href="/home" className="logo">
          ebb
        </Link>
        {step !== "done" && (
          <button className="linkish small" onClick={() => router.push("/home")}>
            Close
          </button>
        )}
      </div>

      {safety !== "ok" && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="safety-title">
          <div className="modal stack">
            <h3 id="safety-title">{RESOURCES[safety].title}</h3>
            <p>{RESOURCES[safety].body}</p>
            <div className="row wrap-row">
              <a className="btn btn-primary" href="tel:988">
                Call 988
              </a>
              <a className="btn btn-ghost" href="sms:988">
                Text 988
              </a>
              {safety === "ed" && (
                <a className="btn btn-ghost" href="tel:18666621235">
                  Call the helpline
                </a>
              )}
            </div>
            <button className="linkish small" onClick={() => setSafety("ok")}>
              Back to Ebb
            </button>
          </div>
        </div>
      )}

      {step === "check" && (
        <section className="stack-lg">
          <div className="stack">
            <h2>Let&apos;s look at this urge together.</h2>
            <p className="muted">No judgment. Just two quick sliders.</p>
          </div>
          <div className="panel stack">
            <label className="field" htmlFor="hunger">
              How physically hungry are you? <span className="muted">{hunger}/10</span>
            </label>
            <input id="hunger" type="range" min={0} max={10} value={hunger} onChange={(e) => setHunger(+e.target.value)} />
            <div className="scale-ends">
              <span>Not at all</span>
              <span>Stomach growling</span>
            </div>
          </div>
          <div className="panel stack">
            <label className="field" htmlFor="intensity">
              How strong is the urge? <span className="muted">{intensity}/10</span>
            </label>
            <input
              id="intensity"
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={(e) => {
                setIntensity(+e.target.value);
                setCurrent(+e.target.value);
              }}
            />
            <div style={{ margin: "0 -20px -20px", borderRadius: "0 0 22px 22px", overflow: "hidden" }}>
              <Wave level={intensity / 10} height={80} />
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => setStep(hunger >= 7 ? "hungry" : "feel")}>
            Next
          </button>
        </section>
      )}

      {step === "hungry" && (
        <section className="stack-lg">
          <div className="panel kelp stack">
            <h2>You might just be hungry.</h2>
            <p>That&apos;s what food is for. Have something satisfying — sitting down, on a plate, without your phone. Real hunger isn&apos;t an urge to fight.</p>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => save("mindful", false)}>
            Log it as a mindful meal
          </button>
          <button className="btn btn-ghost btn-block" onClick={() => setStep("feel")}>
            It&apos;s more than hunger
          </button>
        </section>
      )}

      {step === "feel" && (
        <section className="stack-lg">
          <div className="stack">
            <h2>What are you feeling right now?</h2>
            <p className="muted">Naming it is the first skill. Your best guess is enough.</p>
          </div>
          <div className="choices three">
            {EMOTIONS.map((e) => (
              <button
                key={e.key}
                className={`choice ${emotion === e.key ? "on" : ""}`}
                onClick={() => setEmotion(e.key)}
                aria-pressed={emotion === e.key}
              >
                <span className="emoji">{e.emoji}</span>
                {e.label}
              </button>
            ))}
          </div>
          <div className="stack">
            <label className="field" htmlFor="note">
              Anything going on? (optional)
            </label>
            <textarea
              id="note"
              placeholder="e.g. Long day, kids finally asleep, just want to switch off."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={!emotion} onClick={() => emotion && fetchTechnique(emotion)}>
            Help me with this
          </button>
        </section>
      )}

      {step === "technique" && (
        <section className="stack-lg">
          {!tech ? (
            <div className="panel stack center" aria-live="polite">
              <p className="muted">Finding something for {emotion ? emotionLabel(emotion).toLowerCase() : "this"}…</p>
              <Wave level={0.5} height={70} />
            </div>
          ) : (
            <>
              <div className="panel deep stack">
                <div className="row between">
                  <span className="muted small">For feeling {emotionLabel(emotion ?? "not sure").toLowerCase()}</span>
                  <span className="chip buoy">{source === "ai" ? "AI coach" : "Ebb technique"}</span>
                </div>
                <h2>{tech.title}</h2>
                <p className="muted">{tech.why}</p>
                <ol className="stack" style={{ margin: 0, paddingLeft: 20 }}>
                  {tech.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                {tech.line && (
                  <p style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", paddingTop: 6 }}>&ldquo;{tech.line}&rdquo;</p>
                )}
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  setStart(Date.now());
                  setNow(Date.now());
                  setStep("pause");
                }}
              >
                Start the 10-minute pause
              </button>
              <button className="btn btn-ghost btn-block" onClick={() => setStep("choose")}>
                Skip to choosing
              </button>
            </>
          )}
        </section>
      )}

      {step === "pause" && (
        <section className="stack-lg">
          <div className="panel stack center">
            <p className="muted">Ride the wave. You don&apos;t have to decide yet.</p>
            <div className="timer" aria-live="off">
              {mm}:{ss}
            </div>
            <div style={{ margin: "0 -20px" }}>
              <Wave level={current / 10} height={110} />
            </div>
            <label className="field" htmlFor="current" style={{ textAlign: "left" }}>
              How strong is it now? <span className="muted">{current}/10</span>
            </label>
            <input id="current" type="range" min={0} max={10} value={current} onChange={(e) => setCurrent(+e.target.value)} />
            {current < intensity && (
              <p className="small" style={{ color: "var(--kelp)" }}>
                Down {intensity - current} from when you started. That&apos;s the wave passing.
              </p>
            )}
          </div>

          <div className="row">
            {buddy && (
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={messageBuddy}>
                Message {buddy}
              </button>
            )}
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setChatOpen((o) => !o)}>
              {chatOpen ? "Hide chat" : "Talk it through"}
            </button>
          </div>

          {chatOpen && (
            <div className="panel stack">
              <div className="chat" aria-live="polite">
                {msgs.length === 0 && (
                  <div className="msg assistant">I&apos;m here for the next few minutes. What&apos;s going on underneath the urge?</div>
                )}
                {msgs.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    {m.content}
                  </div>
                ))}
                {thinking && <div className="msg assistant muted">…</div>}
                <div ref={chatEnd} />
              </div>
              <form
                className="row"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendChat();
                }}
              >
                <input type="text" placeholder="Type how you feel" value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Message the coach" />
                <button className="btn btn-tide" disabled={!draft.trim() || thinking} type="submit">
                  Send
                </button>
              </form>
            </div>
          )}

          <button className="btn btn-primary btn-block" onClick={() => setStep("choose")}>
            {left === 0 ? "Time's up — I'm ready to choose" : "I'm ready to choose"}
          </button>
          {!pausedEnough && <p className="small muted center">Even a one-minute pause counts toward your skill.</p>}
        </section>
      )}

      {step === "choose" && (
        <section className="stack-lg">
          <div className="stack">
            <h2>What did you choose?</h2>
            <p className="muted">Every answer is useful. This is practice, not a test.</p>
          </div>
          <div className="choices">
            {OUTCOMES.map((o) => (
              <button key={o.key} className={`choice ${outcome === o.key ? "on" : ""}`} onClick={() => setOutcome(o.key)}>
                <strong>{o.label}</strong>
                <span className="small" style={{ display: "block", opacity: 0.8 }}>
                  {o.sub}
                </span>
              </button>
            ))}
          </div>
          <div className="panel stack">
            <label className="field" htmlFor="after">
              How strong is the urge now? <span className="muted">{current}/10</span>
            </label>
            <input id="after" type="range" min={0} max={10} value={current} onChange={(e) => setCurrent(+e.target.value)} />
            {plan && (
              <label className="row small" style={{ cursor: "pointer" }}>
                <input type="checkbox" checked={usedPlan} onChange={(e) => setUsedPlan(e.target.checked)} />
                I used my plan: &ldquo;then {plan.thenText}&rdquo;
                {inDanger ? " (you're in your danger window)" : ""}
              </label>
            )}
            <label className="field" htmlFor="reflect">
              What helped, or what got in the way? (optional)
            </label>
            <input id="reflect" type="text" value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="One line is plenty" />
          </div>
          <button className="btn btn-primary btn-block" disabled={!outcome} onClick={() => outcome && save(outcome, pausedEnough)}>
            Save to my practice
          </button>
        </section>
      )}

      {step === "done" && (
        <section className="stack-lg">
          <div className="panel kelp stack">
            <h2>
              {outcome === "usual"
                ? "Logged. That's the skill of noticing."
                : outcome === "mindful" || (!outcome && hunger >= 7)
                ? "You ate on purpose. That counts."
                : outcome === "alternative"
                ? "You chose something else."
                : "You rode the wave."}
            </h2>
            <p>
              {pausedEnough
                ? `You paused for ${Math.max(1, Math.round(elapsed / 60))} minute${Math.round(elapsed / 60) === 1 ? "" : "s"}${
                    current < intensity ? ` and the urge dropped from ${intensity} to ${current}` : ""
                  }.`
                : "Next time, try staying with it for even one minute before deciding."}
            </p>
          </div>
          <div className="panel stack">
            <Garden points={savedPoints ?? gardenPoints(state.urges)} highlightLast />
            <p className="small muted center">
              Pause rate this week:{" "}
              {pct(
                state.urges.filter((u) => Date.now() - u.ts < 7 * 864e5 && u.paused).length,
                state.urges.filter((u) => Date.now() - u.ts < 7 * 864e5).length
              )}
              %
            </p>
          </div>
          <Link href="/progress" className="btn btn-primary btn-block">
            See my progress
          </Link>
          <Link href="/home" className="btn btn-ghost btn-block">
            Back to today
          </Link>
        </section>
      )}
    </main>
  );
}
