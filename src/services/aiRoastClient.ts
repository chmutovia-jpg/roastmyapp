import { getMockRoast } from "./mockRoast";
import type { RoastInput, RoastResult } from "../types/roast";
import { validateRoastResult } from "../utils/validateRoastResult";

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const demoProjectNames = ["DayPilot", "Money Control", "StreakTogether"];

function serializeResult(result: RoastResult) {
  return [
    result.projectName,
    result.shortVerdict,
    result.mainProblem,
    result.firstFix,
    result.improvedOffer.headline,
    result.improvedOffer.subheadline,
    result.rawFeedback,
    ...result.whyUsersWillNotBuy,
    ...result.twoHourFixes,
    ...result.threadsPosts.map((post) => `${post.title} ${post.text}`),
  ].join(" ");
}

function hasWrongProjectContext(input: RoastInput, result: RoastResult) {
  const expectedName = input.projectName.trim() || "Проект без названия";
  const actualName = result.projectName.trim();

  if (actualName !== expectedName) return true;
  if (input.source === "demo") return false;

  const serialized = serializeResult(result);
  return demoProjectNames.some(
    (name) => name !== expectedName && new RegExp(`\\b${name}\\b`, "i").test(serialized),
  );
}

export async function analyzeProject(input: RoastInput): Promise<RoastResult> {
  const requestInput: RoastInput = {
    source: "user",
    clarificationHistory: [],
    ...input,
  };
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch("/api/analyze-roast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestInput),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Roast API returned an error");
    }

    const payload = await response.json();
    const validated = validateRoastResult(payload);

    if (!validated) {
      throw new Error("Roast API returned invalid payload");
    }

    if (hasWrongProjectContext(requestInput, validated)) {
      return getMockRoast(requestInput);
    }

    return validated;
  } catch {
    await sleep(1200);
    return getMockRoast(requestInput);
  } finally {
    window.clearTimeout(timeoutId);
  }
}
