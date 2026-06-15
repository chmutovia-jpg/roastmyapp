export type ProjectStage = "idea" | "mvp" | "landing" | "users" | "sales";

export type RoastMode =
  | "mentor"
  | "investor"
  | "tired_user"
  | "threads_bro"
  | "codex_reviewer";

export type AnalysisDepth = "fast" | "deep" | "launch";
export type RoastSource = "user" | "demo";
export type AcquisitionSource =
  | "threads"
  | "friends"
  | "search"
  | "telegram"
  | "youtube"
  | "other";
export type AnalysisSource = "openai" | "mock";
export type AnalysisFallbackReason =
  | "missing_api_key"
  | "api_error"
  | "api_timeout"
  | "invalid_json"
  | "invalid_ai_result"
  | "wrong_project_context"
  | "empty_response"
  | "client_timeout"
  | "unknown";

export type AnalysisMeta = {
  source: AnalysisSource;
  reason?: AnalysisFallbackReason;
  model?: string;
  durationMs?: number;
  createdAt: string;
};

export type AnalyzeProjectResponse = {
  result: RoastResult;
  meta: AnalysisMeta;
};

export type ClarificationMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  acquisitionSource: AcquisitionSource;
  acquisitionSourceOther?: string;
  createdAt: string;
  lastActiveAt: string;
  isLocalProfile: boolean;
  wantsEarlyAccess?: boolean;
};

export type AcquisitionStats = Record<AcquisitionSource, number>;

export type UsageStats = {
  anonymousAnalyses: number;
  registeredAnalyses: number;
  clarifications: number;
  lastAnalysisAt?: string;
  resetAt?: string;
};

export type WeakPointKey =
  | "offer"
  | "ux"
  | "design"
  | "value"
  | "trust"
  | "monetization";

export type WeakPoint = {
  score: number;
  comment: string;
};

export type RoastInput = {
  projectName: string;
  ideaDescription: string;
  landingText: string;
  targetAudience: string;
  desiredAction: string;
  price: string;
  stage: ProjectStage;
  roastMode: RoastMode;
  analysisDepth: AnalysisDepth;
  screenshotBase64?: string;
  hasScreenshot?: boolean;
  screenshotMeta?: {
    attached: boolean;
    removedFromHistory: boolean;
  };
  additionalContext?: string;
  userCounterArgument?: string;
  clarificationHistory?: ClarificationMessage[];
  source?: RoastSource;
};

export type RoastInputForHistory = Omit<RoastInput, "screenshotBase64"> & {
  screenshotBase64?: never;
  hasScreenshot?: boolean;
  screenshotMeta?: {
    attached: boolean;
    removedFromHistory: boolean;
  };
};

export type RoastResult = {
  projectName: string;
  score: number;
  shortVerdict: string;
  mainProblem: string;
  firstFix?: string;
  confidence?: number;
  confidenceLabel?: string;
  whyUsersWillNotBuy: string[];
  weakPoints: {
    offer: WeakPoint;
    ux: WeakPoint;
    design: WeakPoint;
    value: WeakPoint;
    trust: WeakPoint;
    monetization: WeakPoint;
  };
  twoHourFixes: string[];
  improvedOffer: {
    headline: string;
    subheadline: string;
    cta: string;
    shortDescription: string;
  };
  threadsPosts: {
    title: string;
    text: string;
  }[];
  nextSprint: {
    thirtyMinutes: string[];
    oneHour: string[];
    twoHours: string[];
    todayLaunchMove: string;
  };
  assumptions: string[];
  misunderstoodRisk: string[];
  questionsToClarify: string[];
  launchPack?: {
    telegramPost: string;
    profileBio: string;
    landingHeadline: string;
    replyComments: string[];
  };
  rawFeedback: string;
  version?: number;
  refinedFromId?: string;
  clarificationCount?: number;
};

export type ProjectVersion = {
  id: string;
  version: number;
  input: RoastInputForHistory;
  result: RoastResult;
  meta?: AnalysisMeta;
  createdAt: string;
  clarificationText?: string;
};

export type ProjectWorkspace = {
  id: string;
  userId?: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  source: RoastSource;
  versions: ProjectVersion[];
};

export type RoastHistoryItem = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  input: RoastInputForHistory;
  originalInput?: RoastInputForHistory;
  result: RoastResult;
  meta?: AnalysisMeta;
  version?: number;
  refinedFromId?: string;
};

export type RoastSettings = {
  roastMode: RoastMode;
  analysisDepth: AnalysisDepth;
};

export const emptyRoastInput: RoastInput = {
  projectName: "",
  ideaDescription: "",
  landingText: "",
  targetAudience: "",
  desiredAction: "",
  price: "",
  stage: "idea",
  roastMode: "mentor",
  analysisDepth: "fast",
  clarificationHistory: [],
  source: "user",
};

export const stageLabels: Record<ProjectStage, string> = {
  idea: "Идея",
  mvp: "MVP",
  landing: "Лендинг",
  users: "Первые пользователи",
  sales: "Первые продажи",
};

export const roastModeLabels: Record<RoastMode, string> = {
  mentor: "Добрый ментор",
  investor: "Злой инвестор",
  tired_user: "Уставший пользователь",
  threads_bro: "Threads-бро",
  codex_reviewer: "Codex-ревьюер",
};

export const analysisDepthLabels: Record<AnalysisDepth, string> = {
  fast: "Fast roast",
  deep: "Deep audit",
  launch: "Launch review",
};

export const weakPointLabels: Record<WeakPointKey, string> = {
  offer: "Оффер",
  ux: "UX",
  design: "Дизайн",
  value: "Ценность",
  trust: "Доверие",
  monetization: "Монетизация",
};

export const demoRoastInput: RoastInput = {
  projectName: "DayPilot",
  ideaDescription:
    "AI-планировщик дня, который сам расставляет задачи по энергии пользователя и помогает не начинать утро с хаоса.",
  landingText:
    "DayPilot помогает планировать день с помощью AI. Он учитывает задачи, энергию и календарь, чтобы собрать лучший план на сегодня.",
  targetAudience: "люди, которым сложно планировать день",
  desiredAction: "получить регистрацию",
  price: "5$ в месяц",
  stage: "mvp",
  roastMode: "mentor",
  analysisDepth: "fast",
  clarificationHistory: [],
  source: "demo",
};

export const DEMO_MARKER = "[DEMO_ANALYSIS]";
export const MOCK_MARKER = "[MOCK_ANALYSIS]";
