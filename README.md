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
- **Printing:** the lesson plan can be printed or saved as PDF from the "Tunniks" section; long blocks collapse on screen and expand when printing.

## Admin access (no shared password)
`/admin/` is for signed-in Google accounts only: viewing uncensored results and deleting a response by ID. The API (`api/admin-data.js`, `api/admin-delete-response.js`) verifies the Supabase session server-side and allows only e-mails listed in the `ADMIN_EMAILS` Vercel variable (comma-separated). Required Vercel variables: `ADMIN_EMAILS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SHEET_WEBHOOK_URL`, `SHEET_WEBHOOK_SECRET`. The old `ADMIN_DASHBOARD_PASSWORD` variable is no longer used and can be deleted. The Google Apps Script (version 11 or newer) must be redeployed after changes to `docs/research-google-sheet-webhook.gs`.

## Project
Author: Sofija Tsaika  
School: Tallinna Laagna Gümnaasium  
Year: 2026
