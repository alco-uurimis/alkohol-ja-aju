-- Run once in Supabase (SQL Editor) BEFORE the English survey goes live, if the tables were created from the first
-- version of docs/supabase-schema.sql: the language column used to allow only 'et' and 'ru'.
alter table public.research_responses drop constraint if exists research_responses_language_check;
alter table public.research_responses add constraint research_responses_language_check check (language in ('et', 'ru', 'en'));
