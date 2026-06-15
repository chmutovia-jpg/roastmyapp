# Roast My App AI

AI-сервис, который честно разбирает идею, лендинг или MVP и помогает улучшить оффер, UX и запуск в Threads.

## Запуск

```bash
npm install
npm run dev
```

## Production Readiness

```bash
npm run typecheck
npm run test
npm run build
npm run check
```

`npm run check` запускает typecheck, Vitest и production build.

## Environment

Создайте `.env` локально или переменные окружения на Vercel:

```bash
OPENAI_API_KEY=your_key_here
# optional
OPENAI_MODEL=gpt-5.5
```

Никогда не пушьте настоящий API key в GitHub.

## AI Mode

Frontend вызывает только `/api/analyze-roast`. OpenAI API key читается только на сервере из `process.env.OPENAI_API_KEY`.

API и клиент возвращают:

- `result` — полный `RoastResult`;
- `meta.source = "openai"` — реальный server-side AI response;
- `meta.source = "mock"` — fallback/demo/local analysis;
- `meta.reason` — причина fallback: missing key, timeout, invalid JSON, wrong project context и т.д.

UI показывает compact badge:

- `AI analysis` — реальный OpenAI ответ;
- `Demo analysis` — локальный fallback/mock.

Если AI недоступен, пользователь видит мягкое сообщение: “AI временно недоступен — показан локальный разбор.”

## Reliability

- Backend OpenAI timeout: 25 секунд.
- Client API timeout: 30 секунд.
- При timeout/network/API ошибке возвращается context-aware mock.
- Частичный AI JSON ремонтируется через `repairRoastResult`.
- Если AI подмешал DayPilot/Money Control/StreakTogether в user-анализ, результат чинится или заменяется context-aware mock.
- History не хранит `screenshotBase64`, чтобы не забивать localStorage.
- Corrupted localStorage безопасно сбрасывается.

## Security

- Не храните `OPENAI_API_KEY` на клиенте.
- Не коммитьте `.env`, `.env.local`, `.vercel`.
- GitHub token нельзя хранить в проекте или отправлять в публичные каналы.
- Если ключ или токен утек — сразу rotate/revoke.

## Deploy To Vercel

1. Подключите GitHub repo `chmutovia-jpg/roastmyapp` к Vercel.
2. Добавьте `OPENAI_API_KEY` в Vercel Environment Variables.
3. Опционально добавьте `OPENAI_MODEL`.
4. Deploy.
5. Откройте приложение и запустите custom анализ.
6. Проверьте, что badge показывает `AI analysis`.
7. Уберите ключ или проверьте preview без ключа: badge должен показать `Demo analysis`.

## Troubleshooting

### AI always shows Demo analysis

- Проверьте `OPENAI_API_KEY` в Vercel env.
- Проверьте serverless logs `/api/analyze-roast`.
- Посмотрите `meta.reason` в dev mode.

### API timeout

- Backend режет OpenAI запрос через 25 секунд.
- Client режет запрос к backend через 30 секунд.
- Пользователь получит локальный разбор, приложение не должно зависнуть.

### Invalid JSON fallback

- Если JSON частичный, `repairRoastResult` восстановит результат.
- Если JSON не парсится вообще, API вернет mock с `meta.reason = "invalid_json"`.

### LocalStorage history missing

- History хранит максимум 20 записей.
- Скриншоты намеренно не сохраняются как base64.
- Corrupted storage сбрасывается без crash.

### Build fails

```bash
npm install
npm run check
```

Если ошибка связана с env, убедитесь, что настоящий ключ не попал в frontend-код.
