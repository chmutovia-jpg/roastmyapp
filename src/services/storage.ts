import {
  emptyRoastInput,
  type AnalysisDepth,
  type AnalysisFallbackReason,
  type AnalysisMeta,
  type ClarificationMessage,
  type ProjectVersion,
  type ProjectWorkspace,
  type RoastHistoryItem,
  type RoastInput,
  type RoastInputForHistory,
  type RoastMode,
  type RoastSource,
  type RoastSettings,
  type ProjectStage,
  type UsageStats,
} from "../types/roast";
import { repairRoastResult, validateRoastResult } from "../utils/validateRoastResult";

export const HISTORY_KEY = "roastmyapp.history";
export const LAST_DRAFT_KEY = "roastmyapp.lastDraft";
export const SETTINGS_KEY = "roastmyapp.settings";
export const USAGE_STATS_KEY = "roastmyapp.usageStats";
export const PROJECT_WORKSPACES_KEY = "roastmyapp.projectWorkspaces";
const HISTORY_LIMIT = 20;
const WORKSPACE_LIMIT = 20;
const VERSION_LIMIT = 10;

const hasStorage = () => typeof window !== "undefined" && "localStorage" in window;
const stages: ProjectStage[] = ["idea", "mvp", "landing", "users", "sales"];
const modes: RoastMode[] = ["mentor", "investor", "tired_user", "threads_bro", "codex_reviewer"];
const depths: AnalysisDepth[] = ["fast", "deep", "launch"];
const sources: RoastSource[] = ["user", "demo"];
const analysisSources: AnalysisMeta["source"][] = ["openai", "mock"];
const fallbackReasons: AnalysisFallbackReason[] = [
  "missing_api_key",
  "api_error",
  "api_timeout",
  "invalid_json",
  "invalid_ai_result",
  "wrong_project_context",
  "empty_response",
  "client_timeout",
  "unknown",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;

const asStage = (value: unknown): ProjectStage =>
  stages.includes(value as ProjectStage) ? (value as ProjectStage) : emptyRoastInput.stage;

const asMode = (value: unknown): RoastMode =>
  modes.includes(value as RoastMode) ? (value as RoastMode) : emptyRoastInput.roastMode;

const asDepth = (value: unknown): AnalysisDepth =>
  depths.includes(value as AnalysisDepth) ? (value as AnalysisDepth) : emptyRoastInput.analysisDepth;

const asSource = (value: unknown): RoastSource =>
  sources.includes(value as RoastSource) ? (value as RoastSource) : "user";

const asAnalysisSource = (value: unknown): AnalysisMeta["source"] =>
  analysisSources.includes(value as AnalysisMeta["source"]) ? (value as AnalysisMeta["source"]) : "mock";

const asFallbackReason = (value: unknown): AnalysisFallbackReason | undefined =>
  fallbackReasons.includes(value as AnalysisFallbackReason) ? (value as AnalysisFallbackReason) : undefined;

function sanitizeMeta(value: unknown): AnalysisMeta | null {
  if (!isRecord(value)) return null;
  const createdAt = asString(value.createdAt);
  const createdAtTime = Date.parse(createdAt);

  return {
    source: asAnalysisSource(value.source),
    ...(asFallbackReason(value.reason) ? { reason: asFallbackReason(value.reason) } : {}),
    ...(asString(value.model) ? { model: asString(value.model) } : {}),
    ...(typeof value.durationMs === "number" && Number.isFinite(value.durationMs)
      ? { durationMs: Math.max(0, Math.round(value.durationMs)) }
      : {}),
    createdAt: Number.isNaN(createdAtTime) ? new Date().toISOString() : new Date(createdAtTime).toISOString(),
  };
}

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
  const hasScreenshot = Boolean(value.hasScreenshot) || Boolean(screenshotBase64);
  const additionalContext = asString(value.additionalContext);
  const userCounterArgument = asString(value.userCounterArgument);
  const screenshotMeta =
    isRecord(value.screenshotMeta)
      ? {
          attached: Boolean(value.screenshotMeta.attached),
          removedFromHistory: Boolean(value.screenshotMeta.removedFromHistory),
        }
      : undefined;

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
    ...(hasScreenshot ? { hasScreenshot } : {}),
    ...(screenshotMeta ? { screenshotMeta } : {}),
    ...(screenshotBase64 ? { screenshotBase64 } : {}),
    ...(additionalContext ? { additionalContext } : {}),
    ...(userCounterArgument ? { userCounterArgument } : {}),
    clarificationHistory: sanitizeClarificationHistory(value.clarificationHistory),
    source: asSource(value.source),
  };
}

