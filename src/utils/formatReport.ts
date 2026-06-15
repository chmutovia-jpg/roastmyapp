import {
  analysisDepthLabels,
  roastModeLabels,
  stageLabels,
  weakPointLabels,
  type RoastInput,
  type RoastResult,
  type WeakPointKey,
} from "../types/roast";

export function formatThreadsPosts(result: RoastResult): string {
  return result.threadsPosts
    .map((post, index) => `${index + 1}. ${post.title}\n${post.text}`)
    .join("\n\n");
}

export function formatOffer(result: RoastResult): string {
  return [
    `Заголовок: ${result.improvedOffer.headline}`,
    `Подзаголовок: ${result.improvedOffer.subheadline}`,
    `CTA: ${result.improvedOffer.cta}`,
    `Описание: ${result.improvedOffer.shortDescription}`,
  ].join("\n");
}

export function formatFullReport(input: RoastInput, result: RoastResult): string {
  const weakPoints = (Object.entries(result.weakPoints) as [WeakPointKey, RoastResult["weakPoints"][WeakPointKey]][])
    .map(([key, point]) => `- ${weakPointLabels[key]}: ${point.score}/10 — ${point.comment}`)
    .join("\n");

  return [
    `Roast My App AI — ${result.projectName || input.projectName || "Проект без названия"}`,
    `Режим: ${roastModeLabels[input.roastMode]}`,
    `Глубина: ${analysisDepthLabels[input.analysisDepth]}`,
    `Стадия: ${stageLabels[input.stage]}`,
    "",
    `Оценка: ${result.score}/10`,
    result.confidenceLabel ? `Confidence: ${result.confidenceLabel}` : "",
    result.shortVerdict,
    "",
    `Главная проблема: ${result.mainProblem}`,
    result.firstFix ? `Исправить первым: ${result.firstFix}` : "",
    "",
    "На чем основан разбор:",
    result.assumptions.map((item) => `- ${item}`).join("\n"),
    "",
    "Что AI мог понять неправильно:",
    result.misunderstoodRisk.map((item) => `- ${item}`).join("\n"),
    "",
    "Что стоит уточнить:",
    result.questionsToClarify.map((item) => `- ${item}`).join("\n"),
    "",
    "Почему пользователь не купит:",
    result.whyUsersWillNotBuy.map((item) => `- ${item}`).join("\n"),
    "",
    "Что выглядит слабо:",
    weakPoints,
    "",
    "Что исправить за 2 часа:",
    result.twoHourFixes.map((item) => `- ${item}`).join("\n"),
    "",
    "Новый оффер:",
    formatOffer(result),
    "",
    "Threads-посты:",
    formatThreadsPosts(result),
    "",
    "Следующий спринт:",
    `30 минут:\n${result.nextSprint.thirtyMinutes.map((item) => `- ${item}`).join("\n")}`,
    `1 час:\n${result.nextSprint.oneHour.map((item) => `- ${item}`).join("\n")}`,
    `2 часа:\n${result.nextSprint.twoHours.map((item) => `- ${item}`).join("\n")}`,
    `Сегодня запушить: ${result.nextSprint.todayLaunchMove}`,
  ]
    .filter(Boolean)
    .join("\n");
}
