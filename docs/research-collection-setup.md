# Research survey collection: Google Sheets + Telegram

The research survey posts to `https://alkohol-ja-aju.vercel.app/api/research`.
The Vercel endpoint validates the anonymous response, stores it in Google Sheets through an Apps Script webhook, then sends the same response summary to the existing Telegram bot/chat.

## Google Sheet

Spreadsheet: `Алкоголь и мозг — ответы исследования`

Spreadsheet ID:

`1U4vVdsnYMPq-CZRbXxm_rqNk-n9kF4Chtu-wl5pz7Lg`

Worksheet: `Responses`

The first row contains the stable schema used by `api/research.js` and `docs/research-google-sheet-webhook.gs`.

## 1. Deploy the Google Apps Script webhook

1. Open the spreadsheet.
2. Choose **Extensions → Apps Script**.
3. Replace the default editor contents with the complete contents of `docs/research-google-sheet-webhook.gs` from this repository.
4. Open **Project Settings → Script Properties**.
5. Add a property named `WEBHOOK_SECRET` with a long random value. Do not commit or publish that value.
6. Choose **Deploy → New deployment → Web app**.
7. Execute as: **Me**.
8. Who has access: **Anyone**. The endpoint still rejects requests without the secret.
9. Deploy and copy the `/exec` Web App URL.

## 2. Configure Vercel

In the Vercel project `alkohol-ja-aju`, add these Environment Variables to Production (and Preview if desired):

- `SHEET_WEBHOOK_URL` = the Apps Script `/exec` URL
- `SHEET_WEBHOOK_SECRET` = exactly the same value as the Apps Script `WEBHOOK_SECRET`

The existing Telegram delivery continues to use:

- `BOT_TOKEN`
- `CHAT_ID`

After adding or changing environment variables, redeploy the Vercel project so the serverless function receives the new values.

## 3. Test

Submit one complete response from `/science/`.

Expected result:

1. The participant sees a success screen with a `research_...` response ID.
2. A new row appears in `Responses` in Google Sheets.
3. A Telegram message arrives with the same response ID.

If Google Sheets succeeds but Telegram fails, the form may safely be submitted again: the Apps Script de-duplicates Google Sheet rows by `response_id`.

## Data handling

The survey is limited to adults (18+) and does not request name, email, phone, school, or exact date of birth. The page discloses before submission that anonymous answers are stored in the private Google Sheet and copied to the organizer's Telegram. Access to both destinations should remain restricted to the research organizer(s).
