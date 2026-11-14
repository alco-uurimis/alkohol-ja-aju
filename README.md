# Alkohol ja aju

Bilingual (ET/RU) science-based upper-secondary learning website about alcohol and the brain.

Production: https://alco-uurimis.github.io/alkohol-ja-aju/
Research survey: https://alco-uurimis.github.io/alkohol-ja-aju/science/

## Product areas
- guided 5-minute, full and classroom learning routes
- evidence pages with study design, sample, findings, limits and source links
- memory/attention exercises and three mini-games
- myth/fact quiz with confidence reflection
- classroom plan and printable worksheet
- 15+ deidentified research survey stored in a private Google Sheet with optional Telegram delivery notifications
- methodology, fact-checking, data-policy, topic index and privacy-thresholded aggregate results pages

## Research data
The survey does not request name, e-mail, phone, school or exact date of birth. It collects sensitive alcohol-related answers without direct identifiers. Production saves the response in a private Google Sheet. Telegram can notify the organiser after a new response is saved without including response details. Public results, when enabled, are aggregates only and require N=10 valid responses before anything is published and suppress single categories smaller than 5 (small categories are merged into an "other" row).

The web form itself is not an ethics approval. The organiser remains responsible for determining which consent/ethics requirements apply to the concrete research context, including participation by 15–17-year-olds.

## Local browser data
Learning progress and mini-game results are stored in `sessionStorage`; progress is kept in `localStorage` only when the user explicitly chooses to save it. The site does not transmit site-search queries. Local UI-event counters are session-only and are not sent to an analytics provider.

