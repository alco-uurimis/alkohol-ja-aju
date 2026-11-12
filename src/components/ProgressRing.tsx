/** Small circular progress indicator. Decorative: the same numbers are always printed as text next to it. */
export default function ProgressRing({ value, max, size = 56 }: { value: number; max: number; size?: number }) {
  const r = 22, c = 2 * Math.PI * r;
  const k = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <svg className="progress-ring" width={size} height={size} viewBox="0 0 56 56" aria-hidden="true" focusable="false">
      <circle className="progress-ring__bg" cx="28" cy="28" r={r} />
      <circle className="progress-ring__fg" cx="28" cy="28" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - k)} />
      <text x="28" y="28" className="progress-ring__txt">{Math.round(k * 100)}%</text>
    </svg>
  );
}
