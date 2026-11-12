/** Mini line chart of a short series (e.g. the last reaction-time attempts). Scale: min..max of the data with padding. */
export default function Sparkline({ values, unit = 'ms', label }: { values: number[]; unit?: string; label: string }) {
  if (values.length < 2) return null;
  const W = 240, H = 64, padX = 10, padTop = 10, padBottom = 12;
  const lo = Math.min(...values), hi = Math.max(...values), span = Math.max(1, hi - lo);
  const x = (i: number) => padX + (i * (W - 2 * padX)) / (values.length - 1);
  const y = (v: number) => padTop + (1 - (v - lo) / span) * (H - padTop - padBottom);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('');
  const last = values.length - 1;
  return (
    <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${values.join(', ')} ${unit}`}>
      <path className="sparkline__area" d={`${d}L${x(last)} ${H - padBottom}L${x(0)} ${H - padBottom}Z`} />
      <path className="sparkline__line" d={d} pathLength={1} />
      {values.map((v, i) => <circle key={i} className={'sparkline__dot' + (i === last ? ' is-last' : '')} cx={x(i)} cy={y(v)} r={i === last ? 4.5 : 3} />)}
    </svg>
  );
}
