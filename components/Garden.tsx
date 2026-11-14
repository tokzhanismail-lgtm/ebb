/**
 * The garden grows one plant for every urge met with awareness (a pause or an on-purpose choice).
 * Slips never remove plants — there is no punishment, only growth.
 */
export default function Garden({ points, highlightLast = false }: { points: number; highlightLast?: boolean }) {
  const shown = Math.min(points, 24);
  const plants = Array.from({ length: shown }, (_, i) => i);
  const kinds = ["sprout", "tulip", "fern", "daisy"] as const;

  return (
    <svg viewBox="0 0 320 120" width="100%" role="img" aria-label={`Your garden has ${points} plants`}>
      <rect x="0" y="96" width="320" height="24" rx="8" fill="#c7d8c0" />
      <path d="M0 98 Q 80 88 160 98 T 320 98 L320 120 L0 120Z" fill="#a9c39c" />
      {plants.map((i) => {
        const col = i % 12;
        const rowBack = i >= 12;
        const x = 16 + col * 26 + (rowBack ? 13 : 0);
        const base = rowBack ? 92 : 104;
        const scale = rowBack ? 0.8 : 1;
        const kind = kinds[(i * 7) % kinds.length];
        const isNew = highlightLast && i === shown - 1;
        return (
          <g key={i} transform={`translate(${x} ${base}) scale(${scale})`}>
            <g className={isNew ? "grow" : undefined}>
              <Plant kind={kind} seed={i} />
            </g>
          </g>
        );
      })}
      {points === 0 && (
        <text x="160" y="60" textAnchor="middle" fill="#5b7176" fontSize="13" fontFamily="var(--sans)">
          Your first pause plants the first seed.
        </text>
      )}
    </svg>
  );
}

function Plant({ kind, seed }: { kind: "sprout" | "tulip" | "fern" | "daisy"; seed: number }) {
  const h = 26 + (seed % 4) * 6;
  const stem = <path d={`M0 0 Q ${seed % 2 ? 3 : -3} ${-h / 2} 0 ${-h}`} stroke="#4f7a4b" strokeWidth="2.4" fill="none" />;
  const leaf = (
    <>
      <path d={`M0 ${-h * 0.35} q -9 -4 -11 -11 q 8 1 11 11Z`} fill="#6f9e63" />
      <path d={`M0 ${-h * 0.55} q 9 -4 11 -11 q -8 1 -11 11Z`} fill="#5e8b5a" />
    </>
  );
  if (kind === "tulip")
    return (
      <g>
        {stem}
        {leaf}
        <path d={`M-6 ${-h} q 6 -14 12 0 q -3 6 -6 6 q -3 0 -6 -6Z`} fill="#f2c14e" />
      </g>
    );
  if (kind === "daisy")
    return (
      <g>
        {stem}
        {leaf}
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="0" cy={-h - 6} rx="2.6" ry="5.5" fill="#f7faf9" transform={`rotate(${a} 0 ${-h})`} />
        ))}
        <circle cx="0" cy={-h} r="3" fill="#f2c14e" />
      </g>
    );
  if (kind === "fern")
    return (
      <g>
        {stem}
        {[0.25, 0.45, 0.65, 0.85].map((f, j) => (
          <g key={j}>
            <path d={`M0 ${-h * f} q -8 -2 -10 -8`} stroke="#5e8b5a" strokeWidth="2" fill="none" />
            <path d={`M0 ${-h * f} q 8 -2 10 -8`} stroke="#6f9e63" strokeWidth="2" fill="none" />
          </g>
        ))}
      </g>
    );
  return (
    <g>
      {stem}
      {leaf}
      <circle cx="0" cy={-h} r="4" fill="#2d7c80" />
    </g>
  );
}
