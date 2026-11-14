import type { SupabaseClient } from '@supabase/supabase-js';

const enabled = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

/** Whether the build has Supabase settings at all (no network, no client code involved). */
export const authEnabled = enabled;

/**
 * True when the client has something to do right away: the OAuth redirect (?code=…) is in the address, or a session is stored.
 * Everyone else never needs the ~60 KB client until they press "Log in".
 */
export function authNeededAtStart(): boolean {
  if (!enabled) return false;
  try {
    if (new URLSearchParams(location.search).has('code')) return true;
    return Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  } catch { return false; }
}

let pending: Promise<SupabaseClient | null> | null = null;
/** Loads the Supabase client chunk on first use. */
export function loadSupabase(): Promise<SupabaseClient | null> {
  pending ??= import('./supabase').then(m => m.supabase, e => { pending = null; throw e; });
  return pending;
}
