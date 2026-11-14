"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The signature element: a live wave. `level` (0–1) sets how high the urge is.
 * During a pause the wave visibly settles — urges peak and fade.
 */
export default function Wave({
  level = 0.7,
  height = 120,
  color = "#2d7c80",
  back = "rgba(45,124,128,0.35)",
}: {
  level?: number;
  height?: number;
  color?: string;
  back?: string;
}) {
  const [t, setT] = useState(0);
  const raf = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced.current) return;
    let last = performance.now();
    const tick = (now: number) => {
      setT((x) => x + (now - last) / 1000);
      last = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const w = 400;
  const amp = 6 + Math.max(0, Math.min(1, level)) * (height * 0.36);
  const mid = height * 0.55;
  const path = (phase: number, a: number, freq: number) => {
    let d = `M 0 ${height}`;
    for (let x = 0; x <= w; x += 8) {
      const y = mid - a * Math.sin((x / w) * Math.PI * freq + phase) * (0.6 + 0.4 * Math.sin(x / 90 + phase / 2));
      d += ` L ${x} ${y.toFixed(1)}`;
    }
    return d + ` L ${w} ${height} Z`;
  };

  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <path d={path(t * 1.1 + 1.4, amp * 0.8, 2.2)} fill={back} />
      <path d={path(t * 1.6, amp, 2.6)} fill={color} />
    </svg>
  );
}
