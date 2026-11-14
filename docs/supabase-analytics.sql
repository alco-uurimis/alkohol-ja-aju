-- Run once in Supabase (SQL Editor) to switch on the cookie-free usage counters.
-- Each row is a daily total; nothing in it identifies a visitor. Only the Vercel API (service key) can write or read it.
create table if not exists public.site_events (
  day    date not null,
  event  text not null check (event in ('page','section','quiz','game','explore','survey','check','feedback')),
  key    text not null check (key ~ '^[a-z0-9-]{1,40}$'),
  lang   text not null check (lang in ('et','ru','en')),
  count  integer not null default 0,
  primary key (day, event, key, lang)
);
alter table public.site_events enable row level security;  -- no policies: the public keys can neither read nor write

create or replace function public.bump_site_event(p_day date, p_event text, p_key text, p_lang text)
returns void language sql security definer set search_path = public as $$
  insert into public.site_events (day, event, key, lang, count) values (p_day, p_event, p_key, p_lang, 1)
  on conflict (day, event, key, lang) do update set count = public.site_events.count + 1;
$$;
revoke all on function public.bump_site_event(date, text, text, text) from public, anon, authenticated;

-- Optional: keep only the last 13 months.
-- delete from public.site_events where day < current_date - interval '13 months';