## Development
```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

Tech: React 19, TypeScript, Vite, Vitest.

## Deployment
GitHub Pages is deployed by `.github/workflows/deploy-pages.yml`.
Serverless research endpoints are under `api/` and deployed separately on Vercel.
Google Apps Script code for the Sheets webhook is in `docs/research-google-sheet-webhook.gs` and must be deployed manually as a Web App after script changes.

## Features worth knowing
- **Offline:** `public/sw.js` caches pages you have opened (network first for pages, cache first for hashed assets; never admin or API). Registered in production only.
- **Search:** header button / `/` / Ctrl+K on the main page; runs in the browser only, queries are not sent anywhere (`src/data/searchIndex.ts`).
- **Language data:** Russian lesson content is a separate chunk loaded on demand (`src/data/ru.ts`).
- **English (`/?lang=en`, the EN button; `/en/` redirects there):** the whole site — main page with all sections, lessons, teacher and help pages, science topics, methodology, data and privacy, results, the survey, the before/after check, the exercises, the classroom kit and the worksheet. The texts are a translation that a native speaker has not reviewed yet. The admin page stays Russian.
- **Before/after check (`/check/`):** anonymous 6-statement knowledge check, matched only by a random browser token (no account, no name). Stored through `api/prepost.js` into a `PrePost` sheet (Apps Script v13+). Admin sees matched-pair results and can print a report (`Сформировать отчёт`) with public thresholds (N≥10, cell≥5) or an internal version.
- **Printing:** the lesson plan can be printed or saved as PDF from the "Tunniks" section; long blocks collapse on screen and expand when printing.

## Admin access (no shared password)
`/admin/` is for signed-in Google accounts only: viewing uncensored results and deleting a response by ID. The API (`api/admin-data.js`, `api/admin-delete-response.js`) verifies the Supabase session server-side and allows only e-mails listed in the `ADMIN_EMAILS` Vercel variable (comma-separated). Required Vercel variables: `ADMIN_EMAILS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SHEET_WEBHOOK_URL`, `SHEET_WEBHOOK_SECRET`. The old `ADMIN_DASHBOARD_PASSWORD` variable is no longer used and can be deleted. The Google Apps Script (version 11 or newer) must be redeployed after changes to `docs/research-google-sheet-webhook.gs`.

## Project
Author: Sofija Tsaika  
School: Tallinna Laagna Gümnaasium  
Year: 2026

## Reading comfort, peer-norm widget, effect statistics

- **Reading comfort** (`src/components/Comfort.tsx`): "Aa" button in the header (menu on phones) — easy-read layout, calm (no animation) mode, read-aloud with the browser's own voices (no voice for the language → a notice, nothing is sent anywhere). Settings live in `localStorage`.
- **Peer-norm widget** (`src/components/PeerNorm.tsx`, `src/lib/norms.ts`) on the survey results page: visitors guess the share of respondents who drank less than monthly or not at all, then see the real figure from the public aggregate. It appears only when both categories are published (exact, nothing hidden) and the share is a majority.
- **Effect statistics** in the admin before/after card (`src/lib/stats.ts`): mean change, share of improvers with a Wilson 95% interval and an exact sign test. Descriptive only.
- `/api/prepost` has a best-effort per-IP brake (150 requests / 10 min, in-memory, nothing stored).

## Supabase copy of the research data (optional)

`api/_mirror.js` writes every survey response and before/after submission to Supabase as well as to the Google Sheet. It is off until you set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Vercel, server-side only) and run `docs/supabase-schema.sql`. Failures never affect the answer shown to the visitor, duplicates are ignored by primary key, and the Sheet remains the source of truth for the public and admin views. The same data now lives in a second store: say so in the privacy notice before enabling it.

The admin page has a "Копия в Supabase" card (row-count comparison, `api/admin-mirror-status.js`), and deleting a response by ID removes it from the Sheet **and** from the Supabase copy (the admin sees a warning if the copy could not be deleted). Rows written before the mirror was switched on are copied once with `scripts/backfill-supabase.mjs` (dry run by default; see the header of the script).

### Moving reads to Supabase: stage 1 (compare only)

`api/_aggregate.js` rebuilds the Sheet's summaries (`aggregate`, `adminAggregate`, `prepostAggregate`) from the Supabase rows. `src/aggregate.test.js` runs the **real** `docs/research-google-sheet-webhook.gs` against a fake spreadsheet and requires identical output on generated data. The admin card "Копия в Supabase → Сверить с таблицей" does the same comparison on live data. Nothing is switched yet: the site still reads from the Sheet.

### Moving reads to Supabase: stage 2 (switch)

Set `READ_SOURCE=supabase` in Vercel and redeploy: the public charts (`/api/research-summary`), the admin view (`/api/admin-data`) and delete-by-ID use Supabase rows, with the same privacy rules (`api/_aggregate.js`, `publicSummary`). If Supabase cannot be read, the public API falls back to the Sheet; the response header `X-Data-Source` and the admin page show which store answered. Remove the variable (or set `sheet`) and redeploy to go back. Writes always go to both stores.
`vercel.json` schedules `/api/keepalive` twice a week so a free Supabase project is not paused for inactivity.

### Stage 3: Supabase is the primary store

With `READ_SOURCE=supabase` a save succeeds when the Supabase insert succeeds (`api/_source.js` `primaryDelivery`; pre/post likewise). The Google Sheet is then only a best-effort second copy (6 s deadline, failures ignored), so the Apps Script no longer needs to be redeployed or even exist: unset `SHEET_WEBHOOK_URL` / `SHEET_WEBHOOK_SECRET` to retire it. `/api/research-health` reports both stores and judges `ok` by the primary one. Back up regularly from the admin page (CSV download, `api/admin-export.js`); a backup can be re-imported with `scripts/backfill-supabase.mjs`. Rolling back = remove `READ_SOURCE` and redeploy (the Sheet copy must have been kept for that to be complete).

### English survey

The survey (`/science/?lang=en`) has an English version: UI text in `src/data/researchUi.en.ts` (keyed by the Estonian source string), questions and options in `src/researchData.en.ts` (by question id and option value). `src/researchEn.test.js` fails if an Estonian UI string has no English text or if the English form differs from ET/RU in questions, option values or conditions. Responses are stored with `language: "en"`. **Run `docs/supabase-migration-en.sql` in Supabase before enabling it** (the language column used to allow only et/ru; without the change Supabase rejects English responses). The English wording is my translation and has not been validated; the English methodology page says so.

### English exercises and worksheet

`en/practice.html`, `en/situations.html` (“What to do in real life”, `src/data/action.en.ts`) and `en/classroom.html` (classroom kit, `src/data/classroom.en.ts`) share one entry, `src/en-sections-main.tsx`, which picks the content from `<body data-page>`. `en/practice.html` shows the memory exercise, the attention task and the three mini-games in English. Their texts live in `src/data/games.en.ts`, keyed by the Estonian source string (`src/researchEn.test.js` fails on a missing key); the word pool is `wordsEn`. `worksheet/en/` is the English A4 worksheet. 

### English main page

The main page now runs in English (`/?lang=en`, the EN button) with the same design and sections as ET/RU; `/en/` redirects to it. Texts: the main-page components wrap their strings in `T(lang, ru ? … : …)` and look the Estonian source string up in `src/data/site/*.en.ts` (merged by `src/data/siteT.ts`); structured data has English variants next to the ET/RU ones (`content.en.ts`: topics, knowledge cards, sources, takeaways, myth/fact; glossary, brain regions and exercises in their components). `src/researchEn.test.js` fails when a string has no English text. The administration page stays Russian.