export function stripHeavyInputForHistory(input: RoastInput): RoastInputForHistory {
  const { screenshotBase64: _screenshotBase64, ...rest } = input;
  const hasScreenshot = Boolean(input.screenshotBase64 || input.hasScreenshot);

  return {
    ...rest,
    ...(hasScreenshot
      ? {
          hasScreenshot: true,
          screenshotMeta: {
            attached: true,
            removedFromHistory: true,
          },
        }
      : {}),
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
  const strictResult = validateRoastResult(value.result);
  const result = strictResult || (input ? repairRoastResult(value.result, input) : null);
  const meta = sanitizeMeta(value.meta);

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
    input: stripHeavyInputForHistory(input),
    ...(originalInput ? { originalInput: stripHeavyInputForHistory(originalInput) } : {}),
    result: migratedResult,
    ...(meta ? { meta } : {}),
    ...(typeof value.version === "number" ? { version: value.version } : {}),
    ...(asString(value.refinedFromId) ? { refinedFromId: asString(value.refinedFromId) } : {}),
  };
}

function sanitizeUsageStats(value: unknown): UsageStats {
  if (!isRecord(value)) {
    return { anonymousAnalyses: 0, registeredAnalyses: 0, clarifications: 0 };
  }

  const lastAnalysisAt = asString(value.lastAnalysisAt);
  const resetAt = asString(value.resetAt);

  return {
    anonymousAnalyses: asNumber(value.anonymousAnalyses),
    registeredAnalyses: asNumber(value.registeredAnalyses),
    clarifications: asNumber(value.clarifications),
    ...(Number.isNaN(Date.parse(lastAnalysisAt)) ? {} : { lastAnalysisAt: new Date(Date.parse(lastAnalysisAt)).toISOString() }),
    ...(Number.isNaN(Date.parse(resetAt)) ? {} : { resetAt: new Date(Date.parse(resetAt)).toISOString() }),
  };
}

function sanitizeProjectVersion(value: unknown): ProjectVersion | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const version = asNumber(value.version);
  const input = sanitizeInput(value.input);
  const strictResult = validateRoastResult(value.result);
  const result = strictResult || (input ? repairRoastResult(value.result, input) : null);
  const createdAt = asString(value.createdAt);
  const createdAtTime = Date.parse(createdAt);
  const meta = sanitizeMeta(value.meta);
  const clarificationText = asString(value.clarificationText);

  if (!id || version < 1 || !input || !result || Number.isNaN(createdAtTime)) return null;

  return {
    id,
    version,
    input: stripHeavyInputForHistory(input),
    result,
    ...(meta ? { meta } : {}),
    createdAt: new Date(createdAtTime).toISOString(),
    ...(clarificationText ? { clarificationText } : {}),
  };
}

function sanitizeProjectWorkspace(value: unknown): ProjectWorkspace | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const projectName = asString(value.projectName);
  const createdAt = asString(value.createdAt);
  const updatedAt = asString(value.updatedAt);
  const createdAtTime = Date.parse(createdAt);
  const updatedAtTime = Date.parse(updatedAt);
  const versions = Array.isArray(value.versions)
    ? value.versions
        .map(sanitizeProjectVersion)
        .filter((item): item is ProjectVersion => Boolean(item))
        .slice(-VERSION_LIMIT)
    : [];

  if (!id || !projectName || Number.isNaN(createdAtTime) || !versions.length) return null;

  return {
    id,
    ...(asString(value.userId) ? { userId: asString(value.userId) } : {}),
    projectName,
    createdAt: new Date(createdAtTime).toISOString(),
    updatedAt: Number.isNaN(updatedAtTime)
      ? versions[versions.length - 1].createdAt
      : new Date(updatedAtTime).toISOString(),
    source: asSource(value.source),
    versions,
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
  return writeJson(HISTORY_KEY, history.slice(0, HISTORY_LIMIT));
}

