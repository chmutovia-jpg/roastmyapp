import type { RoastResult, WeakPoint } from "../types/roast";

const weakPointKeys = ["offer", "ux", "design", "value", "trust", "monetization"] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const asStringArray = (value: unknown, minItems = 1): string[] | null => {
  if (!Array.isArray(value)) return null;
  const items = value.map(asString).filter((item): item is string => Boolean(item));
  return items.length >= minItems ? items : null;
};

const asScore = (value: unknown): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(1, Math.min(10, Number(value.toFixed(1))));
};

const asPercent = (value: unknown): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(1, Math.min(100, Math.round(value)));
};

const parseWeakPoint = (value: unknown): WeakPoint | null => {
  if (!isRecord(value)) return null;
  const score = asScore(value.score);
  const comment = asString(value.comment);
  if (score === null || comment === null) return null;
  return { score, comment };
};

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
  const assumptions = asStringArray(value.assumptions, 1) || [
    "Разбор основан на доступном описании проекта.",
  ];
  const misunderstoodRisk = asStringArray(value.misunderstoodRisk, 1) || [
    "Если контекста мало, AI мог неверно понять аудиторию или главный сценарий.",
  ];
  const questionsToClarify = asStringArray(value.questionsToClarify, 1) || [
    "Кто конкретно первый пользователь?",
    "Что он должен сделать за первые 30 секунд?",
    "Почему он заплатит сейчас, а не потом?",
  ];
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
