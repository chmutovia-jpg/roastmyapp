import { calculateInputQuality } from "../utils/calculateInputQuality";
import { makeInput } from "./testUtils";

describe("calculateInputQuality", () => {
  it("marks empty input as weak and suggests missing fields", () => {
    const quality = calculateInputQuality(makeInput({
      projectName: "",
      ideaDescription: "",
      landingText: "",
      targetAudience: "",
      desiredAction: "",
      price: "",
    }));

    expect(quality.level).toBe("weak");
    expect(quality.score).toBeLessThan(40);
    expect(quality.suggestions).toContain("Добавь, кому ты это продаешь");
  });

  it("marks partial input as normal", () => {
    const quality = calculateInputQuality(makeInput({
      landingText: "",
      desiredAction: "",
      price: "",
      screenshotBase64: undefined,
    }));

    expect(quality.level).toBe("normal");
    expect(quality.score).toBeGreaterThanOrEqual(40);
    expect(quality.score).toBeLessThan(75);
  });

  it("marks detailed input as strong", () => {
    const quality = calculateInputQuality(makeInput({
      screenshotBase64: "data:image/png;base64,abc",
    }));

    expect(quality.level).toBe("strong");
    expect(quality.score).toBe(100);
  });

  it("adds screenshot bonus", () => {
    const withoutScreenshot = calculateInputQuality(makeInput());
    const withScreenshot = calculateInputQuality(makeInput({
      screenshotBase64: "data:image/png;base64,abc",
    }));

    expect(withScreenshot.score).toBeGreaterThan(withoutScreenshot.score);
  });
});
