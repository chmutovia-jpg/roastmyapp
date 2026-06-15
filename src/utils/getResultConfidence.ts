import type { RoastInput } from "../types/roast";
import { calculateInputQuality } from "./calculateInputQuality";

export function getResultConfidence(input: RoastInput): {
  confidence: number;
  confidenceLabel: string;
} {
  const quality = calculateInputQuality(input);
  const depthBonus = input.analysisDepth === "deep" ? 8 : input.analysisDepth === "launch" ? 5 : 0;
  const confidence = Math.max(42, Math.min(96, quality.score + depthBonus));

  const missing = quality.missing.slice(0, 2);
  const suffix = missing.length ? `мало данных про ${missing.join(" и ")}` : "контекста достаточно";

  return {
    confidence,
    confidenceLabel: `${confidence}% — ${suffix}`,
  };
}
