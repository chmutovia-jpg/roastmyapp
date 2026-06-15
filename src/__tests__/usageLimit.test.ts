import type { UsageStats, UserProfile } from "../types/roast";
import { getUsageLimitState } from "../utils/usageLimit";

const stats = (overrides: Partial<UsageStats> = {}): UsageStats => ({
  anonymousAnalyses: 0,
  registeredAnalyses: 0,
  clarifications: 0,
  ...overrides,
});

const profile: UserProfile = {
  id: "user-1",
  email: "user@example.com",
  acquisitionSource: "threads",
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  isLocalProfile: true,
};

describe("usage limits", () => {
  it("allows one anonymous analysis", () => {
    expect(getUsageLimitState(null, stats({ anonymousAnalyses: 0 })).allowed).toBe(true);
    expect(getUsageLimitState(null, stats({ anonymousAnalyses: 1 }))).toEqual({
      allowed: false,
      reason: "signup_required",
    });
  });

  it("allows five registered analyses", () => {
    expect(getUsageLimitState(profile, stats({ registeredAnalyses: 4 })).allowed).toBe(true);
    expect(getUsageLimitState(profile, stats({ registeredAnalyses: 5 }))).toEqual({
      allowed: false,
      reason: "premium_required",
    });
  });

  it("supports development bypass", () => {
    expect(getUsageLimitState(null, stats({ anonymousAnalyses: 99 }), { devBypass: true }).allowed).toBe(true);
  });
});
