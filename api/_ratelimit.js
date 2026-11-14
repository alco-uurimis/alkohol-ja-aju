// Best-effort abuse brake shared by the public write endpoints. Counters live only in this instance's memory and are never
// written anywhere: no IP is stored; the key is cut to 64 characters and forgotten after the window.
const WINDOW_MS = 10 * 60 * 1000;
const buckets = new Map();

export function limited(req, bucket, max, now = Date.now()) {
  const raw = String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const hits = buckets.get(bucket) ?? buckets.set(bucket, new Map()).get(bucket);
  const key = raw.slice(0, 64);
  if (hits.size > 5000) { for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k); if (hits.size > 5000) hits.clear(); }
  const entry = hits.get(key);
  if (!entry || now - entry.start > WINDOW_MS) { hits.set(key, { start: now, count: 1 }); return false; }
  entry.count += 1;
  return entry.count > max;
}
