"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import LineChart from "@/components/LineChart";
import Nav from "@/components/Nav";
import { buildDemoState } from "@/lib/demo";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { avgDrop, dangerWindow, emotionCounts, hourLabel, pct, skills, summaryForAI, weeklyStats, windowLabel } from "@/lib/stats";
import { uid, useEbb } from "@/lib/store";
import { emotionLabel } from "@/lib/techniques";
import type { Urge } from "@/lib/types";

interface Insights {
  headline: string;
  patterns: string[];
  plan: { if: string; then: string };
  progress?: string;
  encouragement?: string;
}

function localInsights(urges: Urge[]): Insights {
  const dw = dangerWindow(urges);
  const em = emotionCounts(urges);
  const top = em[0];
  const notHungry = pct(urges.filter((u) => u.hunger <= 3).length, urges.length);
  const weeks = weeklyStats(urges);
  const buddyDays = urges.filter((u) => u.withBuddy);
  return {
    headline: dw
      ? `Most of your urges arrive ${windowLabel(dw)}, and they're usually about feeling ${top ? emotionLabel(top.emotion).toLowerCase() : "drained"}, not hunger.`
      : "You're building the habit of noticing. A few more logged urges and your patterns will show.",
    patterns: [
      dw ? `${dw.share}% of your urges land between ${windowLabel(dw)}, ${dw.weekdayShare}% of those on weekdays.` : "Log a few more urges to find your danger window.",
      `You weren't physically hungry in ${notHungry}% of your urges. The urge was asking for something else.`,
      buddyDays.length
        ? `When you messaged someone, you avoided autopilot eating in ${pct(buddyDays.filter((u) => u.outcome !== "usual").length, buddyDays.length)}% of cases.`
        : top
        ? `Feeling ${emotionLabel(top.emotion).toLowerCase()} shows up in ${top.share}% of your urges.`
        : "Every urge you log makes the next insight sharper.",
    ],
    plan: {
      if: dw
        ? `it's around ${hourLabel(dw.startHour)} on a weeknight and I feel ${top ? emotionLabel(top.emotion).toLowerCase() : "worn out"}`
        : "I notice I'm heading to the kitchen without being hungry",
      then: "I make a warm drink and take it somewhere away from the kitchen for 5 minutes",
    },
    progress:
      weeks.length > 1
        ? `Your pause rate went from ${weeks[0].pauseRate}% in week 1 to ${weeks[weeks.length - 1].pauseRate}% in week ${weeks.length}.`
        : undefined,
    encouragement: "Noticing is the skill. You're already doing it.",
  };
}