export function addHistoryItem(item: RoastHistoryItem): RoastHistoryItem[] {
  const safeItem: RoastHistoryItem = {
    ...item,
    input: stripHeavyInputForHistory(item.input),
    ...(item.originalInput ? { originalInput: stripHeavyInputForHistory(item.originalInput) } : {}),
  };
  const next = [safeItem, ...loadHistory().filter((historyItem) => historyItem.id !== item.id)].slice(
    0,
    HISTORY_LIMIT,
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
  const saved = writeJson(LAST_DRAFT_KEY, input);
  if (saved) return true;

  return writeJson(LAST_DRAFT_KEY, stripHeavyInputForHistory(input));
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

export function loadUsageStats(): UsageStats {
  return sanitizeUsageStats(readJson<unknown>(USAGE_STATS_KEY, null));
}

export function saveUsageStats(stats: UsageStats): boolean {
  return writeJson(USAGE_STATS_KEY, sanitizeUsageStats(stats));
}

export function incrementUsageStats(
  key: "anonymousAnalyses" | "registeredAnalyses" | "clarifications",
): UsageStats {
  const current = loadUsageStats();
  const next: UsageStats = {
    ...current,
    [key]: current[key] + 1,
    ...(key === "clarifications" ? {} : { lastAnalysisAt: new Date().toISOString() }),
  };
  saveUsageStats(next);
  return next;
}

export function loadProjectWorkspaces(): ProjectWorkspace[] {
  const workspaces = readJson<unknown[]>(PROJECT_WORKSPACES_KEY, []);
  if (!Array.isArray(workspaces)) return [];

  return workspaces
    .map(sanitizeProjectWorkspace)
    .filter((item): item is ProjectWorkspace => Boolean(item))
    .slice(0, WORKSPACE_LIMIT);
}

export function saveProjectWorkspaces(workspaces: ProjectWorkspace[]): boolean {
  const safe = workspaces
    .map(sanitizeProjectWorkspace)
    .filter((item): item is ProjectWorkspace => Boolean(item))
    .slice(0, WORKSPACE_LIMIT);
  return writeJson(PROJECT_WORKSPACES_KEY, safe);
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function saveProjectVersion(params: {
  workspaceId?: string | null;
  userId?: string;
  input: RoastInput;
  result: ProjectVersion["result"];
  meta?: ProjectVersion["meta"];
  clarificationText?: string;
}): ProjectWorkspace {
  const workspaces = loadProjectWorkspaces();
  const now = new Date().toISOString();
  const projectName = params.result.projectName || params.input.projectName || "Проект без названия";
  const existing =
    (params.workspaceId ? workspaces.find((item) => item.id === params.workspaceId) : null) ||
    workspaces.find((item) => item.projectName.toLowerCase() === projectName.toLowerCase());
  const nextVersionNumber = (existing?.versions.at(-1)?.version || 0) + 1;
  const version: ProjectVersion = {
    id: createId(),
    version: nextVersionNumber,
    input: stripHeavyInputForHistory(params.input),
    result: {
      ...params.result,
      version: nextVersionNumber,
      clarificationCount: Math.max(0, nextVersionNumber - 1),
    },
    ...(params.meta ? { meta: params.meta } : {}),
    createdAt: now,
    ...(params.clarificationText ? { clarificationText: params.clarificationText } : {}),
  };

  const workspace: ProjectWorkspace = existing
    ? {
        ...existing,
        ...(params.userId ? { userId: params.userId } : {}),
        projectName,
        updatedAt: now,
        versions: [...existing.versions, version].slice(-VERSION_LIMIT),
      }
    : {
        id: createId(),
        ...(params.userId ? { userId: params.userId } : {}),
        projectName,
        createdAt: now,
        updatedAt: now,
        source: params.input.source || "user",
        versions: [version],
      };

  const next = [workspace, ...workspaces.filter((item) => item.id !== workspace.id)].slice(0, WORKSPACE_LIMIT);
  saveProjectWorkspaces(next);
  return workspace;
}

export function deleteProjectWorkspace(id: string): ProjectWorkspace[] {
  const next = loadProjectWorkspaces().filter((item) => item.id !== id);
  saveProjectWorkspaces(next);
  return next;
}
