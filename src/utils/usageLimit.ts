import type { UsageStats, UserProfile } from "../types/roast";

export type UsageLimitState =
  | { allowed: true; reason?: never }
  | { allowed: false; reason: "signup_required" | "premium_required" };

export const ANONYMOUS_FREE_ANALYSES = 1;
export const REGISTERED_FREE_ANALYSES = 5;

export function getUsageLimitState(
  profile: UserProfile | null,
  stats: UsageStats,
  options: { devBypass?: boolean } = {},
): UsageLimitState {
  if (options.devBypass) return { allowed: true };

  if (!profile && stats.anonymousAnalyses >= ANONYMOUS_FREE_ANALYSES) {
    return { allowed: false, reason: "signup_required" };
  }

  if (profile && stats.registeredAnalyses >= REGISTERED_FREE_ANALYSES) {
    return { allowed: false, reason: "premium_required" };
  }

  return { allowed: true };
}
