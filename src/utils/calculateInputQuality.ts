import type { RoastInput } from "../types/roast";

export type InputQuality = {
  score: number;
  level: "weak" | "normal" | "strong";
  missing: string[];
  suggestions: string[];
};

export function calculateInputQuality(input: RoastInput): InputQuality {
  let score = 0;
  const missing: string[] = [];
  const suggestions: string[] = [];

  if (input.projectName.trim()) score += 10;
  else missing.push("название проекта");

  if (input.ideaDescription.trim().length > 80) score += 25;
  else {
    missing.push("описание идеи");
    suggestions.push("Добавь 2-3 предложения про идею");
  }

  if (input.landingText.trim().length > 80) score += 20;
  else {
    missing.push("текст первого экрана");
    suggestions.push("Вставь текст первого экрана или оффер");
  }

  if (input.targetAudience.trim()) score += 15;
  else {
    missing.push("целевая аудитория");
    suggestions.push("Добавь, кому ты это продаешь");
  }

  if (input.desiredAction.trim()) score += 15;
  else {
    missing.push("целевое действие");
    suggestions.push("Добавь, что человек должен сделать после просмотра");
  }

  if (input.stage) score += 10;

  if (input.screenshotBase64) score += 15;
  else suggestions.push("Добавь скрин или мок результата");

  if (!input.price.trim()) {
    suggestions.push("Цена поможет проверить монетизацию");
  }

  const normalized = Math.min(100, score);
  const level = normalized < 40 ? "weak" : normalized < 75 ? "normal" : "strong";

  return {
    score: normalized,
    level,
    missing: [...new Set(missing)],
    suggestions: [...new Set(suggestions)].slice(0, 4),
  };
}

export function getInputQualityCopy(level: InputQuality["level"]): string {
  if (level === "weak") {
    return "Пока мало контекста. Разнести можно, но попадание будет слабее.";
  }

  if (level === "strong") {
    return "Сигнала достаточно. AI сможет пройтись по офферу, UX и запуску.";
  }

  return "Нормальная идея. Упаковку уже можно проверить без церемоний.";
}

export function getInputQualityTitle(level: InputQuality["level"]): string {
  if (level === "weak") return "Сигнала мало";
  if (level === "strong") return "Сигнала достаточно для жесткого разбора";
  return "Нормально, уже можно разносить";
}
