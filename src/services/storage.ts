import {
  emptyRoastInput,
  type AnalysisDepth,
  type ClarificationMessage,
  type RoastHistoryItem,
  type RoastInput,
  type RoastMode,
  type RoastSource,
  type RoastSettings,
  type ProjectStage,
} from "../types/roast";
import { validateRoastResult } from "../utils/validateRoastResult";

export const HISTORY_KEY = "roastmyapp.history";
export const LAST_DRAFT_KEY = "roastmyapp.lastDraft";
export const SETTINGS_KEY = "roastmyapp.settings";

const hasStorage = () => typeof window !== "undefined" && "localStorage" in window;
const stages: ProjectStage[] = ["idea", "mvp", "landing", "users", "sales"];
const modes: RoastMode[] = ["mentor", "investor", "tired_user", "threads_bro", "codex_reviewer"];
const depths: AnalysisDepth[] = ["fast", "deep", "launch"];
const sources: RoastSource[] = ["user", "demo"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asStage = (value: unknown): ProjectStage =>
  stages.includes(value as ProjectStage) ? (value as ProjectStage) : emptyRoastInput.stage;

const asMode = (value: unknown): RoastMode =>
  modes.includes(value as RoastMode) ? (value as RoastMode) : emptyRoastInput.roastMode;

const asDepth = (value: unknown): AnalysisDepth =>
  depths.includes(value as AnalysisDepth) ? (value as AnalysisDepth) : emptyRoastInput.analysisDepth;

const asSource = (value: unknown): RoastSource =>
  sources.includes(value as RoastSource) ? (value as RoastSource) : "user";

function sanitizeClarificationMessage(value: unknown): ClarificationMessage | null {
  if (!isRecord(value)) return null;

  const id = asString(value.id);
  const role = value.role === "assistant" ? "assistant" : value.role === "user" ? "user" : null;
  const text = asString(value.text);
  const createdAt = asString(value.createdAt);
  const createdAtTime = Date.parse(createdAt);

  if (!id || !role || !text || Number.isNaN(createdAtTime)) return null;

  return {
    id,
    role,
    text,
    createdAt: new Date(createdAtTime).toISOString(),
  };
}

function sanitizeClarificationHistory(value: unknown): ClarificationMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(sanitizeClarificationMessage)
    .filter((message): message is ClarificationMessage => Boolean(message))
    .slice(-12);
}

function sanitizeInput(value: unknown): RoastInput | null {
  if (!isRecord(value)) return null;

  const screenshotBase64 = asString(value.screenshotBase64);
  const additionalContext = asString(value.additionalContext);
  const userCounterArgument = asString(value.userCounterArgument);

  return {
    projectName: asString(value.projectName),
    ideaDescription: asString(value.ideaDescription),
    landingText: asString(value.landingText),
    targetAudience: asString(value.targetAudience),
    desiredAction: asString(value.desiredAction),
    price: asString(value.price),
    stage: asStage(value.stage),
    roastMode: asMode(value.roastMode),
    analysisDepth: asDepth(value.analysisDepth),
    ...(screenshotBase64 ? { screenshotBase64 } : {}),
    ...(additionalContext ? { additionalContext } : {}),
    ...(userCounterArgument ? { userCounterArgument } : {}),
    clarificationHistory: sanitizeClarificationHistory(value.clarificationHistory),
    source: asSource(value.source),
  };
}

function sanitizeHistoryItem(value: unknown): RoastHistoryItem | null {
  if (!isRecord(value)) return null;

  const id = asString(value.id);
  const createdAt = asString(value.createdAt);
  const createdAtTime = Date.parse(createdAt);
  const updatedAt = asString(value.updatedAt);
  const updatedAtTime = Date.parse(updatedAt);
  const input = sanitizeInput(value.input);
  const originalInput = sanitizeInput(value.originalInput);
  const result = validateRoastResult(value.result);

  if (!id || Number.isNaN(createdAtTime) || !input || !result) return null;

  const migratedResult = {
    ...result,
    projectName:
      result.projectName === "Проект без названия" && input.projectName
        ? input.projectName
        : result.projectName,
  };

  return {
    id,
    createdAt: new Date(createdAtTime).toISOString(),
    ...(!Number.isNaN(updatedAtTime) ? { updatedAt: new Date(updatedAtTime).toISOString() } : {}),
    input,
    ...(originalInput ? { originalInput } : {}),
    result: migratedResult,
    ...(typeof value.version === "number" ? { version: value.version } : {}),
    ...(asString(value.refinedFromId) ? { refinedFromId: asString(value.refinedFromId) } : {}),
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
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

export function loadHistory(): RoastHistoryItem[] {
  const history = readJson<unknown[]>(HISTORY_KEY, []);
  if (!Array.isArray(history)) return [];

  return history
    .map(sanitizeHistoryItem)
    .filter((item): item is RoastHistoryItem => Boolean(item));
}

export function saveHistory(history: RoastHistoryItem[]): boolean {
  return writeJson(HISTORY_KEY, history.slice(0, 30));
}

export function addHistoryItem(item: RoastHistoryItem): RoastHistoryItem[] {
  const next = [item, ...loadHistory().filter((historyItem) => historyItem.id !== item.id)].slice(
    0,
    30,
  );
  saveHistory(next);
  return next;
}

export function deleteHistoryItem(id: string): RoastHistoryItem[] {
  const next = loadHistory().filter((item) => item.id !== id);
  saveHistory(next);
  return next;
}

export function loadDraft(): RoastInput {
  const draft = sanitizeInput(readJson<unknown>(LAST_DRAFT_KEY, null));
  return draft || emptyRoastInput;
}

export function saveDraft(input: RoastInput): boolean {
  return writeJson(LAST_DRAFT_KEY, input);
}

export function loadSettings(): RoastSettings {
  const settings = readJson<unknown>(SETTINGS_KEY, {});
  if (!isRecord(settings)) return { roastMode: "mentor", analysisDepth: "fast" };

  return {
    roastMode: asMode(settings.roastMode),
    analysisDepth: asDepth(settings.analysisDepth),
  };
}

export function saveSettings(settings: RoastSettings): boolean {
  return writeJson(SETTINGS_KEY, settings);
}
