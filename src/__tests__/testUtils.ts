import { emptyRoastInput, type RoastInput, type RoastResult } from "../types/roast";
import { getMockRoast } from "../services/mockRoast";

export const makeInput = (overrides: Partial<RoastInput> = {}): RoastInput => ({
  ...emptyRoastInput,
  projectName: "PetCoach",
  ideaDescription:
    "Приложение для обучения собак командам. Хозяин выбирает возраст и проблему собаки, а PetCoach дает короткий план тренировок на неделю.",
  landingText:
    "PetCoach помогает хозяевам собак тренировать команды без хаоса. Выберите проблему, получите план и отмечайте прогресс каждый день.",
  targetAudience: "владельцы собак, которые тренируют питомца дома",
  desiredAction: "начать бесплатный план",
  price: "7$ в месяц",
  stage: "mvp",
  roastMode: "mentor",
  analysisDepth: "fast",
  source: "user",
  clarificationHistory: [],
  ...overrides,
});

export const makeResult = (input: RoastInput = makeInput()): RoastResult => getMockRoast(input);
