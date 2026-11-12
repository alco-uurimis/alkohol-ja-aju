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
The survey does not request name, e-mail, phone, school or exact date of birth. It collects sensitive alcohol-related answers without direct identifiers. Production saves the response in a private Google Sheet. Telegram can notify the organiser after a new response is saved without including response details. Public results, when enabled, are aggregates only and suppress groups smaller than N=10.

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

## Google accounts

GitHub Pages builds the account page from the repository Actions variables VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY. For local development, copy .env.example to .env.local and fill in the same public values. Only an sb_publishable_ key is accepted in the client. The Google OAuth Client Secret belongs in Supabase Auth provider settings.

Create a Web application client in Google Auth Platform, authorize the GitHub Pages origin and register the Supabase callback https://<project-ref>.supabase.co/auth/v1/callback. Enable Google in Supabase Auth and allow the exact site callback https://alco-uurimis.github.io/alkohol-ja-aju/account/. For a local sign-in test, also allow http://127.0.0.1:5173/account/. The first Google sign-in creates a Supabase Auth user. No application tables or migrations are required. Survey responses do not use this session.

## Deployment
GitHub Pages is deployed by `.github/workflows/deploy-pages.yml`.
Serverless research endpoints are under `api/` and deployed separately on Vercel.
Google Apps Script code for the Sheets webhook is in `docs/research-google-sheet-webhook.gs` and must be deployed manually as a Web App after script changes.

## Repository note
A legacy nested `alkohol-ja-aju/` copy is temporarily retained because older Vercel configuration may still use it as Root Directory. Do not delete it until the Vercel project root has been confirmed and migrated to repository root.

## Project
Author: Sofija Tsaika  
School: Tallinna Laagna Gümnaasium  
Year: 2026
