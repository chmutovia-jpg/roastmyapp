import {
  analysisDepthLabels,
  roastModeLabels,
  stageLabels,
  type ClarificationMessage,
  type RoastInput,
} from "../types/roast";
import { calculateInputQuality } from "./calculateInputQuality";

const safe = (value?: string) => value?.trim() || "не указано";

const depthRules = {
  fast: "Короткий практичный разбор. Меньше текста, максимум конкретных действий.",
  deep: "Больше анализа слабых мест: UX, оффер, доверие, монетизация, структура MVP.",
  launch:
    "Фокус на запуск: Threads-посты, первый оффер, первые пользователи, публичный угол проекта.",
};

function formatClarificationHistory(history?: ClarificationMessage[]): string {
  if (!history?.length) return "нет";

  return history
    .slice(-8)
    .map((message, index) => {
      const role = message.role === "assistant" ? "assistant" : "user";
      return `${index + 1}. ${role}: ${message.text.trim()}`;
    })
    .join("\n");
}

export function buildRoastPrompt(input: RoastInput): string {
  const quality = calculateInputQuality(input);
  const projectName = safe(input.projectName);
  const source = input.source || "user";

  return `Ты — эксперт по AI-продуктам, UX, лендингам, indie hacking и запуску MVP в соцсетях.

Твоя задача — честно разобрать проект пользователя.
Не будь корпоративным консультантом.
Пиши понятно, живо, конкретно.
Тон зависит от выбранного режима.

USER PROJECT CONTEXT:

Project name:
${projectName}

Idea description:
${safe(input.ideaDescription)}

Landing / offer text:
${safe(input.landingText)}

Target audience:
${safe(input.targetAudience)}

Desired action:
${safe(input.desiredAction)}

Price:
${safe(input.price)}

Stage:
${stageLabels[input.stage]} (${input.stage})

Roast mode:
${roastModeLabels[input.roastMode]} (${input.roastMode})

Analysis depth:
${analysisDepthLabels[input.analysisDepth]} (${input.analysisDepth})

Additional context:
${safe(input.additionalContext)}

User counterargument:
${safe(input.userCounterArgument)}

Clarification history:
${formatClarificationHistory(input.clarificationHistory)}

Screenshot provided:
${input.screenshotBase64 ? "yes" : "no"}

Source:
${source}

Input quality:
- score: ${quality.score}/100
- level: ${quality.level}
- missing: ${quality.missing.length ? quality.missing.join(", ") : "ничего критичного"}

Режимы:
- mentor: честно, спокойно, поддерживающе
- investor: жестко, через бизнес, деньги, рынок, удержание
- tired_user: от лица обычного уставшего пользователя, который не хочет разбираться
- threads_bro: живо, с самоиронией, как посты в Threads
- codex_reviewer: фокус на UX, функциях, интерфейсе, структуре MVP

Правило глубины:
${depthRules[input.analysisDepth]}

СТРОГИЕ ПРАВИЛА:
- Анализируй только проект из USER PROJECT CONTEXT.
- Не используй DayPilot, Money Control, StreakTogether или любые демо-проекты, если Source !== "demo".
- Не называй проект другим именем.
- Если Project name пустой или "не указано", используй "Проект без названия". Не подставляй демо-название.
- Если данных мало, не придумывай детали. Скажи, каких данных не хватает, снизь confidence и добавь это в assumptions/questionsToClarify.
- Если пользователь дал User counterargument или Clarification history, пересмотри прошлый вывод и честно укажи, изменилось ли мнение.
- Если AI мог неправильно понять идею, добавь это в misunderstoodRisk.
- Всегда возвращай assumptions — список предположений, на которых построен разбор.
- Всегда возвращай questionsToClarify — 3 вопроса, которые помогут сделать разбор точнее.
- Не делай вид, что видел скриншот, если Screenshot provided: no.
- Если Screenshot provided: yes, можешь упомянуть, что визуальный контекст есть, но не выдумывай детали, которых не видно из текста.
- Не растекайся.
- Не пиши общие советы.
- Каждый совет должен быть применим сегодня.
- Не используй фразы “проведите исследование рынка” без конкретного действия.
- Обязательно дай ровно 3 Threads-поста.
- Посты должны быть короткими, живыми и подходить для человека, который публично собирает AI-продукты.
- Обязательно верни launchPack: Telegram-пост, bio, landing headline и 5 reply comments.
- Launch Pack должен быть shareable и сразу пригоден для запуска, без корпоративного тона.

Верни строго JSON без markdown.

JSON schema:
{
  "projectName": string,
  "score": number,
  "shortVerdict": string,
  "mainProblem": string,
  "firstFix": string,
  "confidence": number,
  "confidenceLabel": string,
  "whyUsersWillNotBuy": string[],
  "weakPoints": {
    "offer": { "score": number, "comment": string },
    "ux": { "score": number, "comment": string },
    "design": { "score": number, "comment": string },
    "value": { "score": number, "comment": string },
    "trust": { "score": number, "comment": string },
    "monetization": { "score": number, "comment": string }
  },
  "twoHourFixes": string[],
  "improvedOffer": {
    "headline": string,
    "subheadline": string,
    "cta": string,
    "shortDescription": string
  },
  "threadsPosts": [
    {
      "title": string,
      "text": string
    }
  ],
  "nextSprint": {
    "thirtyMinutes": string[],
    "oneHour": string[],
    "twoHours": string[],
    "todayLaunchMove": string
  },
  "launchPack": {
    "telegramPost": string,
    "profileBio": string,
    "landingHeadline": string,
    "replyComments": string[]
  },
  "assumptions": string[],
  "misunderstoodRisk": string[],
  "questionsToClarify": string[],
  "rawFeedback": string,
  "version": number,
  "clarificationCount": number
}

projectName в JSON должен быть ровно: "${projectName === "не указано" ? "Проект без названия" : projectName}".
confidence должен быть от 1 до 100.
version = количество пользовательских уточнений + 1.
clarificationCount = количество пользовательских уточнений.`;
}
