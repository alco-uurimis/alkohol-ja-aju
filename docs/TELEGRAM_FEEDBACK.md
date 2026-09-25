# Telegram feedback setup

The GitHub Pages frontend must **not** contain a Telegram bot token. Anyone can inspect JavaScript served by GitHub Pages, so a token embedded in React would allow other people to control the bot.

The repository includes `docs/telegram-feedback-worker.js`, a small Cloudflare Worker example that forwards anonymous survey responses to Telegram.

## Required Worker secrets

- `TELEGRAM_BOT_TOKEN` — token issued by BotFather.
- `TELEGRAM_CHAT_ID` — user, group, or channel chat ID that receives survey responses.
- `ALLOWED_ORIGIN` — normally `https://alco-uurimis.github.io`.

Deploy the Worker, add these values as encrypted Worker secrets, and copy its public HTTPS URL.

Then set the `endpoint` constant near the top of `src/components/FeedbackSurvey.tsx` to that Worker URL and push the change. Do not add the bot token or chat ID to that file.

The form intentionally collects only anonymous feedback about the learning material: clarity rating, most useful section, recommendation, and an optional comment. It tells respondents not to include names or contact details and requires explicit consent before sending.
