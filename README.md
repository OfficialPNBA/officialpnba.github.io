# NPBA website

Source for the National Practical Basketball Association website.

- **All league content** (teams, games, media, transactions, Discord/Roblox links) lives in `data/league.mjs`.
- Page templates are in `build.mjs`; styles and browser scripts are in `public/`.
- `npm run build` (Node 18+, no dependencies) generates the static site in `dist/`.
- Every push to `main` builds the site and publishes it with GitHub Pages (`.github/workflows/deploy.yml`).

Content rules: final game scores must be numbers, and tipoff timestamps must include a timezone offset. Standings are calculated from final games.

Moved from ChatGPT Sites on 2026-11-13 (published version 63).
