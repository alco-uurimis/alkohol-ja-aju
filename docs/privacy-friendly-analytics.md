# Privacy-friendly analytics design

The production site does not require third-party analytics to work.

## Events worth measuring
If an analytics provider is connected later, measure actions rather than sensitive content:
- learning route started (`quick`, `full`, `classroom`)
- science topic opened
- mini-game started / completed
- knowledge quiz completed
- methodology / source opened
- research survey opened
- public-results page opened

Never send:
- survey answers
- search queries
- comments/free text
- age group or alcohol-use answers
- Telegram/Google delivery identifiers
- response IDs

## Current implementation
The UI may dispatch `alkohol-site-event` and keep simple event counters in `sessionStorage`. Nothing is transmitted over the network by this mechanism.

## If an external provider is added
Prefer a privacy-oriented deployment with no cross-site profiles and no advertising use. Document the provider in the public data policy before enabling it.
