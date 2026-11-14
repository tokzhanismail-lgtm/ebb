"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEbb } from "@/lib/store";

const PLANS = [
  { key: "year", name: "Yearly", price: "$59.99", per: "per year", note: "That's $5 a month, half the monthly price", best: true },
  { key: "month", name: "Monthly", price: "$9.99", per: "per month", note: "Cancel any time", best: false },
] as const;

export default function Premium() {
  const router = useRouter();
  const { state, setPremium } = useEbb();
  const [plan, setPlan] = useState<"year" | "month">("year");
  const [next, setNext] = useState("/home");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n && n.startsWith("/")) setNext(n);
  }, []);

  return (
    <main className="app stack-lg">
      <div className="row between">
        <Link href="/home" className="logo">
          ebb
        </Link>
        <Link href={next} className="linkish small">
          Not now
        </Link>
      </div>

      <div className="stack">
        <h1 style={{ fontSize: "2.4rem" }}>Train the skill faster with Ebb Plus</h1>
        <p className="muted">SOS, the pause timer, and the garden stay free forever. Plus is for seeing — and planning for — your patterns.</p>
      </div>

      <ul className="panel stack" style={{ listStyle: "none" }}>
        {[
          ["AI pattern insights", "When, why, and what actually works for you."],
          ["Danger-window plans", "If-then plans with calendar reminders before your hardest hour."],
          ["Weekly skill report", "Your pause rate and urge intensity, week over week."],
          ["Talk-it-through coach", "Unlimited AI chat during a pause."],
        ].map(([t, d]) => (
          <li key={t}>
            <strong>{t}</strong>
            <span className="muted"> — {d}</span>
          </li>
        ))}
      </ul>

      <div className="choices">
        {PLANS.map((p) => (
          <button key={p.key} className={`choice ${plan === p.key ? "on" : ""}`} onClick={() => setPlan(p.key)} aria-pressed={plan === p.key}>
            <div className="row between">
              <strong>{p.name}</strong>
              {p.best && <span className="chip buoy">Most chosen</span>}
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.8rem" }}>
              {p.price} <span className="small">{p.per}</span>
            </div>
            <span className="small" style={{ opacity: 0.8 }}>
              {p.note}
            </span>
          </button>
        ))}
      </div>

      {state.premium ? (
        <Link href={next} className="btn btn-primary btn-block">
          You&apos;re on Ebb Plus — continue
        </Link>
      ) : (
        <button className="btn btn-primary btn-block" onClick={() => setConfirming(true)}>
          Start 7-day free trial
        </button>
      )}
      <p className="small muted center">Free for 7 days, then {plan === "year" ? "$59.99/year" : "$9.99/month"}. Cancel any time.</p>

      {confirming && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="trial-title">
          <div className="modal stack">
            <h3 id="trial-title">Hackathon test mode</h3>
            <p>
              This build runs payments in test mode, so no card is needed and nothing is charged. Your 7-day trial starts
              now.
            </p>
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                setPremium(true);
                router.push(next);
              }}
            >
              Start my trial
            </button>
            <button className="linkish small" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
