import { createClient } from '@supabase/supabase-js';

type PublicConfig = {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

const env: PublicConfig = (import.meta as ImportMeta & { env: PublicConfig }).env;
const projectUrl = env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '');
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const accountClient = projectUrl?.startsWith('https://') && publishableKey?.startsWith('sb_publishable_')
  ? createClient(projectUrl, publishableKey, {
    auth: { flowType: 'pkce', detectSessionInUrl: false },
  })
  : null;

export function readOAuthReturn(pageUrl: string) {
  const url = new URL(pageUrl);
  const fragment = new URLSearchParams(url.hash.slice(1));
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error_code') ?? url.searchParams.get('error')
    ?? fragment.get('error_code') ?? fragment.get('error');
  const hasOAuthParams = code !== null || error !== null;
  if (hasOAuthParams) {
    for (const key of ['code', 'error', 'error_code', 'error_description']) url.searchParams.delete(key);
    if (fragment.has('error') || fragment.has('error_code')) url.hash = '';
  }
  return { code, error, hasOAuthParams, cleanUrl: url };
}

export async function googleIsEnabled() {
  if (!projectUrl || !publishableKey) return false;
  const response = await fetch(projectUrl + '/auth/v1/settings', {
    headers: { apikey: publishableKey },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Cannot read Supabase Auth settings');
  const settings: { external?: { google?: boolean } } = await response.json();
  return settings.external?.google === true;
}
