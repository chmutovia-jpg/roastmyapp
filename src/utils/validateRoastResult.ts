import type { RoastInput, RoastResult, WeakPoint, WeakPointKey } from "../types/roast";

const weakPointKeys = ["offer", "ux", "design", "value", "trust", "monetization"] as const;
const demoProjectNames = ["DayPilot", "Money Control", "StreakTogether"];
const badTextPattern = /^(undefined|null|\[object Object\])$/i;
const embeddedBadTextPattern = /\b(undefined|null|\[object Object\])\b/i;

const fallbackWeakComments: Record<WeakPointKey, string> = {
  offer: "Оффер нужно привязать к конкретной боли, результату и следующему действию.",
  ux: "UX должен быстрее вести человека к первому понятному результату.",
  design: "Дизайн должен поддерживать главный тезис, а не отвлекать от него.",
  value: "Ценность нужно объяснить через сценарий пользователя, а не через набор функций.",
  trust: "Не хватает доказательств: пример результата, до/после, отзыв или честный build-log.",
  monetization: "Монетизацию нужно связать с понятным выигрышем для пользователя.",
};

const weakPointLabels: Record<WeakPointKey, string> = {
  offer: "оффер",
  ux: "UX",
  design: "дизайн",
  value: "ценность",
  trust: "доверие",
  monetization: "монетизация",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const asStringArray = (value: unknown, minItems = 1): string[] | null => {
  if (!Array.isArray(value)) return null;
  const items = value.map(asString).filter((item): item is string => Boolean(item));
  return items.length >= minItems ? items : null;
};

const asScore = (value: unknown): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return clamp(Number(value.toFixed(1)), 1, 10);
};

const asPercent = (value: unknown): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return clamp(Math.round(value), 1, 100);
};

const parseWeakPoint = (value: unknown): WeakPoint | null => {
  if (!isRecord(value)) return null;
  const score = asScore(value.score);
  const comment = asString(value.comment);
  if (score === null || comment === null) return null;
  return { score, comment };
};

function fallbackProjectName(input: RoastInput) {
  return input.projectName.trim() || "Проект без названия";
}

