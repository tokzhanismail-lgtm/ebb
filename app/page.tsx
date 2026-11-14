"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Wave from "@/components/Wave";
import { buildDemoState } from "@/lib/demo";
import { useEbb } from "@/lib/store";

export default function Landing() {
  const router = useRouter();
  const { state, ready, replaceAll } = useEbb();
  const [level, setLevel] = useState(0.85);

  // The hero wave rises and settles on a loop — the whole product in one picture.
  useEffect(() => {
    let up = false;
    const id = setInterval(() => {
      setLevel((l) => {
        if (l <= 0.12) up = true;
        if (l >= 0.85) up = false;
        return up ? Math.min(0.85, l + 0.09) : Math.max(0.1, l - 0.025);
      });
    }, 400);
    return () => clearInterval(id);
  }, []);

  const startDemo = () => {
    replaceAll(buildDemoState());
    router.push("/home");
  };

  const intensity = Math.max(1, Math.round(level * 10));

  return (
    <main>
      <div className="wrap">
        <header className="topbar">
          <Link href="/" className="logo">
            ebb
          </Link>
          {ready && state.profile ? (
            <Link href="/home" className="btn btn-ghost">
              Open my Ebb
            </Link>
          ) : (
            <button className="btn btn-ghost" onClick={startDemo}>
              Try the demo
            </button>
          )}
        </header>

        <section className="hero">
          <div className="hero-grid">
            <div className="stack-lg">
              <h1>Cravings come in waves. Learn to let them pass.</h1>
              <p style={{ fontSize: "1.2rem", maxWidth: "34em" }}>
                Ebb is a skill trainer for emotional eating. When the urge hits, it helps you notice what you&apos;re feeling,
                pause, and choose on purpose. No diets, no calorie counting, no shame.
              </p>
              <div className="row wrap-row">
                <Link href="/quiz" className="btn btn-primary">
                  Take the 1-minute quiz
                </Link>
                <button className="btn btn-ghost" onClick={startDemo}>
                  See 3 weeks of progress
                </button>
              </div>
              <p className="muted small">For adults who eat when they&apos;re tired, stressed, bored, or lonely — not hungry.</p>
            </div>

            <div className="hero-wave" aria-label="An urge rising and fading">
              <div className="row between">
                <span className="small" style={{ color: "#b9cbcd" }}>
                  9:14pm, Tuesday
                </span>
                <span className="chip buoy">Urge {intensity}/10</span>
              </div>
              <div style={{ margin: "18px -26px 6px" }}>
                <Wave level={level} height={150} color="#f2c14e" back="rgba(242,193,78,0.3)" />
              </div>
              <p style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", lineHeight: 1.25 }}>
                {level > 0.5
                  ? "Tired, not hungry. Breathe with it."
                  : level > 0.25
                  ? "It's already smaller than it was."
                  : "It passed. You chose."}
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: "64px 0 10px" }} className="stack-lg">
          <h2>One skill, in four steps</h2>
          <div className="steps">
            {[
              ["Notice", "Tell hunger from emotion, and name what you're feeling."],
              ["Pause", "Ride the wave for 10 minutes. Urges peak and fade on their own."],
              ["Choose", "Skip it, swap it, or eat mindfully. Every on-purpose choice counts."],
              ["Predict", "Ebb learns your danger hours and helps you plan for them."],
            ].map(([t, d], i) => (
              <div key={t} className="panel stack">
                <div className="step-n">{i + 1}</div>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "48px 0 10px" }}>
          <div className="panel deep" style={{ padding: 32 }}>
            <div className="hero-grid" style={{ alignItems: "start" }}>
              <div className="stack">
                <h2>Built to be different from a diet app</h2>
                <p className="muted">
                  Diets tell you what to eat. Most people already know. The hard part is the moment at 9pm when the day
                  catches up with you. That moment is what Ebb trains for.
                </p>
              </div>
              <ul className="stack" style={{ margin: 0, paddingLeft: 18 }}>
                <li>No calories, no scales, no foods labeled good or bad.</li>
                <li>SOS is always free. Help in a hard moment never sits behind a paywall.</li>
                <li>A real person on call: send your buddy a message in one tap.</li>
                <li>Progress you can see: how often you pause, week by week.</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="footer stack">
          <p>
            Ebb is a wellness tool for building emotional-regulation skills. It is not therapy, medical care, or treatment
            for eating disorders. If you&apos;re struggling, call or text 988, or call the National Alliance for Eating
            Disorders at 1-866-662-1235. <Link href="/support">More support</Link>
          </p>
          <p>Made in 24 hours for Business Cup 2.0.</p>
        </footer>
      </div>
    </main>
  );
}
