import {
  DEMO_MARKER,
  MOCK_MARKER,
  type AnalysisDepth,
  type RoastInput,
  type RoastMode,
  type RoastResult,
} from "../types/roast";
import { calculateInputQuality } from "../utils/calculateInputQuality";
import { getResultConfidence } from "../utils/getResultConfidence";

type ModeCopy = {
  scoreShift: number;
  rawTone: string;
  lens: string;
};

const modeCopy: Record<RoastMode, ModeCopy> = {
  mentor: {
    scoreShift: 0.4,
    rawTone: "Мягкий честный разбор без попытки добить автора.",
    lens: "разобрать спокойно и показать следующий полезный шаг",
  },
  investor: {
    scoreShift: -0.6,
    rawTone: "Инвесторский режим: меньше нежности, больше денег и удержания.",
    lens: "проверить сегмент, готовность платить и повторяемость боли",
  },
  tired_user: {
    scoreShift: -0.2,
    rawTone: "Разбор от лица человека, который уже устал от лендингов.",
    lens: "понять, почему обычный человек закроет страницу за 5 секунд",
  },
  threads_bro: {
    scoreShift: 0.1,
    rawTone: "Threads-режим: живо, коротко, с самоиронией.",
    lens: "найти публичный угол, конфликт и короткий launch-пост",
  },
  codex_reviewer: {
    scoreShift: 0,
    rawTone: "Codex-review режим: UX, структура, состояния, первый запуск.",
    lens: "проверить первый пользовательский сценарий и структуру MVP",
  },
};

const depthCopy: Record<AnalysisDepth, { scoreShift: number; raw: string }> = {
  fast: {
    scoreShift: 0,
    raw: "Fast roast: короткий практичный разбор.",
  },
  deep: {
    scoreShift: -0.1,
    raw: "Deep audit: больше фокуса на UX, оффер и монетизацию.",
  },
  launch: {
    scoreShift: 0.2,
    raw: "Launch review: больше фокуса на Threads и первых пользователях.",
  },
};

const clampScore = (score: number) => Math.max(1, Math.min(10, Number(score.toFixed(1))));
const clean = (value?: string) => value?.trim() || "";

function makeIdSafeProjectName(input: RoastInput) {
  const projectName = clean(input.projectName);
  if (projectName) return projectName;
  return "Проект без названия";
}

