import type { RoastInput } from "../types/roast";

export type DemoProject = {
  id: string;
  title: string;
  subtitle: string;
  input: RoastInput;
};

export const demoProjects: DemoProject[] = [
  {
    id: "daypilot",
    title: "DayPilot",
    subtitle: "AI-планировщик дня",
    input: {
      projectName: "DayPilot",
      ideaDescription:
        "AI-планировщик дня, который сам расставляет задачи по энергии пользователя и помогает не начинать утро с хаоса.",
      landingText:
        "DayPilot помогает планировать день с помощью AI. Он учитывает задачи, энергию и календарь, чтобы собрать лучший план на сегодня.",
      targetAudience: "люди, которым сложно планировать день",
      desiredAction: "получить регистрацию",
      price: "5$ в месяц",
      stage: "mvp",
      roastMode: "mentor",
      analysisDepth: "fast",
      clarificationHistory: [],
      source: "demo",
    },
  },
  {
    id: "money-control",
    title: "Money Control",
    subtitle: "личный финансовый трекер",
    input: {
      projectName: "Money Control",
      ideaDescription:
        "Простой финансовый трекер, который показывает, куда реально утекают деньги, и предлагает один маленький шаг на неделю.",
      landingText:
        "Перестань гадать, куда пропала зарплата. Money Control собирает расходы, находит утечки и дает спокойный план без таблиц.",
      targetAudience: "молодые специалисты, которые хотят контролировать расходы без сложных таблиц",
      desiredAction: "подключить ранний доступ",
      price: "пока бесплатно, потом 4$ в месяц",
      stage: "landing",
      roastMode: "investor",
      analysisDepth: "deep",
      clarificationHistory: [],
      source: "demo",
    },
  },
  {
    id: "streak-together",
    title: "StreakTogether",
    subtitle: "привычки и маленькое племя",
    input: {
      projectName: "StreakTogether",
      ideaDescription:
        "Приложение привычек, где люди собираются в маленькие группы и держат друг друга в тонусе без токсичной мотивации.",
      landingText:
        "Не строй привычки в одиночку. StreakTogether соединяет тебя с 3-5 людьми, которые хотят такой же ритм, и помогает не выпадать.",
      targetAudience: "люди, которые уже бросали трекеры привычек через неделю",
      desiredAction: "записаться в waitlist",
      price: "3$ в месяц после beta",
      stage: "users",
      roastMode: "threads_bro",
      analysisDepth: "launch",
      clarificationHistory: [],
      source: "demo",
    },
  },
];
