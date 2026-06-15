# Smoke Test — Roast My App AI

## Before Deploy

- [ ] `npm install`
- [ ] `npm run check`
- [ ] `npm run build`

## Manual Smoke

1. Open Home.
2. Click “Разнести проект”.
3. Enter custom project “PetCoach”.
4. Analyze in mock mode.
5. Confirm result is about PetCoach, not DayPilot.
6. Select all roast modes.
7. Select all analysis depths.
8. Add clarification/counterargument.
9. Confirm v2/refined result uses clarification.
10. Save result.
11. Open History.
12. Confirm screenshot is not stored as base64 in history.
13. Copy full report.
14. Copy Threads posts.
15. Check mobile 390px.
16. Check console has no red errors.
17. Deploy on Vercel with `OPENAI_API_KEY`.
18. Confirm source badge says `AI analysis`.
19. Remove/disable key and confirm fallback says `Demo analysis`.

## Vercel Real AI Check

- [ ] `OPENAI_API_KEY` exists only in Vercel env.
- [ ] `/api/analyze-roast` returns `{ result, meta }`.
- [ ] `meta.source === "openai"` when OpenAI succeeds.
- [ ] `meta.source === "mock"` when key is missing, API fails, or timeout happens.
- [ ] No API key appears in client bundle, console, logs, or repository.
