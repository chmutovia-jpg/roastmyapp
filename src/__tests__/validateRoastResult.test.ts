import { isResultAboutUserProject, repairRoastResult } from "../utils/validateRoastResult";
import { makeInput } from "./testUtils";

describe("repairRoastResult", () => {
  it("repairs an empty object into a full result", () => {
    const input = makeInput();
    const result = repairRoastResult({}, input);

    expect(result.projectName).toBe("PetCoach");
    expect(result.whyUsersWillNotBuy.length).toBeGreaterThanOrEqual(3);
    expect(result.threadsPosts).toHaveLength(3);
    expect(result.weakPoints.offer.comment).toBeTruthy();
    expect(result.launchPack?.replyComments).toHaveLength(5);
  });

  it("clamps invalid scores", () => {
    const low = repairRoastResult({ score: -10 }, makeInput());
    const high = repairRoastResult({ score: 42 }, makeInput());

    expect(low.score).toBe(0);
    expect(high.score).toBe(10);
  });

  it("replaces undefined/null-like text", () => {
    const result = repairRoastResult({
      shortVerdict: "undefined",
      mainProblem: "null",
      rawFeedback: "[object Object]",
    }, makeInput());

    expect(result.shortVerdict).not.toMatch(/undefined|null|\[object Object\]/i);
    expect(result.mainProblem).not.toMatch(/undefined|null|\[object Object\]/i);
    expect(result.rawFeedback).not.toMatch(/undefined|null|\[object Object\]/i);
  });

  it("replaces demo projectName for user source", () => {
    const result = repairRoastResult({ projectName: "DayPilot" }, makeInput({ source: "user" }));

    expect(result.projectName).toBe("PetCoach");
  });

  it("fills missing threadsPosts to three posts", () => {
    const result = repairRoastResult({
      threadsPosts: [{ title: "Один", text: "Пост" }],
    }, makeInput());

    expect(result.threadsPosts).toHaveLength(3);
  });

  it("generates launchPack fallback without undefined or null text", () => {
    const result = repairRoastResult({ launchPack: { telegramPost: "undefined" } }, makeInput());
    const text = [
      result.launchPack?.telegramPost,
      result.launchPack?.profileBio,
      result.launchPack?.landingHeadline,
      ...(result.launchPack?.replyComments || []),
    ].join(" ");

    expect(result.launchPack).toBeTruthy();
    expect(text).not.toMatch(/\b(undefined|null|\[object Object\])\b/i);
  });

  it("detects wrong demo context in user result", () => {
    const input = makeInput({ source: "user" });
    const result = repairRoastResult({ rawFeedback: "DayPilot leaked into result" }, input);

    expect(isResultAboutUserProject(result, input)).toBe(false);
  });
});
