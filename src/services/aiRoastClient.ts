import { getMockRoast } from "./mockRoast";
import type {
  AnalysisFallbackReason,
  AnalysisMeta,
  AnalyzeProjectResponse,
  RoastInput,
} from "../types/roast";
import { isResultAboutUserProject, repairRoastResult, validateRoastResult } from "../utils/validateRoastResult";

const CLIENT_TIMEOUT_MS = 30_000;
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function createMeta(
  source: AnalysisMeta["source"],
  startedAt: number,
  reason?: AnalysisFallbackReason,
  model?: string,
): AnalysisMeta {
  return {
    source,
    ...(reason ? { reason } : {}),
    ...(model ? { model } : {}),
    durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
    createdAt: new Date().toISOString(),
  };
}

function createMockResponse(
  input: RoastInput,
  startedAt: number,
  reason: AnalysisFallbackReason,
): AnalyzeProjectResponse {
  return {
    result: getMockRoast(input),
    meta: createMeta("mock", startedAt, reason),
  };
}

function isAbortError(error: unknown) {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

function normalizeBackendPayload(
  payload: unknown,
  input: RoastInput,
  startedAt: number,
): AnalyzeProjectResponse {
  if (payload && typeof payload === "object" && "result" in payload) {
    const record = payload as Record<string, unknown>;
    const strict = validateRoastResult(record.result);
    const repaired = strict || repairRoastResult(record.result, input);
    const metaRecord = record.meta && typeof record.meta === "object" ? (record.meta as AnalysisMeta) : null;
    const meta: AnalysisMeta = {
      source: metaRecord?.source === "openai" ? "openai" : "mock",
      ...(metaRecord?.reason ? { reason: metaRecord.reason } : {}),
      ...(metaRecord?.model ? { model: metaRecord.model } : {}),
      durationMs:
        typeof metaRecord?.durationMs === "number"
          ? metaRecord.durationMs
          : Math.max(0, Math.round(performance.now() - startedAt)),
      createdAt: metaRecord?.createdAt || new Date().toISOString(),
    };

    return { result: repaired, meta };
  }

  const strict = validateRoastResult(payload);
  const result = strict || repairRoastResult(payload, input);

  return {
    result,
    meta: createMeta(strict ? "openai" : "mock", startedAt, strict ? undefined : "invalid_ai_result"),
  };
}

export async function analyzeProject(input: RoastInput): Promise<AnalyzeProjectResponse> {
  const startedAt = performance.now();
  const requestInput: RoastInput = {
    source: "user",
    clarificationHistory: [],
    ...input,
  };
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

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
    const normalized = normalizeBackendPayload(payload, requestInput, startedAt);

    if (!isResultAboutUserProject(normalized.result, requestInput)) {
      return createMockResponse(requestInput, startedAt, "wrong_project_context");
    }

    if (normalized.meta.source === "mock") {
      console.info("[roast-client] AI source: mock", {
        reason: normalized.meta.reason || "unknown",
        durationMs: normalized.meta.durationMs,
      });
    }

    return normalized;
  } catch (error) {
    await sleep(900);
    return createMockResponse(
      requestInput,
      startedAt,
      isAbortError(error) ? "client_timeout" : "api_error",
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}
