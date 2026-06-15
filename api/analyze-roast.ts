import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMockRoast } from "../src/services/mockRoast";
import type {
  AnalysisFallbackReason,
  AnalysisMeta,
  AnalyzeProjectResponse,
  RoastInput,
  RoastResult,
} from "../src/types/roast";
import { buildRoastPrompt } from "../src/utils/buildRoastPrompt";
import {
  isResultAboutUserProject,
  repairRoastResult,
  validateRoastResult,
} from "../src/utils/validateRoastResult";

const OPENAI_TIMEOUT_MS = 25_000;
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.5";

const roastResultSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "projectName",
    "score",
    "shortVerdict",
    "mainProblem",
    "firstFix",
    "confidence",
    "confidenceLabel",
    "whyUsersWillNotBuy",
    "weakPoints",
    "twoHourFixes",
    "improvedOffer",
    "threadsPosts",
    "nextSprint",
    "launchPack",
    "assumptions",
    "misunderstoodRisk",
    "questionsToClarify",
    "rawFeedback",
    "version",
    "clarificationCount",
  ],
  properties: {
    projectName: { type: "string" },
    score: { type: "number", minimum: 0, maximum: 10 },
    shortVerdict: { type: "string" },
    mainProblem: { type: "string" },
    firstFix: { type: "string" },
    confidence: { type: "number", minimum: 1, maximum: 100 },
    confidenceLabel: { type: "string" },
    whyUsersWillNotBuy: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
    weakPoints: {
      type: "object",
      additionalProperties: false,
      required: ["offer", "ux", "design", "value", "trust", "monetization"],
      properties: {
        offer: { $ref: "#/$defs/weakPoint" },
        ux: { $ref: "#/$defs/weakPoint" },
        design: { $ref: "#/$defs/weakPoint" },
        value: { $ref: "#/$defs/weakPoint" },
        trust: { $ref: "#/$defs/weakPoint" },
        monetization: { $ref: "#/$defs/weakPoint" },
      },
    },
    twoHourFixes: { type: "array", minItems: 4, maxItems: 8, items: { type: "string" } },
    improvedOffer: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "subheadline", "cta", "shortDescription"],
      properties: {
        headline: { type: "string" },
        subheadline: { type: "string" },
        cta: { type: "string" },
        shortDescription: { type: "string" },
      },
    },
    threadsPosts: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "text"],
        properties: {
          title: { type: "string" },
          text: { type: "string" },
        },
      },
    },
    nextSprint: {
      type: "object",
      additionalProperties: false,
      required: ["thirtyMinutes", "oneHour", "twoHours", "todayLaunchMove"],
      properties: {
        thirtyMinutes: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
        oneHour: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
        twoHours: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
        todayLaunchMove: { type: "string" },
      },
    },
    launchPack: {
      type: "object",
      additionalProperties: false,
      required: ["telegramPost", "profileBio", "landingHeadline", "replyComments"],
      properties: {
        telegramPost: { type: "string" },
        profileBio: { type: "string" },
        landingHeadline: { type: "string" },
        replyComments: { type: "array", minItems: 5, maxItems: 5, items: { type: "string" } },
      },
    },
    assumptions: { type: "array", minItems: 1, maxItems: 6, items: { type: "string" } },
    misunderstoodRisk: { type: "array", minItems: 1, maxItems: 5, items: { type: "string" } },
    questionsToClarify: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
    rawFeedback: { type: "string" },
    version: { type: "number", minimum: 1 },
    clarificationCount: { type: "number", minimum: 0 },
  },
  $defs: {
    weakPoint: {
      type: "object",
      additionalProperties: false,
      required: ["score", "comment"],
      properties: {
        score: { type: "number", minimum: 1, maximum: 10 },
        comment: { type: "string" },
      },
    },
  },
} as const;

type ResponseContent = {
  type: "input_text" | "input_image";
  text?: string;
  image_url?: string;
  detail?: "low" | "high" | "auto" | "original";
};

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
    durationMs: Math.max(0, Date.now() - startedAt),
    createdAt: new Date().toISOString(),
  };
}

function sendAnalysis(
  res: VercelResponse,
  result: RoastResult,
  meta: AnalysisMeta,
) {
  const payload: AnalyzeProjectResponse = { result, meta };
  return res.status(200).json(payload);
}

function fallback(
  input: RoastInput,
  res: VercelResponse,
  startedAt: number,
  reason: AnalysisFallbackReason,
) {
  const meta = createMeta("mock", startedAt, reason);
  console.info("[analyze-roast] fallback", {
    source: meta.source,
    reason: meta.reason,
    durationMs: meta.durationMs,
    projectName: input.projectName || "Проект без названия",
  });
  return sendAnalysis(res, getMockRoast(input), meta);
}

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;

  if (typeof record.output_text === "string") {
    return record.output_text;
  }

  if (!Array.isArray(record.output)) return null;

  for (const item of record.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const partRecord = part as Record<string, unknown>;
      if (typeof partRecord.text === "string") return partRecord.text;
    }
  }

  return null;
}

function parseJsonLoose(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    const stripped = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    try {
      return JSON.parse(stripped);
    } catch {
      const start = stripped.indexOf("{");
      const end = stripped.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) return null;
      try {
        return JSON.parse(stripped.slice(start, end + 1));
      } catch {
        return null;
      }
    }
  }
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startedAt = Date.now();

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;

  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid roast input" });
  }

  const input = { source: "user", ...(body as RoastInput) } as RoastInput;

  console.info("[analyze-roast] request", {
    projectName: input.projectName || "Проект без названия",
    source: input.source || "user",
    hasAdditionalContext: Boolean(input.additionalContext),
    clarificationCount: input.clarificationHistory?.length || 0,
    screenshotProvided: Boolean(input.screenshotBase64),
  });

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallback(input, res, startedAt, "missing_api_key");
  }

  const content: ResponseContent[] = [
    {
      type: "input_text",
      text: buildRoastPrompt(input),
    },
  ];

  if (input.screenshotBase64) {
    content.push({
      type: "input_image",
      image_url: input.screenshotBase64,
      detail: "low",
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        store: false,
        input: [
          {
            role: "user",
            content,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "roast_result",
            schema: roastResultSchema,
            strict: true,
          },
        },
      }),
    });

    if (!response.ok) {
      return fallback(input, res, startedAt, "api_error");
    }

    const payload = await response.json();
    const outputText = extractOutputText(payload);

    if (!outputText) {
      return fallback(input, res, startedAt, "empty_response");
    }

    const parsed = parseJsonLoose(outputText);
    if (!parsed) {
      return fallback(input, res, startedAt, "invalid_json");
    }

    const strict = validateRoastResult(parsed);
    const result = strict || repairRoastResult(parsed, input);

    if (!isResultAboutUserProject(result, input)) {
      const repaired = repairRoastResult({ ...parsed, projectName: input.projectName }, input);
      if (!isResultAboutUserProject(repaired, input)) {
        return fallback(input, res, startedAt, "wrong_project_context");
      }

      return sendAnalysis(
        res,
        repaired,
        createMeta("openai", startedAt, "wrong_project_context", DEFAULT_MODEL),
      );
    }

    return sendAnalysis(
      res,
      result,
      createMeta("openai", startedAt, strict ? undefined : "invalid_ai_result", DEFAULT_MODEL),
    );
  } catch (error) {
    return fallback(input, res, startedAt, isAbortError(error) ? "api_timeout" : "api_error");
  } finally {
    clearTimeout(timeoutId);
  }
}
