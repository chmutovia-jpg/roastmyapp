# Roast My App AI

AI-сервис, который честно разбирает идею, лендинг или MVP и помогает улучшить оффер, UX и запуск в Threads.

## Запуск

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Env

Создайте `.env` или переменные окружения на Vercel:

```bash
OPENAI_API_KEY=your_key_here
```

Опционально можно задать модель:

```bash
OPENAI_MODEL=gpt-5.5
```

Никогда не пушьте настоящий API key в GitHub.

## Demo mode

Для локального запуска без ключа работает demo mode. Frontend вызывает только `/api/analyze-roast`; если endpoint или OpenAI API недоступны, приложение возвращает качественный mock-разбор и показывает бейдж `Demo analysis`.

## LocalStorage

MVP хранит данные локально в браузере:

- `roastmyapp.history`
- `roastmyapp.lastDraft`
- `roastmyapp.settings`

## API

Serverless endpoint находится в `api/analyze-roast.ts`. Ключ OpenAI читается только на сервере из `process.env.OPENAI_API_KEY`; клиентский код не содержит API key.
