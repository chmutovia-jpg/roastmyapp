import { formatFullReport, formatThreadsPosts } from "../utils/formatReport";
import { makeInput, makeResult } from "./testUtils";

describe("formatReport", () => {
  it("formats full report without undefined/null artifacts", () => {
    const input = makeInput();
    const result = makeResult(input);
    const report = formatFullReport(input, result);

    expect(report).toContain("Roast My App AI");
    expect(report).toContain("PetCoach");
    expect(report).not.toMatch(/\bundefined\b|\bnull\b|\[object Object\]/i);
  });

  it("formats Threads posts as numbered text", () => {
    const posts = formatThreadsPosts(makeResult());

    expect(posts).toContain("1.");
    expect(posts).toContain("2.");
    expect(posts).toContain("3.");
  });
});
