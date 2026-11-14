"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Garden from "@/components/Garden";
import Nav from "@/components/Nav";
import Wave from "@/components/Wave";
import { buildDemoState } from "@/lib/demo";
import { dangerWindow, gardenPoints, hourLabel, skills, startOfDay, windowLabel } from "@/lib/stats";
import { useEbb } from "@/lib/store";

function greeting(h: number) {
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const router = useRouter();
  const { state, ready, addCheckIn, update, replaceAll, reset } = useEbb();
  const [buddyEdit, setBuddyEdit] = useState(false);
  const [buddy, setBuddy] = useState("");
  const [ci, setCi] = useState({ mood: 0, stress: 0, sleep: 0 });

  const now = new Date();
  const dw = useMemo(() => dangerWindow(state.urges), [state.urges]);
  const sk = useMemo(() => skills(state.urges, state.plans), [state.urges, state.plans]);
  const points = gardenPoints(state.urges);
  const checkedToday = state.checkins.some((c) => c.ts >= startOfDay(Date.now()));
  const thisWeek = state.urges.filter((u) => Date.now() - u.ts < 7 * 864e5);

  if (!ready) return <main className="app" />;

  if (!state.profile) {
    return (
      <main className="app stack-lg">
        <Link href="/" className="logo">
          ebb
        </Link>
        <div className="panel stack">
          <h2>Let&apos;s find your pattern first</h2>
          <p className="muted">A 1-minute quiz sets up your plan. Or look around a 3-week demo account.</p>
          <Link href="/quiz" className="btn btn-primary btn-block">
            Take the quiz
          </Link>
          <button
            className="btn btn-ghost btn-block"
            onClick={() => {
              replaceAll(buildDemoState());
            }}
          >
            Load the demo
          </button>
        </div>
      </main>
    );
  }

  const hoursToWindow = dw ? (dw.startHour - now.getHours() + 24) % 24 : null;
  const windowSoon = dw && hoursToWindow !== null && (hoursToWindow <= 2 || hoursToWindow >= 22);
  const plan = state.plans[0];

  return (
    <main className="app stack">
      <div className="row between">
        <Link href="/" className="logo">
          ebb
        </Link>
        <span className="chip">{state.profile.archetype}</span>
      </div>

      {state.demo && (
        <div className="panel tide row between" style={{ padding: "12px 16px" }}>
          <span className="small">You&apos;re exploring a 3-week demo account.</span>
          <button
            className="linkish small"
            onClick={() => {
              reset();
              router.push("/quiz");
            }}
          >
            Start fresh
          </button>
        </div>
      )}

      <div style={{ padding: "8px 0 2px" }}>
        <h2>{greeting(now.getHours())}.</h2>
        <p className="muted">
          {thisWeek.length === 0
            ? "When an urge shows up, tap SOS. That's the whole practice."
            : `${thisWeek.length} urge${thisWeek.length === 1 ? "" : "s"} met this week. ${
                thisWeek.filter((u) => u.paused).length
              } with a pause.`}
        </p>
      </div>

      {dw && (
        <div className={`panel ${windowSoon ? "deep" : "quiet"} stack`}>
          <div className="row between">
            <strong>Your danger window: {windowLabel(dw)}</strong>
            {windowSoon && <span className="chip buoy">Coming up</span>}
          </div>
          {plan ? (
            <p className={windowSoon ? "" : "muted"}>
              If {plan.ifText}, then {plan.thenText}.
            </p>
          ) : (
            <p className="muted">
              {dw.share}% of your urges land here. <Link href="/progress">Make a plan for it</Link>.
            </p>
          )}
        </div>
      )}

      <Link href="/sos" className="sos" aria-label="SOS: I have an urge to eat right now">
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, opacity: 0.55 }}>
          <Wave level={0.5} height={90} color="#e2ac2e" back="rgba(201,151,29,0.35)" />
        </div>
        <div className="sos-inner">
          <strong>SOS</strong>
          <span>I have an urge right now</span>
        </div>
      </Link>

      {!checkedToday && (
        <div className="panel stack">
          <strong>Quick check-in</strong>
          {(
            [
              ["mood", "Mood", ["😞", "🙁", "😐", "🙂", "😄"]],
              ["stress", "Stress", ["🧘", "🙂", "😐", "😣", "🤯"]],
              ["sleep", "Sleep last night", ["😵", "🥱", "😐", "🙂", "😴"]],
            ] as const
          ).map(([key, label, faces]) => (
            <div key={key} className="row between">
              <span className="small">{label}</span>
              <div className="row" style={{ gap: 4 }}>
                {faces.map((f, i) => (
                  <button
                    key={i}
                    className={`choice ${ci[key] === i + 1 ? "on" : ""}`}
                    style={{ padding: "4px 8px", fontSize: "1.1rem" }}
                    aria-label={`${label} ${i + 1} of 5`}
                    onClick={() => setCi({ ...ci, [key]: i + 1 })}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            className="btn btn-tide"
            disabled={!ci.mood || !ci.stress || !ci.sleep}
            onClick={() => addCheckIn({ ts: Date.now(), ...ci })}
          >
            Save check-in
          </button>
        </div>
      )}

      <div className="panel stack">
        <div className="row between">
          <strong>Your garden</strong>
          <span className="chip kelp">
            {points} plant{points === 1 ? "" : "s"}
          </span>
        </div>
        <Garden points={points} />
        <p className="small muted">Every urge you meet with a pause or an on-purpose choice plants something. Nothing is ever taken away.</p>
      </div>

      <Link href="/progress" className="panel stack" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="row between">
          <strong>Your skills</strong>
          <span className="small" style={{ color: "var(--tide)" }}>
            See progress
          </span>
        </div>
        {sk.map((s) => (
          <div key={s.key} className="row between">
            <span>{s.name}</span>
            <div className="level-pips" aria-label={`${s.name} level ${s.level} of 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <i key={n} className={n <= s.level ? "on" : ""} />
              ))}
            </div>
          </div>
        ))}
      </Link>

      <div className="panel stack">
        <strong>Your SOS buddy</strong>
        {state.profile.buddyName && !buddyEdit ? (
          <div className="row between">
            <span>
              {state.profile.buddyName} is one tap away in SOS.
            </span>
            <button
              className="linkish small"
              onClick={() => {
                setBuddy(state.profile?.buddyName ?? "");
                setBuddyEdit(true);
              }}
            >
              Change
            </button>
          </div>
        ) : (
          <div className="row">
            <input
              type="text"
              placeholder="Friend's name"
              value={buddy}
              onChange={(e) => setBuddy(e.target.value)}
              aria-label="Buddy name"
            />
            <button
              className="btn btn-tide"
              disabled={!buddy.trim()}
              onClick={() => {
                update((s) => (s.profile ? { ...s, profile: { ...s.profile, buddyName: buddy.trim() } } : s));
                setBuddyEdit(false);
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {!state.premium && (
        <Link href="/premium" className="panel deep stack" style={{ textDecoration: "none" }}>
          <strong>Ebb Plus</strong>
          <p className="muted">
            AI pattern insights, danger-window reminders, and a weekly skill report. SOS stays free, always.
          </p>
        </Link>
      )}

      <p className="small muted center">
        {dw ? `Tip: your urges peak around ${hourLabel(dw.startHour)}. ` : ""}
        <button
          className="linkish small"
          onClick={() => {
            if (confirm("Delete all your Ebb data from this device?")) {
              reset();
              router.push("/");
            }
          }}
        >
          Reset data
        </button>
      </p>
      <Nav />
    </main>
  );
}
