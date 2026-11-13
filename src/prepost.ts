/** Items of the anonymous before-and-after knowledge check. `fact` is the correct answer ("fact" = true, "myth" = false). */
export const PREPOST_ITEMS = ['blackout', 'attention', 'reaction', 'sleep', 'decisions', 'development'] as const;
export type PrePostId = (typeof PREPOST_ITEMS)[number];
export const PREPOST_KEY: Record<PrePostId, boolean> = { blackout: true, attention: true, reaction: false, sleep: false, decisions: true, development: false };
export const PREPOST_ENDPOINT = 'https://alkohol-ja-aju.vercel.app/api/prepost';
export const PREPOST_STORAGE = 'alkohol-ja-aju:prepost';

export type Phase = 'pre' | 'post';
export type Answers = Partial<Record<PrePostId, boolean>>;
export type PhaseRecord = { answers: Answers; score: number; sent: 'yes' | 'no' | 'declined' };
export type LocalState = { token: string; consent: boolean; pre?: PhaseRecord; post?: PhaseRecord };

export const scoreOf = (answers: Answers) => PREPOST_ITEMS.reduce((s, id) => s + Number(answers[id] === PREPOST_KEY[id]), 0);

export function newToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function readState(): LocalState | null {
  try {
    const raw = localStorage.getItem(PREPOST_STORAGE);
    if (!raw) return null;
    const s = JSON.parse(raw) as LocalState;
    return s && typeof s.token === 'string' ? s : null;
  } catch { return null; }
}
export function writeState(state: LocalState | null) {
  try { state ? localStorage.setItem(PREPOST_STORAGE, JSON.stringify(state)) : localStorage.removeItem(PREPOST_STORAGE); } catch { /* storage unavailable: the check still works for this visit */ }
}
