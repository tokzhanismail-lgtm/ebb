"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppState, CheckIn, IfThenPlan, Profile, Urge } from "./types";

const KEY = "ebb-state-v1";

export const emptyState: AppState = {
  profile: null,
  urges: [],
  plans: [],
  checkins: [],
  premium: false,
  demo: false,
};

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyState;
    return { ...emptyState, ...JSON.parse(raw) };
  } catch {
    return emptyState;
  }
}

export function saveState(s: AppState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new Event("ebb-state"));
  } catch {
    /* storage unavailable — keep in memory only */
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** React hook: shared app state persisted in localStorage (no login needed). */
export function useEbb() {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
    const onChange = () => setState(loadState());
    window.addEventListener("ebb-state", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ebb-state", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((fn: (s: AppState) => AppState) => {
    const next = fn(loadState());
    saveState(next);
    setState(next);
  }, []);

  const setProfile = useCallback((p: Profile) => update((s) => ({ ...s, profile: p })), [update]);
  const addUrge = useCallback((u: Urge) => update((s) => ({ ...s, urges: [...s.urges, u] })), [update]);
  const addPlan = useCallback((p: IfThenPlan) => update((s) => ({ ...s, plans: [p, ...s.plans] })), [update]);
  const removePlan = useCallback(
    (id: string) => update((s) => ({ ...s, plans: s.plans.filter((p) => p.id !== id) })),
    [update]
  );
  const addCheckIn = useCallback((c: CheckIn) => update((s) => ({ ...s, checkins: [...s.checkins, c] })), [update]);
  const setPremium = useCallback((v: boolean) => update((s) => ({ ...s, premium: v })), [update]);
  const replaceAll = useCallback((s: AppState) => update(() => s), [update]);
  const reset = useCallback(() => update(() => emptyState), [update]);

  return { state, ready, update, setProfile, addUrge, addPlan, removePlan, addCheckIn, setPremium, replaceAll, reset };
}
