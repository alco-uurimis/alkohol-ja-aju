-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Tables are written only by the Vercel API with the service-role key. Row level security is ON and there are NO policies,
-- so the public anon key (used by the website for sign-in) can neither read nor write them.

create table if not exists public.research_responses (
  response_id  text primary key,
  submitted_at timestamptz not null,
  language     text not null check (language in ('et', 'ru')),
  version      int  not null,
  answers      jsonb not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.prepost_submissions (
  token        text not null check (token ~ '^[a-f0-9]{32}$'),
  phase        text not null check (phase in ('pre', 'post')),
  lang         text not null check (lang in ('et', 'ru', 'en')),
  correct      jsonb not null,
  score        int  not null,
  total        int  not null,
  created_at   timestamptz not null default now(),
  primary key (token, phase)
);

alter table public.research_responses enable row level security;
alter table public.prepost_submissions enable row level security;
-- (intentionally no "create policy" statements)

create index if not exists research_responses_submitted_at on public.research_responses (submitted_at);
