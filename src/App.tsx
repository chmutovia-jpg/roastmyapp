import { AnimatePresence, motion } from "framer-motion";
import { Archive, CircleUserRound, FlaskConical, History, Home, ScanLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnalysisLoading } from "./components/AnalysisLoading";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { Hero } from "./components/Hero";
import { HistoryPanel } from "./components/HistoryPanel";
import { ProjectForm } from "./components/ProjectForm";
import { ResultView } from "./components/ResultView";
import { RoastModeSelector } from "./components/RoastModeSelector";
import { analyzeProject } from "./services/aiRoastClient";
import { getMockRoast } from "./services/mockRoast";
import {
  addHistoryItem,
  deleteHistoryItem,
  loadDraft,
  loadHistory,
  loadSettings,
  saveDraft,
  saveSettings,
} from "./services/storage";
import {
  emptyRoastInput,
  type RoastHistoryItem,
  type RoastInput,
  type RoastMode,
  type RoastResult,
} from "./types/roast";
import { demoProjects, type DemoProject } from "./utils/demoProjects";

type Screen = "home" | "input" | "mode" | "loading" | "result" | "history";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const hasInputSignal = (input: RoastInput) =>
  Boolean(input.ideaDescription.trim() || input.landingText.trim() || input.screenshotBase64);

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const formatAnalysisTime = () =>
  new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [draft, setDraft] = useState<RoastInput>(() => {
    const settings = loadSettings();
    return {
      ...emptyRoastInput,
      ...loadDraft(),
      roastMode: settings.roastMode,
      analysisDepth: settings.analysisDepth,
    };
  });
  const [result, setResult] = useState<RoastResult | null>(null);
  const [history, setHistory] = useState<RoastHistoryItem[]>(() => loadHistory());
  const [savedId, setSavedId] = useState<string | null>(null);
  const [softError, setSoftError] = useState("");
  const [lastAnalysisTime, setLastAnalysisTime] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    saveDraft(draft);
    saveSettings({ roastMode: draft.roastMode, analysisDepth: draft.analysisDepth });
  }, [draft]);

  const saved = useMemo(
    () => Boolean(savedId && history.some((item) => item.id === savedId)),
    [history, savedId],
  );

  const updateDraft = (nextDraft: RoastInput) => {
    setDraft(nextDraft);
    setSavedId(null);
  };

  const fillDemo = (project: DemoProject = demoProjects[0]) => {
    setDraft({ ...project.input, source: "demo", clarificationHistory: [] });
    setSavedId(null);
    setScreen("input");
  };

  const openDemoResult = (project: DemoProject = demoProjects[0]) => {
    const demoInput = { ...project.input, source: "demo" as const, clarificationHistory: [] };
    setDraft(demoInput);
    setResult(getMockRoast(demoInput));
    setSavedId(null);
    setLastAnalysisTime(formatAnalysisTime());
    setScreen("result");
  };

  const startAnalyze = async (mode = draft.roastMode, analysisDepth = draft.analysisDepth) => {
    const nextInput = { source: "user" as const, clarificationHistory: [], ...draft, roastMode: mode, analysisDepth };
    setDraft(nextInput);
    setSoftError("");
    setSavedId(null);
    setScreen("loading");

    try {
      const [roastResult] = await Promise.all([analyzeProject(nextInput), wait(1900)]);
      setResult(roastResult);
      setLastAnalysisTime(formatAnalysisTime());
      setScreen("result");
    } catch {
      setSoftError("AI не смог разнести проект. Возможно, проект разнес его первым.");
      setResult(getMockRoast(nextInput));
      setLastAnalysisTime(formatAnalysisTime());
      setScreen("result");
    }
  };

  const saveCurrentResult = () => {
    if (!result) return;
    const now = new Date().toISOString();

    const item: RoastHistoryItem = {
      id: savedId || createId(),
      createdAt: savedId ? history.find((historyItem) => historyItem.id === savedId)?.createdAt || now : now,
      updatedAt: now,
      input: draft,
      originalInput: draft,
      result,
      version: result.version || 1,
      ...(result.refinedFromId ? { refinedFromId: result.refinedFromId } : {}),
    };

    const nextHistory = addHistoryItem(item);
    setHistory(nextHistory);
    setSavedId(item.id);
  };

  const openHistoryItem = (item: RoastHistoryItem) => {
    setDraft({ ...emptyRoastInput, ...item.input });
    setResult(item.result);
    setSavedId(item.id);
    setSoftError("");
    setLastAnalysisTime(new Date(item.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
    setScreen("result");
  };

  const removeHistoryItem = (id: string) => {
    const next = deleteHistoryItem(id);
    setHistory(next);
    if (savedId === id) setSavedId(null);
  };

  const resetForNewRoast = () => {
    setResult(null);
    setSavedId(null);
    setSoftError("");
    setDraft((current) => ({
      ...emptyRoastInput,
      roastMode: current.roastMode,
      analysisDepth: current.analysisDepth,
      source: "user",
      clarificationHistory: [],
    }));
    setScreen("input");
  };

  const refineAnalysisWithContext = async (clarificationText: string) => {
    if (!result) return;

    const trimmed = clarificationText.trim();
    if (!trimmed) {
      setSoftError("Напиши, что AI упустил. Например: ‘целевая аудитория не стартаперы, а фрилансеры’.");
      return;
    }

    const previousResult = result;
    const previousDraft = draft;
    const now = new Date().toISOString();
    const userMessage = {
      id: createId(),
      role: "user" as const,
      text: trimmed,
      createdAt: now,
    };
    const assistantMessage = {
      id: createId(),
      role: "assistant" as const,
      text: `Предыдущий вывод: ${previousResult.shortVerdict} Главная проблема: ${previousResult.mainProblem}`,
      createdAt: now,
    };
    const updatedInput: RoastInput = {
      ...previousDraft,
      source: "user",
      additionalContext: [previousDraft.additionalContext, trimmed].filter(Boolean).join("\n\n"),
      userCounterArgument: trimmed,
      clarificationHistory: [
        ...(previousDraft.clarificationHistory || []),
        assistantMessage,
        userMessage,
      ].slice(-12),
    };

    setIsRefining(true);
    setSoftError("");
    setDraft(updatedInput);
    setScreen("loading");

    try {
      const [updatedResult] = await Promise.all([analyzeProject(updatedInput), wait(1900)]);
      const nextResult: RoastResult = {
        ...updatedResult,
        projectName: updatedResult.projectName || updatedInput.projectName || "Проект без названия",
        version: updatedResult.version || (previousResult.version || 1) + 1,
        clarificationCount:
          updatedResult.clarificationCount ?? updatedInput.clarificationHistory?.filter((message) => message.role === "user").length ?? 1,
        ...(savedId ? { refinedFromId: savedId } : {}),
      };
      const item: RoastHistoryItem = {
        id: createId(),
        createdAt: now,
        updatedAt: new Date().toISOString(),
        input: updatedInput,
        originalInput: previousDraft,
        result: nextResult,
        version: nextResult.version || 1,
        ...(savedId ? { refinedFromId: savedId } : {}),
      };

      setResult(nextResult);
      setHistory(addHistoryItem(item));
      setSavedId(item.id);
      setLastAnalysisTime(formatAnalysisTime());
      setScreen("result");
    } catch {
      setDraft(previousDraft);
      setResult(previousResult);
      setSoftError("Не получилось пересобрать разбор. Старый результат сохранен.");
      setScreen("result");
    } finally {
      setIsRefining(false);
    }
  };

  const goAnalyze = () => setScreen("input");
  const goModes = () => setScreen(hasInputSignal(draft) ? "mode" : "input");

  const topNav = [
    { label: "Analyze", onClick: goAnalyze },
    { label: "Modes", onClick: goModes },
    { label: "History", onClick: () => setScreen("history") },
    { label: "Example", onClick: () => openDemoResult() },
  ];

  return (
    <div className="app-shell min-h-screen overflow-x-hidden pb-[calc(140px+env(safe-area-inset-bottom))] text-[#111416]">
      <AnimatedBackground />
      <header className="sticky top-0 z-40 bg-[#ededeb]/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="flex items-center gap-3 text-left"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white/50 text-[11px] font-extrabold tracking-[0.12em] text-[#111416] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              RMA
            </span>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-[#20262b]/70 sm:block">
              RoastMyApp
            </span>
          </button>

          <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/34 px-1.5 py-1 shadow-[0_18px_48px_rgba(16,20,24,0.07),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-2xl md:flex">
            {topNav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#20262b]/58 transition hover:bg-white/58 hover:text-[#111416]"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => openDemoResult()}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-black/10 bg-white/50 px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#20262b] shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] transition hover:bg-white/72"
          >
            <CircleUserRound className="h-3.5 w-3.5" />
            Demo
          </button>
        </div>
      </header>

      {softError ? (
        <div className="mx-auto mt-4 max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.4rem] border border-black/10 bg-white/54 px-4 py-3 text-sm font-semibold text-[#20262b] shadow-[0_18px_44px_rgba(16,20,24,0.08)] backdrop-blur-xl">
            {softError}
          </div>
        </div>
      ) : null}

      <main>
        <AnimatePresence mode="wait">
          {screen === "home" ? (
            <Hero
              key="home"
              historyCount={history.length}
              onStart={goAnalyze}
              onDemo={() => openDemoResult()}
              onDemoSelect={openDemoResult}
              onHistory={() => setScreen("history")}
            />
          ) : null}

          {screen === "input" ? (
            <ProjectForm
              key="input"
              input={draft}
              onChange={updateDraft}
              onContinue={() => setScreen("mode")}
              onBack={() => setScreen("home")}
              onDemoFill={fillDemo}
            />
          ) : null}

          {screen === "mode" ? (
            <RoastModeSelector
              key="mode"
              input={draft}
              selected={draft.roastMode}
              onDepthChange={(analysisDepth) => setDraft((current) => ({ ...current, analysisDepth }))}
              onSelect={(roastMode) => setDraft((current) => ({ ...current, roastMode }))}
              onAnalyze={() => void startAnalyze()}
              onBack={() => setScreen("input")}
            />
          ) : null}

          {screen === "loading" ? <AnalysisLoading key="loading" /> : null}

          {screen === "result" && result ? (
            <ResultView
              key="result"
              input={draft}
              result={result}
              saved={saved}
              lastAnalysisTime={lastAnalysisTime}
              onBackToMode={() => setScreen("mode")}
              onNewRoast={resetForNewRoast}
              onSave={saveCurrentResult}
              onToneAdjust={(mode: RoastMode, analysisDepth) => void startAnalyze(mode, analysisDepth)}
              onRefine={(clarificationText) => void refineAnalysisWithContext(clarificationText)}
              isRefining={isRefining}
            />
          ) : null}

          {screen === "history" ? (
            <HistoryPanel
              key="history"
              history={history}
              onOpen={openHistoryItem}
              onDelete={removeHistoryItem}
              onRepeat={(item) => {
                setDraft({ ...emptyRoastInput, ...item.input });
                setSavedId(null);
                setScreen("mode");
              }}
              onBack={() => setScreen(result ? "result" : "home")}
              onStart={resetForNewRoast}
            />
          ) : null}
        </AnimatePresence>
      </main>

      <motion.nav
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="bottom-nav-shell fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[560px] -translate-x-1/2 rounded-full border border-white/12 bg-[#101418]/82 p-1.5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
      >
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-1">
          <BottomNavButton active={screen === "home"} label="Home" Icon={Home} onClick={() => setScreen("home")} />
          <BottomNavButton active={screen === "input" || screen === "mode"} label="Analyze" Icon={ScanLine} onClick={goAnalyze} />
          <BottomNavButton active={screen === "history"} label="History" Icon={History} onClick={() => setScreen("history")} />
          <BottomNavButton active={screen === "result"} label="Library" Icon={Archive} onClick={() => setScreen(result ? "result" : "history")} />
          <button
            type="button"
            onClick={goAnalyze}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#101418] shadow-[0_10px_34px_rgba(255,255,255,0.18)] transition hover:scale-[1.03] active:scale-[0.98]"
            aria-label="Analyze"
          >
            <FlaskConical className="h-4 w-4" />
          </button>
        </div>
      </motion.nav>
    </div>
  );
}

type BottomNavButtonProps = {
  active: boolean;
  label: string;
  Icon: typeof Home;
  onClick: () => void;
};

function BottomNavButton({ active, label, Icon, onClick }: BottomNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-11 items-center justify-center gap-2 rounded-full px-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition",
        active
          ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          : "text-white/48 hover:bg-white/[0.07] hover:text-white/82",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