function shorten(value: string, max = 170) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}…`;
}

function firstMeaningfulContext(input: RoastInput) {
  const context =
    clean(input.userCounterArgument) ||
    clean(input.additionalContext) ||
    clean(input.ideaDescription) ||
    clean(input.landingText) ||
    clean(input.targetAudience);

  return context ? shorten(context) : "контекста пока почти нет";
}

function hasUserMentioned(input: RoastInput, pattern: RegExp) {
  return [
    input.projectName,
    input.ideaDescription,
    input.landingText,
    input.targetAudience,
    input.desiredAction,
    input.price,
    input.additionalContext,
    input.userCounterArgument,
    ...(input.clarificationHistory || []).map((message) => message.text),
  ]
    .filter(Boolean)
    .join(" ")
    .match(pattern);
}

function buildAssumptions(input: RoastInput, projectName: string): string[] {
  const assumptions = [
    `Я разбираю именно ${projectName}, а не демо-проект.`,
  ];

  if (input.targetAudience.trim()) {
    assumptions.push(`Основная аудитория: ${input.targetAudience.trim()}.`);
  } else {
    assumptions.push("Целевая аудитория не описана, поэтому выводы по покупке менее точные.");
  }

  if (input.desiredAction.trim()) {
    assumptions.push(`Главное действие пользователя: ${input.desiredAction.trim()}.`);
  } else {
    assumptions.push("Желаемое действие пользователя не указано, поэтому CTA оценивается по общему смыслу.");
  }

  if (input.screenshotBase64) {
    assumptions.push("Скриншот был приложен, но mock-анализ не распознает визуальные детали как настоящий vision-модель.");
  } else {
    assumptions.push("Скриншот не приложен, поэтому визуальный UI оценивается только по текстовому описанию.");
  }

  if (input.additionalContext || input.userCounterArgument) {
    assumptions.push("Последнее уточнение пользователя имеет приоритет над первичным выводом.");
  }

  return assumptions.slice(0, 5);
}

function buildMisunderstoodRisk(input: RoastInput): string[] {
  const risks: string[] = [];

  if (!input.targetAudience.trim()) {
    risks.push("AI мог неверно понять, кто первый покупатель или пользователь.");
  }

  if (!input.desiredAction.trim()) {
    risks.push("AI мог неверно выбрать главный CTA, потому что целевое действие не указано.");
  }

  if (!input.landingText.trim() && !input.screenshotBase64) {
    risks.push("Без текста первого экрана или скрина оценка UX и оффера может быть слишком общей.");
  }

  if (input.userCounterArgument?.trim()) {
    risks.push("Предыдущий вывод пересмотрен с учетом возражения, но часть деталей все еще может требовать проверки.");
  }

  return risks.length
    ? risks
    : ["Риск непонимания низкий: есть достаточно контекста про идею, аудиторию и следующий шаг."];
}

function buildQuestions(input: RoastInput): string[] {
  return [
    input.targetAudience.trim()
      ? `Какой самый узкий сегмент внутри “${input.targetAudience.trim()}” должен попробовать продукт первым?`
      : "Кто конкретно первый пользователь: профессия, ситуация, боль?",
    input.desiredAction.trim()
      ? `Что должно убедить человека выполнить действие “${input.desiredAction.trim()}” прямо сейчас?`
      : "Что человек должен сделать за первые 30 секунд после просмотра?",
    input.price.trim()
      ? `Почему пользователь согласится на цену “${input.price.trim()}” до того, как продукт стал привычкой?`
      : "Это платный продукт, ранний доступ или бесплатный тест? Как ты проверишь готовность платить?",
  ];
}

function buildFirstFix(input: RoastInput, contextSummary: string) {
  if (!input.ideaDescription.trim() && !input.landingText.trim()) {
    return "Добавить 3 предложения: для кого продукт, какую боль снимает и какой результат человек увидит первым.";
  }

  if (input.userCounterArgument?.trim() || input.additionalContext?.trim()) {
    return "Переписать первый экран так, чтобы новое уточнение стало главным обещанием, а не сноской.";
  }

  if (!input.targetAudience.trim()) {
    return `Сузить аудиторию для идеи “${contextSummary}” до одного конкретного сегмента.`;
  }

  if (!input.desiredAction.trim()) {
    return "Сформулировать один конкретный CTA: регистрация, waitlist, покупка, демо или сообщение.";
  }

  return "Переписать первый экран в формате: боль аудитории + видимый результат + один конкретный CTA.";
}

function buildVerdict(input: RoastInput, projectName: string, contextSummary: string, qualityLevel: string) {
  if (qualityLevel === "weak") {
    return `${projectName} пока можно разобрать только грубо: видно направление “${contextSummary}”, но данных мало для точного вердикта.`;
  }

  if (input.userCounterArgument?.trim()) {
    return `С учетом уточнения ${projectName} звучит иначе: проблема не в самой идее, а в том, что первый оффер должен отражать этот новый контекст.`;
  }

  if (input.roastMode === "investor") {
    return `${projectName} может быть полезным, но как бизнес пока должен доказать сегмент, частоту боли и причину платить.`;
  }

  if (input.roastMode === "threads_bro") {
    return `${projectName} уже можно упаковать в публичную историю, но нужен более резкий угол: боль, фейл, результат.`;
  }

  return `${projectName} выглядит живым, но сейчас ценность нужно объяснять через конкретный результат, а не через набор возможностей.`;
}

function buildMainProblem(input: RoastInput, contextSummary: string) {
  if (!input.ideaDescription.trim() && !input.landingText.trim()) {
    return "Сейчас почти нет материала для честного разбора: AI видит название или обрывок, но не видит боль, аудиторию и обещанный результат.";
  }

  if (input.userCounterArgument?.trim()) {
    return `Первичный вывод мог не попасть: новое уточнение “${shorten(input.userCounterArgument, 140)}” меняет рамку анализа, поэтому оффер нужно пересобрать вокруг этой мысли.`;
  }

  if (!input.targetAudience.trim()) {
    return `Проект описан как “${contextSummary}”, но неясно, кто должен почувствовать боль достаточно сильно, чтобы кликнуть или заплатить.`;
  }

  if (!input.desiredAction.trim()) {
    return "Пользователь может понять идею, но не понять следующий шаг: что именно сделать после первого экрана.";
  }

  return `Ты уже описал “${contextSummary}”, но офферу нужно быстрее показать: кому станет легче, в какой ситуации и что человек увидит первым.`;
}

function buildImprovedOffer(input: RoastInput, projectName: string, contextSummary: string) {
  const audience = clean(input.targetAudience);
  const action = clean(input.desiredAction) || "Попробовать разбор";
  const price = clean(input.price);

  const telegramAngle = hasUserMentioned(input, /telegram|телеграм|бот/i);
  const dogsAngle = hasUserMentioned(input, /собак|собак[аиуы]?|dog|dogs|питомц/i);
  const burnoutAngle = hasUserMentioned(input, /выгоран|тревог|burnout|anxiety/i);

  let headline = `${projectName}: понятный результат без лишнего шума`;
  let subheadline = audience
    ? `Для ${audience}: покажи боль, первый результат и действие, которое не требует долгих объяснений.`
    : `Для конкретной аудитории: покажи боль, первый результат и действие, которое не требует долгих объяснений.`;

  if (telegramAngle) {
    headline = `${projectName}: Telegram-бот, который ведет новичка к первому понятному шагу`;
    subheadline = "Не еще один SaaS-кабинет, а короткий диалог: человек пишет проблему и сразу получает следующий шаг без обучения интерфейсу.";
  } else if (dogsAngle) {
    headline = `${projectName}: тренировки для собаки без хаоса и догадок`;
    subheadline = audience
      ? `Для ${audience}: понятный план команд, маленькие задания и прогресс, который видно уже сегодня.`
      : "Понятный план команд, маленькие задания и прогресс, который видно уже сегодня.";
  } else if (burnoutAngle) {
    headline = `${projectName}: план дня для людей, которым сейчас не нужен еще один список задач`;
    subheadline = "Фокус не на скорости, а на снижении тревоги: меньше решений, мягкий порядок и один следующий шаг.";
  }

  return {
    headline,
    subheadline,
    cta: action,
    shortDescription: price
      ? `Упакуй продукт вокруг результата и честно объясни, почему “${price}” стоит платить именно за этот результат.`
      : `Упакуй продукт вокруг результата “${contextSummary}” и покажи, что человек получит до регистрации или оплаты.`,
  };
}

function buildLaunchPack(
  projectName: string,
  contextSummary: string,
  improvedOffer: RoastResult["improvedOffer"],
): NonNullable<RoastResult["launchPack"]> {
  return {
    telegramPost: `Запустил ${projectName}. Это пока ранняя версия, но уже понятно главное: проект должен не звучать умно, а быстро показывать пользу. Сейчас переписываю оффер вокруг результата: ${improvedOffer.headline}`,
    profileBio: `${projectName} помогает превратить идею “${contextSummary}” в понятный первый результат и следующий шаг.`,
    landingHeadline: improvedOffer.headline,
    replyComments: [
      "Да, сейчас как раз проверяю, что люди понимают за первые 5 секунд.",
      "Главная правка после разбора — меньше фич, больше результата на первом экране.",
      "Собираю раннюю обратную связь, чтобы не строить красивую штуку в пустоту.",
      "Если коротко: перепаковываю оффер так, чтобы было ясно, кому и зачем.",
      "Спасибо, это как раз тот тип реакции, который помогает докрутить запуск.",
    ],
  };
}

export function createContextAwareMockResult(input: RoastInput): RoastResult {
  const mode = modeCopy[input.roastMode];
  const depth = depthCopy[input.analysisDepth || "fast"];
  const quality = calculateInputQuality(input);
  const confidence = getResultConfidence(input);
  const projectName = makeIdSafeProjectName(input);
  const contextSummary = firstMeaningfulContext(input);
  const source = input.source || "user";
  const clarificationCount = input.clarificationHistory?.filter((message) => message.role === "user").length || 0;
  const version = Math.max(1, clarificationCount + 1);

  const hasLanding = input.landingText.trim().length > 80;
  const hasAudience = input.targetAudience.trim().length > 5;
  const hasPrice = input.price.trim().length > 0;
  const hasScreenshot = Boolean(input.screenshotBase64);

  const baseScore =
    5.7 +
    (hasLanding ? 0.4 : -0.25) +
    (hasAudience ? 0.5 : -0.55) +
    (hasPrice ? 0.2 : -0.3) +
    (hasScreenshot ? 0.25 : 0) +
    mode.scoreShift +
    depth.scoreShift +
    (quality.level === "weak" ? -0.55 : quality.level === "strong" ? 0.25 : 0);

  const score = clampScore(baseScore);
  const firstFix = buildFirstFix(input, contextSummary);
  const improvedOffer = buildImprovedOffer(input, projectName, contextSummary);
  const launchPack = buildLaunchPack(projectName, contextSummary, improvedOffer);
  const assumptions = buildAssumptions(input, projectName);
  const misunderstoodRisk = buildMisunderstoodRisk(input);
  const questionsToClarify = buildQuestions(input);

  const weakContextCopy =
    quality.level === "weak"
      ? "Сигнала мало: этот вывод намеренно осторожный и просит уточнить аудиторию, действие и оффер."
      : "Контекста достаточно для MVP-разбора, но точность вырастет от реального скрина и примера первого результата.";

  const rawMarkers = [MOCK_MARKER, source === "demo" ? DEMO_MARKER : ""].filter(Boolean).join(" ");

  return {
    projectName,
    score,
    shortVerdict: buildVerdict(input, projectName, contextSummary, quality.level),
    mainProblem: buildMainProblem(input, contextSummary),
    firstFix,
    confidence: confidence.confidence,
    confidenceLabel: confidence.confidenceLabel,
    whyUsersWillNotBuy: [
      `Не видно достаточно быстро, какой конкретный результат ${projectName} даст по сценарию “${contextSummary}”.`,
      hasAudience
        ? `Аудитория “${input.targetAudience.trim()}” названа, но ей нужно показать узнаваемый момент боли, а не только описание продукта.`
        : "Аудитория не названа, поэтому пользователь не понимает, почему это именно для него.",
      input.desiredAction.trim()
        ? `Действие “${input.desiredAction.trim()}” нужно заслужить примером результата до CTA.`
        : "Не указан следующий шаг, поэтому даже заинтересованный человек может закрыть страницу без действия.",
      hasPrice
        ? `Цена “${input.price.trim()}” пока не привязана к измеримому выигрышу для пользователя.`
        : "Без цены или формата доступа сложно проверить монетизацию и серьезность обещания.",
    ].slice(0, quality.level === "weak" ? 4 : 5),
    weakPoints: {
      offer: {
        score: hasLanding ? 6 : 4,
        comment: `Оффер должен прямо объяснять, почему “${contextSummary}” важно сейчас, а не после долгого изучения продукта.`,
      },
      ux: {
        score: hasScreenshot ? 6 : 5,
        comment: input.screenshotBase64
          ? "Есть скрин, но mock не видит его как vision-модель. Все равно нужен короткий путь до первого полезного результата."
          : "Без скрина UX оценивается по описанию: нужен один сценарий входа и один ожидаемый результат.",
      },
      design: {
        score: hasScreenshot ? 6 : 5,
        comment:
          "Дизайн должен поддерживать главный тезис: один сильный фокус, пример результата и меньше одинаково важных блоков.",
      },
      value: {
        score: hasAudience ? 7 : 5,
        comment: hasAudience
          ? `Ценность нужно привязать к ситуации аудитории “${input.targetAudience.trim()}”.`
          : "Ценность звучит абстрактно, пока не указан конкретный пользователь и его момент боли.",
      },
      trust: {
        score: input.screenshotBase64 || hasLanding ? 5 : 4,
        comment:
          "Нужны доказательства: мини-демо, до/после, один реальный пример или честный build-in-public лог.",
      },
      monetization: {
        score: hasPrice ? 6 : 3,
        comment: hasPrice
          ? `Цена “${input.price.trim()}” есть, но ее нужно оправдать быстрым первым результатом.`
          : "Без цены или раннего формата доступа непонятно, как проверять готовность платить.",
      },
    },
    twoHourFixes: [
      `Переписать H1 для ${projectName}: конкретная боль + конкретный результат.`,
      hasAudience
        ? `Добавить блок “для кого”: один пример пользователя из аудитории “${input.targetAudience.trim()}”.`
        : "Добавить один узкий сегмент: кто первый пользователь и в какой ситуации он ищет решение.",
      input.desiredAction.trim()
        ? `Поставить CTA “${input.desiredAction.trim()}” рядом с примером результата.`
        : "Выбрать один CTA: waitlist, демо, регистрация, покупка или сообщение автору.",
      "Добавить пример результата: скрин, мок, до/после или короткий сценарий.",
      "Убрать общие фразы про AI и заменить их на 3 конкретных изменения в жизни пользователя.",
      input.price.trim()
        ? `Объяснить цену “${input.price.trim()}” через экономию времени, денег или тревоги.`
        : "Написать формат доступа: бесплатно, beta, ранний тариф или один понятный план.",
    ],
    improvedOffer,
    launchPack,
    threadsPosts: [
      {
        title: "Я сделал...",
        text: `Собрал ${projectName}. Главный урок: люди не покупают описание продукта. Они покупают момент, где им стало понятнее, легче или быстрее. Переписываю оффер вокруг этого.`,
      },
      {
        title: "Фейл / самоирония",
        text: `Думал, что нужно добавить еще фичу в ${projectName}. Оказалось, сначала надо объяснить человеку, зачем ему вообще нажимать кнопку.`,
      },
      {
        title: "Полезная мысль",
        text: `Если в первом экране видно только “что делает продукт”, это еще не оффер. Оффер начинается там, где пользователь узнает свою боль и видит первый результат.`,
      },
    ],
    nextSprint: {
      thirtyMinutes: [
        `Выписать один самый болезненный сценарий для ${projectName}.`,
        "Сформулировать новый H1, subheadline и CTA.",
      ],
      oneHour: [
        "Собрать блок до/после на одном реальном примере.",
        "Добавить демо-скрин или текстовый пример результата рядом с CTA.",
      ],
      twoHours: [
        "Упростить первый экран до одного обещания и одного действия.",
        input.analysisDepth === "launch"
          ? "Написать launch-пост с фейлом, скрином и просьбой к первым пользователям."
          : `Прогнать ${projectName} через 5-секундный тест: что человек понял без объяснений.`,
      ],
      todayLaunchMove:
        input.analysisDepth === "launch"
          ? `Опубликовать один Threads-пост про ${projectName} и попросить 5 человек написать, что они поняли за 5 секунд.`
          : `Запушить новую версию первого экрана ${projectName} и проверить, стало ли понятнее, для кого это и зачем.`,
    },
    assumptions,
    misunderstoodRisk,
    questionsToClarify,
    rawFeedback: `${rawMarkers} ${mode.rawTone} ${depth.raw} ${weakContextCopy} Lens: ${mode.lens}.`,
    version,
    clarificationCount,
  };
}

export function getMockRoast(input: RoastInput): RoastResult {
  return createContextAwareMockResult(input);
}

export function isDemoAnalysis(result: RoastResult): boolean {
  return result.rawFeedback.includes(DEMO_MARKER);
}

export function isMockAnalysis(result: RoastResult): boolean {
  return result.rawFeedback.includes(MOCK_MARKER);
}
