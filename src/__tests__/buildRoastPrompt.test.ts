import { buildRoastPrompt } from "../utils/buildRoastPrompt";
import { makeInput } from "./testUtils";

describe("buildRoastPrompt", () => {
  it("includes all user context fields", () => {
    const input = makeInput({
      additionalContext: "Это Telegram-бот для новичков без опыта.",
      userCounterArgument: "AI неправильно понял аудиторию.",
      clarificationHistory: [
        {
          id: "1",
          role: "user",
          text: "Главная ценность — короткая подсказка в чате.",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const prompt = buildRoastPrompt(input);

    expect(prompt).toContain("PetCoach");
    expect(prompt).toContain(input.ideaDescription);
    expect(prompt).toContain(input.targetAudience);
    expect(prompt).toContain("Telegram-бот");
    expect(prompt).toContain("Главная ценность");
  });

  it("forbids demo replacement for user source", () => {
    const prompt = buildRoastPrompt(makeInput({ source: "user" }));

    expect(prompt).toContain("Не используй DayPilot, Money Control, StreakTogether");
    expect(prompt).toContain('Source !== "demo"');
    expect(prompt).toContain("Не называй проект другим именем");
  });
});
