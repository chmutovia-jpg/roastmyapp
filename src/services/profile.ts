import type { AcquisitionSource, UserProfile } from "../types/roast";

export const USER_PROFILE_KEY = "roastmyapp.userProfile";

export type CreateUserProfileInput = {
  email: string;
  name?: string;
  acquisitionSource: AcquisitionSource;
  acquisitionSourceOther?: string;
};

const sources: AcquisitionSource[] = ["threads", "friends", "search", "telegram", "youtube", "other"];

const hasStorage = () => typeof window !== "undefined" && "localStorage" in window;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const asSource = (value: unknown): AcquisitionSource =>
  sources.includes(value as AcquisitionSource) ? (value as AcquisitionSource) : "other";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readJson(key: string): unknown {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function writeJson<T>(key: string, value: T): boolean {
  if (!hasStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitizeProfile(value: unknown): UserProfile | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const email = asString(value.email);
  const createdAt = asString(value.createdAt);
  const lastActiveAt = asString(value.lastActiveAt);

  if (!id || !isValidEmail(email) || Number.isNaN(Date.parse(createdAt))) return null;

  return {
    id,
    email,
    ...(asString(value.name) ? { name: asString(value.name) } : {}),
    acquisitionSource: asSource(value.acquisitionSource),
    ...(asString(value.acquisitionSourceOther)
      ? { acquisitionSourceOther: asString(value.acquisitionSourceOther) }
      : {}),
    createdAt: new Date(Date.parse(createdAt)).toISOString(),
    lastActiveAt: Number.isNaN(Date.parse(lastActiveAt))
      ? new Date().toISOString()
      : new Date(Date.parse(lastActiveAt)).toISOString(),
    isLocalProfile: true,
    ...(Boolean(value.wantsEarlyAccess) ? { wantsEarlyAccess: true } : {}),
  };
}

export function getUserProfile(): UserProfile | null {
  return sanitizeProfile(readJson(USER_PROFILE_KEY));
}

export function hasUserProfile(): boolean {
  return Boolean(getUserProfile());
}

export function createUserProfile(input: CreateUserProfileInput): UserProfile {
  const now = new Date().toISOString();
  const profile: UserProfile = {
    id: createId(),
    email: input.email.trim().toLowerCase(),
    ...(input.name?.trim() ? { name: input.name.trim() } : {}),
    acquisitionSource: input.acquisitionSource,
    ...(input.acquisitionSource === "other" && input.acquisitionSourceOther?.trim()
      ? { acquisitionSourceOther: input.acquisitionSourceOther.trim() }
      : {}),
    createdAt: now,
    lastActiveAt: now,
    isLocalProfile: true,
  };

  if (!isValidEmail(profile.email)) {
    throw new Error("Invalid email");
  }

  writeJson(USER_PROFILE_KEY, profile);
  return profile;
}

export function updateUserProfile(patch: Partial<UserProfile>): UserProfile | null {
  const current = getUserProfile();
  if (!current) return null;

  const next: UserProfile = {
    ...current,
    ...patch,
    email: patch.email ? patch.email.trim().toLowerCase() : current.email,
    lastActiveAt: new Date().toISOString(),
    isLocalProfile: true,
  };

  if (!isValidEmail(next.email)) return current;
  writeJson(USER_PROFILE_KEY, next);
  return next;
}

export function clearUserProfile(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(USER_PROFILE_KEY);
}