function safeText(value: unknown, fallback: string, maxLength = 520) {
  const raw = typeof value === "string" ? value.trim() : "";
  const text = raw && !badTextPattern.test(raw) && !embeddedBadTextPattern.test(raw) ? raw : fallback;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}…` : text;
}

function repairProjectName(value: unknown, input: RoastInput) {
  const expected = fallbackProjectName(input);
  const name = safeText(value, expected, 90);

  if (input.source !== "demo" && demoProjectNames.includes(name) && name !== expected) {
    return expected;
  }

  return name;
}

function repairScore(value: unknown, fallback = 5) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return clamp(Number(value.toFixed(1)), 0, 10);
}

function repairPercent(value: unknown, fallback = 56) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return clamp(Math.round(value), 1, 100);
}

function repairArray(value: unknown, fallback: string[], minItems: number, maxItems = 8) {
  const items = Array.isArray(value)
    ? value
        .map((item, index) => safeText(item, fallback[index] || fallback[0] || "Уточнить контекст.", 420))
        .filter(Boolean)
    : [];

  const next = [...items];
  for (const item of fallback) {
    if (next.length >= minItems) break;
    next.push(item);
  }

  return next.slice(0, maxItems);
}

function repairWeakPoint(value: unknown, key: WeakPointKey): WeakPoint {
  if (isRecord(value)) {
    return {
      score: repairScore(value.score, 5) || 1,
      comment: safeText(value.comment, fallbackWeakComments[key], 360),
    };
  }

  return {
    score: 5,
    comment: fallbackWeakComments[key],
  };
}

function repairThreadsPosts(value: unknown, projectName: string): RoastResult["threadsPosts"] {
  const fallback = [
    {
      title: "Я сделал...",
      text: `Собрал ${projectName} и снова уперся в базу: людям не нужна еще одна AI-фича, им нужен понятный первый результат.`,
    },
    {
      title: "Фейл / самоирония",
      text: `Поймал себя на том, что объясняю ${projectName} через функции. Переписываю через боль, пример и один нормальный CTA.`,
    },
    {
      title: "Полезная мысль",
      text: "Если пользователь за 5 секунд понял только технологию, оффер еще не готов. Нужно показать, где ему станет легче.",
    },
  ];

  const posts = Array.isArray(value)
    ? value
        .map((post, index) => {
          if (!isRecord(post)) return null;
          return {
            title: safeText(post.title, fallback[index]?.title || `Пост ${index + 1}`, 80),
            text: safeText(post.text, fallback[index]?.text || fallback[0].text, 420),
          };
        })
        .filter((post): post is RoastResult["threadsPosts"][number] => Boolean(post))
    : [];

  return [...posts, ...fallback].slice(0, 3);
}

function repairLaunchPack(
  value: unknown,
  projectName: string,
  resultBits: {
    headline: string;
    subheadline: string;
    mainProblem: string;
  },
): NonNullable<RoastResult["launchPack"]> {
  const record = isRecord(value) ? value : {};
  const replyComments = repairArray(
    record.replyComments,
    [
      "Да, сейчас проверяю, что люди понимают идею за первые 5 секунд.",
      "Главная правка после разбора — меньше фич, больше результата.",
      "Собираю раннюю обратную связь, чтобы не строить в пустоту.",
      "Пока цель простая: сделать оффер понятным без объяснений.",
      "Спасибо, это помогает понять, где упаковка еще слабая.",
    ],
    5,
    5,
  );

  return {
    telegramPost: safeText(
      record.telegramPost,
      `Запустил ${projectName}. Сейчас докручиваю упаковку: главная проблема — ${resultBits.mainProblem}`,
      520,
    ),
    profileBio: safeText(
      record.profileBio,
      `${projectName}: ${resultBits.subheadline}`,
      220,
    ),
    landingHeadline: safeText(record.landingHeadline, resultBits.headline, 140),
    replyComments,
  };
}

function resultText(result: RoastResult) {
  return [
    result.projectName,
    result.shortVerdict,
    result.mainProblem,
    result.firstFix,
    result.improvedOffer.headline,
    result.improvedOffer.subheadline,
    result.improvedOffer.shortDescription,
    result.rawFeedback,
    ...result.whyUsersWillNotBuy,
    ...result.twoHourFixes,
    ...result.assumptions,
    ...result.misunderstoodRisk,
    ...result.questionsToClarify,
    ...result.threadsPosts.map((post) => `${post.title} ${post.text}`),
  ].join(" ");
}

export function isResultAboutUserProject(result: RoastResult, input: RoastInput): boolean {
  const expectedName = fallbackProjectName(input);

  if (input.projectName.trim() && result.projectName.trim() !== expectedName) {
    return false;
  }

  if (input.source === "demo") return true;

  const text = resultText(result);
  return !demoProjectNames.some(
    (name) => name !== expectedName && new RegExp(`\\b${name}\\b`, "i").test(text),
  );
}

export function repairRoastResult(raw: unknown, input: RoastInput): RoastResult {
  const value = isRecord(raw) ? raw : {};
  const projectName = repairProjectName(value.projectName, input);
  const context =
    input.userCounterArgument?.trim() ||
    input.additionalContext?.trim() ||
    input.ideaDescription.trim() ||
    input.landingText.trim() ||
    "контекста мало";
  const contextShort = context.length > 160 ? `${context.slice(0, 159).trim()}…` : context;
  const confidence = repairPercent(value.confidence, input.ideaDescription.trim() ? 58 : 42);

  const improvedOffer = isRecord(value.improvedOffer) ? value.improvedOffer : {};
  const nextSprint = isRecord(value.nextSprint) ? value.nextSprint : {};
  const weakPoints = isRecord(value.weakPoints) ? value.weakPoints : {};

  const repairedImprovedOffer = {
    headline: safeText(improvedOffer.headline, `${projectName}: понятный результат без лишнего шума`, 140),
    subheadline: safeText(
      improvedOffer.subheadline,
      `Покажи, кому помогает ${projectName}, какую боль снимает и что пользователь увидит первым.`,
      260,
    ),
    cta: safeText(improvedOffer.cta, input.desiredAction.trim() || "Попробовать", 80),
    shortDescription: safeText(
      improvedOffer.shortDescription,
      "Сделай оффер конкретнее: один пользователь, один сценарий, один результат, одно действие.",
      360,
    ),
  };
  const mainProblem = safeText(
    value.mainProblem,
    `Главная проблема сейчас: по контексту “${contextShort}” не до конца ясно, кому станет легче и почему человек должен действовать сразу.`,
  );

  return {
    projectName,
    score: repairScore(value.score, 5),
    shortVerdict: safeText(
      value.shortVerdict,
      `${projectName} можно разобрать, но точность зависит от того, насколько ясно описаны аудитория, оффер и первый результат.`,
    ),
    mainProblem,
    firstFix: safeText(
      value.firstFix,
      "Переписать первый экран: кто пользователь, какая боль, какой первый результат и один конкретный CTA.",
    ),
    confidence,
    confidenceLabel: safeText(
      value.confidenceLabel,
      `${confidence}% — результат восстановлен из частичного ответа AI`,
      180,
    ),
    whyUsersWillNotBuy: repairArray(
      value.whyUsersWillNotBuy,
      [
        "Не видно достаточно быстро, какой конкретный результат человек получит.",
        "Оффер пока требует слишком много самостоятельной расшифровки.",
        "Не хватает доказательства: пример результата, до/после или короткое демо.",
      ],
      3,
      5,
    ),
    weakPoints: {
      offer: repairWeakPoint(weakPoints.offer, "offer"),
      ux: repairWeakPoint(weakPoints.ux, "ux"),
      design: repairWeakPoint(weakPoints.design, "design"),
      value: repairWeakPoint(weakPoints.value, "value"),
      trust: repairWeakPoint(weakPoints.trust, "trust"),
      monetization: repairWeakPoint(weakPoints.monetization, "monetization"),
    },
    twoHourFixes: repairArray(
      value.twoHourFixes,
      [
        "Переписать H1 через боль и результат.",
        "Добавить пример результата рядом с CTA.",
        "Сузить аудиторию до одного первого сегмента.",
        "Убрать общие фразы и оставить один следующий шаг.",
      ],
      4,
      8,
    ),
    improvedOffer: repairedImprovedOffer,
    threadsPosts: repairThreadsPosts(value.threadsPosts, projectName),
    launchPack: repairLaunchPack(value.launchPack, projectName, {
      headline: repairedImprovedOffer.headline,
      subheadline: repairedImprovedOffer.subheadline,
      mainProblem,
    }),
    nextSprint: {
      thirtyMinutes: repairArray(
        nextSprint.thirtyMinutes,
        ["Выбрать один главный сценарий.", "Написать новый H1 и CTA."],
        1,
        4,
      ),
      oneHour: repairArray(
        nextSprint.oneHour,
        ["Добавить пример результата.", "Проверить первый экран на 5-секундном тесте."],
        1,
        4,
      ),
      twoHours: repairArray(
        nextSprint.twoHours,
        ["Собрать блок до/после.", "Опубликовать короткий build-in-public пост."],
        1,
        4,
      ),
      todayLaunchMove: safeText(
        nextSprint.todayLaunchMove,
        `Запушить более ясный первый экран ${projectName} и попросить 5 человек сказать, что они поняли за 5 секунд.`,
      ),
    },
    assumptions: repairArray(
      value.assumptions,
      [
        `Я разбираю именно ${projectName}.`,
        input.screenshotBase64 || input.hasScreenshot
          ? "Скриншот был приложен, но в истории он может не храниться."
          : "Скриншот не приложен, поэтому визуальная оценка ограничена.",
      ],
      1,
      6,
    ),
    misunderstoodRisk: repairArray(
      value.misunderstoodRisk,
      ["AI мог неверно понять аудиторию или главный сценарий, если контекста было мало."],
      1,
      5,
    ),
    questionsToClarify: repairArray(
      value.questionsToClarify,
      [
        "Кто конкретно первый пользователь?",
        "Что он должен сделать за первые 30 секунд?",
        "Почему он заплатит или зарегистрируется сейчас?",
      ],
      3,
      3,
    ),
    rawFeedback: safeText(value.rawFeedback, "AI result repaired from partial payload.", 800),
    version:
      typeof value.version === "number" && Number.isFinite(value.version)
        ? Math.max(1, Math.round(value.version))
        : Math.max(1, (input.clarificationHistory?.filter((message) => message.role === "user").length || 0) + 1),
    refinedFromId: safeText(value.refinedFromId, "", 120) || undefined,
    clarificationCount:
      typeof value.clarificationCount === "number" && Number.isFinite(value.clarificationCount)
        ? Math.max(0, Math.round(value.clarificationCount))
        : input.clarificationHistory?.filter((message) => message.role === "user").length || 0,
  };
}

export function validateRoastResult(value: unknown): RoastResult | null {
  if (!isRecord(value)) return null;

  const projectName = asString(value.projectName) || "Проект без названия";
  const score = asScore(value.score);
  const shortVerdict = asString(value.shortVerdict);
  const mainProblem = asString(value.mainProblem);
  const firstFix = asString(value.firstFix);
  const confidence = asPercent(value.confidence);
  const confidenceLabel = asString(value.confidenceLabel);
  const whyUsersWillNotBuy = asStringArray(value.whyUsersWillNotBuy, 3);
  const twoHourFixes = asStringArray(value.twoHourFixes, 3);
  const assumptions = asStringArray(value.assumptions, 1);
  const misunderstoodRisk = asStringArray(value.misunderstoodRisk, 1);
  const questionsToClarify = asStringArray(value.questionsToClarify, 3);
  const rawFeedback = asString(value.rawFeedback);
  const version =
    typeof value.version === "number" && Number.isFinite(value.version)
      ? Math.max(1, Math.round(value.version))
      : undefined;
  const refinedFromId = asString(value.refinedFromId);
  const clarificationCount =
    typeof value.clarificationCount === "number" && Number.isFinite(value.clarificationCount)
      ? Math.max(0, Math.round(value.clarificationCount))
      : undefined;

  if (
    score === null ||
    shortVerdict === null ||
    mainProblem === null ||
    whyUsersWillNotBuy === null ||
    twoHourFixes === null ||
    assumptions === null ||
    misunderstoodRisk === null ||
    questionsToClarify === null ||
    rawFeedback === null
  ) {
    return null;
  }

  if (!isRecord(value.weakPoints)) return null;
  const weakPointRecord = value.weakPoints;
  const parsedWeakPoints = {} as RoastResult["weakPoints"];

  for (const key of weakPointKeys) {
    const weakPoint = parseWeakPoint(weakPointRecord[key]);
    if (!weakPoint) return null;
    parsedWeakPoints[key] = weakPoint;
  }

  if (!isRecord(value.improvedOffer)) return null;
  const headline = asString(value.improvedOffer.headline);
  const subheadline = asString(value.improvedOffer.subheadline);
  const cta = asString(value.improvedOffer.cta);
  const shortDescription = asString(value.improvedOffer.shortDescription);

  if ([headline, subheadline, cta, shortDescription].some((item) => item === null)) {
    return null;
  }

  if (!Array.isArray(value.threadsPosts)) return null;
  const threadsPosts = value.threadsPosts
    .map((post) => {
      if (!isRecord(post)) return null;
      const title = asString(post.title);
      const text = asString(post.text);
      return title && text ? { title, text } : null;
    })
    .filter((post): post is RoastResult["threadsPosts"][number] => Boolean(post))
    .slice(0, 3);

  if (threadsPosts.length !== 3) return null;

  const launchPack = isRecord(value.launchPack)
    ? repairLaunchPack(value.launchPack, projectName, {
        headline: headline || `${projectName}: понятный результат`,
        subheadline: subheadline || "Понятный оффер и следующий шаг.",
        mainProblem,
      })
    : null;

  if (!launchPack) return null;

  if (!isRecord(value.nextSprint)) return null;
  const thirtyMinutes = asStringArray(value.nextSprint.thirtyMinutes, 1);
  const oneHour = asStringArray(value.nextSprint.oneHour, 1);
  const twoHours = asStringArray(value.nextSprint.twoHours, 1);
  const todayLaunchMove = asString(value.nextSprint.todayLaunchMove);

  if (!thirtyMinutes || !oneHour || !twoHours || !todayLaunchMove) return null;

  return {
    projectName,
    score,
    shortVerdict,
    mainProblem,
    ...(firstFix ? { firstFix } : {}),
    ...(confidence !== null ? { confidence } : {}),
    ...(confidenceLabel ? { confidenceLabel } : {}),
    whyUsersWillNotBuy,
    weakPoints: parsedWeakPoints,
    twoHourFixes,
    improvedOffer: {
      headline: headline as string,
      subheadline: subheadline as string,
      cta: cta as string,
      shortDescription: shortDescription as string,
    },
    launchPack,
    threadsPosts,
    nextSprint: {
      thirtyMinutes,
      oneHour,
      twoHours,
      todayLaunchMove,
    },
    assumptions,
    misunderstoodRisk,
    questionsToClarify,
    rawFeedback,
    ...(version ? { version } : {}),
    ...(refinedFromId ? { refinedFromId } : {}),
    ...(clarificationCount !== undefined ? { clarificationCount } : {}),
  };
}
