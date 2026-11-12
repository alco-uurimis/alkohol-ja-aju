import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** null when Supabase env vars are not set — the site then simply hides account UI. */
export const supabase: SupabaseClient | null = url && anonKey
  ? createClient(url, anonKey, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } })
  : null;

export const authEnabled = supabase !== null;