export default function Progress() {
  const { state, ready, addPlan, removePlan, replaceAll } = useEbb();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [insSource, setInsSource] = useState<"ai" | "library" | null>(null);
  const [loading, setLoading] = useState(false);
  const [ifText, setIfText] = useState("");
  const [thenText, setThenText] = useState("");
  const [savedSuggestion, setSavedSuggestion] = useState(false);

  const weeks = useMemo(() => weeklyStats(state.urges), [state.urges]);
  const sk = useMemo(() => skills(state.urges, state.plans), [state.urges, state.plans]);
  const dw = useMemo(() => dangerWindow(state.urges), [state.urges]);
  const em = useMemo(() => emotionCounts(state.urges), [state.urges]);
  const drop = avgDrop(state.urges);

  if (!ready) return <main className="app" />;

  if (state.urges.length === 0) {
    return (
      <main className="app stack-lg">
        <h2>Your progress</h2>
        <div className="panel stack">
          <p>Your skill curve starts with your first SOS. Log an urge — any outcome counts.</p>
          <Link href="/sos" className="btn btn-primary btn-block">
            Open SOS
          </Link>
          <button className="btn btn-ghost btn-block" onClick={() => replaceAll(buildDemoState())}>
            Load the 3-week demo
          </button>
        </div>
        <Nav />
      </main>
    );
  }

  const findPatterns = async () => {
    setLoading(true);
    setSavedSuggestion(false);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ summary: summaryForAI(state.urges, state.plans) }),
      });
      const data = await res.json();
      if (data.source === "ai" && data.insights) {
        setInsights(data.insights);
        setInsSource("ai");
      } else {
        setInsights(localInsights(state.urges));
        setInsSource("library");
      }
    } catch {
      setInsights(localInsights(state.urges));
      setInsSource("library");
    } finally {
      setLoading(false);
    }
  };

  const first = weeks[0];
  const last = weeks[weeks.length - 1];

  return (
    <main className="app stack">
      <div className="row between">
        <Link href="/home" className="logo">
          ebb
        </Link>
        <span className="chip">{state.urges.length} urges logged</span>
      </div>

      <div className="panel deep stack">
        <p className="muted">How often you pause before eating</p>
        <h2>
          {weeks.length > 1 ? `${first.pauseRate}% → ${last.pauseRate}% in ${weeks.length} weeks` : `${last.pauseRate}% this week`}
        </h2>
        <div style={{ background: "var(--foam)", borderRadius: 14, padding: "8px 6px 2px" }}>
          <LineChart points={weeks.map((w) => w.pauseRate)} labels={weeks.map((w) => w.label)} />
        </div>
        {drop > 0 && <p className="muted small">After a pause, your urges drop by {drop} points on average (out of 10).</p>}
      </div>

      <div className="panel stack">
        <strong>Your four skills</strong>
        {sk.map((s) => (
          <div key={s.key} className="stack" style={{ gap: 4 }}>
            <div className="row between">
              <span>
                <strong>{s.name}</strong> <span className="muted small">{s.verb.toLowerCase()}</span>
              </span>
              <span className="chip">Level {s.level}</span>
            </div>
            <div className="bar" aria-label={`${s.name} ${s.score}%`}>
              <i style={{ width: `${Math.max(4, s.score)}%` }} />
            </div>
            <p className="small muted">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="row" style={{ alignItems: "stretch" }}>
        <div className="panel stack" style={{ flex: 1 }}>
          <div className="small muted">Danger window</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", lineHeight: 1.1 }}>{dw ? windowLabel(dw) : "—"}</div>
          <div className="small muted">{dw ? `${dw.share}% of urges` : "Needs 3+ urges"}</div>
        </div>
        <div className="panel stack" style={{ flex: 1 }}>
          <div className="small muted">On-purpose choices</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", lineHeight: 1.1 }}>{last.choiceRate}%</div>
          <div className="small muted">in your latest week</div>
        </div>
      </div>

      <div className="panel stack">
        <strong>What your urges are about</strong>
        {em.slice(0, 5).map((e) => (
          <div key={e.emotion} className="stack" style={{ gap: 4 }}>
            <div className="row between small">
              <span>{emotionLabel(e.emotion)}</span>
              <span className="muted">{e.share}%</span>
            </div>
            <div className="bar">
              <i style={{ width: `${e.share}%`, background: "var(--deep)" }} />
            </div>
          </div>
        ))}
      </div>

      <div className="panel tide stack">
        <div className="row between">
          <strong>Your patterns</strong>
          {insSource && <span className="chip buoy">{insSource === "ai" ? "AI analysis" : "Ebb analysis"}</span>}
        </div>
        {!state.premium ? (
          <>
            <p className="muted">
              Ebb reads your log and finds when, why, and what works for you — then turns it into a plan for your
              hardest hour.
            </p>
            <Link href="/premium?next=/progress" className="btn btn-primary btn-block">
              Unlock with a 7-day free trial
            </Link>
          </>
        ) : !insights ? (
          <button className="btn btn-primary btn-block" onClick={findPatterns} disabled={loading}>
            {loading ? "Reading your log…" : "Find my patterns"}
          </button>
        ) : (
          <div className="stack">
            <p style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", lineHeight: 1.3 }}>{insights.headline}</p>
            <ul className="stack" style={{ margin: 0, paddingLeft: 18 }}>
              {insights.patterns.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            {insights.progress && <p className="small">{insights.progress}</p>}
            <div className="panel stack">
              <span className="small muted">Suggested plan for your hardest moment</span>
              <p>
                <strong>If</strong> {insights.plan.if}, <strong>then</strong> {insights.plan.then}.
              </p>
              {!savedSuggestion ? (
                <button
                  className="btn btn-tide"
                  onClick={() => {
                    addPlan({ id: uid(), ifText: insights.plan.if, thenText: insights.plan.then, createdAt: Date.now() });
                    setSavedSuggestion(true);
                  }}
                >
                  Save this plan
                </button>
              ) : (
                <p className="small" style={{ color: "var(--kelp)" }}>
                  Saved. It now shows on your Today screen.
                </p>
              )}
            </div>
            {insights.encouragement && <p className="small muted">{insights.encouragement}</p>}
            <button className="linkish small" onClick={findPatterns}>
              Run again
            </button>
          </div>
        )}
      </div>

      <div className="panel stack">
        <strong>Your if-then plans</strong>
        <p className="small muted">Deciding ahead of time is one of the most reliable ways to change a habit.</p>
        {state.plans.map((p) => (
          <div key={p.id} className="panel quiet stack">
            <p>
              <strong>If</strong> {p.ifText}, <strong>then</strong> {p.thenText}.
            </p>
            <div className="row between">
              {dw ? (
                <button className="linkish small" onClick={() => downloadIcs(buildIcs(dw.startHour, p.ifText, p.thenText))}>
                  Add a weekday reminder to my calendar
                </button>
              ) : (
                <span />
              )}
              <button className="linkish small" style={{ color: "var(--danger)" }} onClick={() => removePlan(p.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className="stack">
          <input type="text" placeholder="If… (e.g. it's 9pm and I'm on the couch)" value={ifText} onChange={(e) => setIfText(e.target.value)} aria-label="If" />
          <input type="text" placeholder="Then… (e.g. I brush my teeth and make tea)" value={thenText} onChange={(e) => setThenText(e.target.value)} aria-label="Then" />
          <button
            className="btn btn-ghost"
            disabled={!ifText.trim() || !thenText.trim()}
            onClick={() => {
              addPlan({ id: uid(), ifText: ifText.trim().replace(/^if\s+/i, ""), thenText: thenText.trim().replace(/^then\s+/i, ""), createdAt: Date.now() });
              setIfText("");
              setThenText("");
            }}
          >
            Add my own plan
          </button>
        </div>
      </div>
      <Nav />
    </main>
  );
}
