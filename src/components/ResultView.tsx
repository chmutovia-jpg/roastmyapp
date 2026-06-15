import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeDollarSign,
  Check,
  CheckCircle2,
  Flame,
  MessageCircle,
  RefreshCcw,
  Save,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { isDemoAnalysis, isMockAnalysis } from "../services/mockRoast";
import {
  roastModeLabels,
  type AnalysisDepth,
  type RoastInput,
  type RoastMode,
  type RoastResult,
} from "../types/roast";
import { formatFullReport, formatOffer, formatThreadsPosts } from "../utils/formatReport";
import { AIEngineStatus } from "./AIEngineStatus";
import { ClarificationBox } from "./ClarificationBox";
import { CopyButton } from "./CopyButton";
import { ResultSectionNav, type ResultSection } from "./ResultSectionNav";
import { StepIndicator } from "./StepIndicator";
import { ThreadsPosts } from "./ThreadsPosts";
import { WeakPointsGrid } from "./WeakPointsGrid";

type ResultViewProps = {
  input: RoastInput;
  result: RoastResult;
  saved: boolean;
  lastAnalysisTime?: string;
  onBackToMode: () => void;
  onNewRoast: () => void;
  onSave: () => void;
  onToneAdjust: (mode: RoastMode, analysisDepth?: AnalysisDepth) => void;
  onRefine: (clarificationText: string) => void;
  isRefining: boolean;
};

const actionButtons: { label: string; mode: RoastMode; depth?: AnalysisDepth; Icon: typeof Wand2 }[] = [
  { label: "Сделать мягче", mode: "mentor", depth: "fast", Icon: Wand2 },
  { label: "Сделать жестче", mode: "investor", depth: "fast", Icon: Flame },
  { label: "Больше про бизнес", mode: "investor", depth: "deep", Icon: BadgeDollarSign },
  { label: "Больше про Threads", mode: "threads_bro", depth: "launch", Icon: MessageCircle },
  { label: "Переписать оффер еще раз", mode: "mentor", depth: "deep", Icon: Wand2 },
  { label: "Сгенерировать план запуска", mode: "threads_bro", depth: "launch", Icon: MessageCircle },
];

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function ResultView({
  input,
  result,
  saved,
  lastAnalysisTime,
  onBackToMode,
  onNewRoast,
  onSave,
  onToneAdjust,
  onRefine,
  isRefining,
}: ResultViewProps) {
  const [activeSection, setActiveSection] = useState<ResultSection>("audit");
  const demo = isDemoAnalysis(result);
  const mock = isMockAnalysis(result);
  const firstFix = result.firstFix || result.twoHourFixes[0] || "Переписать первый экран.";
  const confidence = result.confidence ?? 64;
  const version = result.version || 1;
  const clarificationCount = result.clarificationCount || 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[1220px] px-4 py-8 pb-[calc(9rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBackToMode}
            className="inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#20262b]/48 transition hover:text-[#111416]"
          >
            <ArrowLeft className="h-4 w-4" />
            Изменить режим
          </button>
          <StepIndicator current="audit" />
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={formatFullReport(input, result)} label="Скопировать разбор" />
          <CopyButton value={formatThreadsPosts(result)} label="Threads-посты" />
          <motion.button
            type="button"
            onClick={onSave}
            disabled={saved}
            whileHover={!saved ? { scale: 1.02 } : undefined}
            whileTap={!saved ? { scale: 0.98 } : undefined}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/55 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#20262b] shadow-[0_14px_34px_rgba(16,20,24,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] transition disabled:opacity-45"
          >
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Сохранено" : "Сохранить"}
          </motion.button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="dark-lab-bg overflow-hidden rounded-[2.5rem] p-5 text-white shadow-[0_44px_120px_rgba(16,20,24,0.22)] sm:p-7"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="technical-label-dark">Разбор готов</span>
            {demo ? (
              <span className="rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/56">
                Demo analysis
              </span>
            ) : null}
            {!demo && mock ? (
              <span className="rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/56">
                Mock analysis
              </span>
            ) : null}
            <span className="rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/56">
              {roastModeLabels[input.roastMode]}
            </span>
            <span className="rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/56">
              Версия {version} · {clarificationCount ? `учтено ${clarificationCount} уточнение` : "первичный разбор"}
            </span>
          </div>

          <div className="mt-8 grid gap-7 lg:grid-cols-[220px_1fr] lg:items-end">
            <div>
              <div className="font-editorial text-[6.4rem] font-medium leading-[0.78] tracking-[-0.08em] text-white">
                {result.score.toFixed(1)}
              </div>
              <div className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-white/36">/ 10</div>
              <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/12">
                <motion.div
                  className="h-full rounded-full bg-white/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, result.score * 10)}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
            <div>
              <h1 className="font-editorial text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl">
                {result.projectName || input.projectName || "Проект без названия"}
              </h1>
              <p className="mt-5 max-w-2xl text-2xl font-medium leading-tight tracking-[-0.04em] text-white/86">
                {result.shortVerdict}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 border-t border-white/10 pt-5 md:grid-cols-3">
            <SummaryItem label="Главная проблема" value={result.mainProblem} />
            <SummaryItem label="Исправить первым" value={firstFix} />
            <SummaryItem label="Новый оффер" value={result.improvedOffer.headline} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/54">
            <span>Confidence: {result.confidenceLabel || `${confidence}% — контекста достаточно`}</span>
          </div>
        </motion.div>

        <AIEngineStatus input={input} result={result} lastAnalysisTime={lastAnalysisTime} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.78fr]">
        <ClarificationBox isRefining={isRefining} onRefine={onRefine} />
        <AssumptionsBlock result={result} />
      </div>

      <div className="mt-6">
        <ResultSectionNav active={activeSection} onChange={setActiveSection} />
      </div>

      <div className="mt-5">
        <AnimatePresence mode="wait">
          {activeSection === "audit" ? (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"
            >
              <article className="liquid-panel rounded-[2.2rem] p-6">
                <p className="technical-label">WHY USERS WON'T BUY</p>
                <ol className="mt-6 space-y-4">
                  {result.whyUsersWillNotBuy.map((item, index) => (
                    <li key={`${item}-${index}`} className="grid grid-cols-[48px_1fr] gap-4 border-t border-black/10 pt-4">
                      <span className="font-editorial text-3xl tracking-[-0.06em] text-[#101418]/46">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-7 text-[#20262b]/66">{item}</span>
                    </li>
                  ))}
                </ol>
              </article>
              <section>
                <p className="technical-label mb-3">WEAK POINTS</p>
                <WeakPointsGrid weakPoints={result.weakPoints} />
              </section>
            </motion.div>
          ) : null}

          {activeSection === "fix" ? (
            <motion.div
              key="fix"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-5 lg:grid-cols-[1fr_0.9fr]"
            >
              <article className="liquid-panel rounded-[2.2rem] p-6">
                <p className="technical-label">2-HOUR FIXES</p>
                <h2 className="font-editorial mt-2 text-4xl font-medium tracking-[-0.055em] text-[#101418]">
                  Исправить сегодня
                </h2>
                <ul className="mt-7 grid gap-3">
                  {result.twoHourFixes.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="group flex gap-4 rounded-[1.4rem] border border-black/10 bg-white/36 p-4 transition hover:bg-white/64"
                    >
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-black/18 text-[#20262b]/54 transition group-hover:bg-[#101418] group-hover:text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm leading-7 text-[#20262b]/66">{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-[2.2rem] border border-black/10 bg-[#f8f8f6]/78 p-6 shadow-[0_34px_90px_rgba(16,20,24,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="technical-label">IMPROVED OFFER</p>
                    <h2 className="font-editorial mt-5 text-4xl font-medium leading-tight tracking-[-0.055em] text-[#101418]">
                      {result.improvedOffer.headline}
                    </h2>
                  </div>
                  <CopyButton value={formatOffer(result)} label="Скопировать оффер" />
                </div>
                <p className="mt-6 text-lg leading-8 text-[#20262b]/68">{result.improvedOffer.subheadline}</p>
                <p className="mt-5 border-t border-black/10 pt-5 text-sm leading-7 text-[#20262b]/58">
                  {result.improvedOffer.shortDescription}
                </p>
                <span className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#101418] px-6 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(16,20,24,0.18)]">
                  {result.improvedOffer.cta}
                </span>
              </article>
            </motion.div>
          ) : null}

          {activeSection === "threads" ? (
            <motion.div
              key="threads"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ThreadsPosts result={result} />
            </motion.div>
          ) : null}

          {activeSection === "sprint" ? (
            <motion.section
              key="sprint"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="liquid-panel rounded-[2.2rem] p-6"
            >
              <p className="technical-label">NEXT SPRINT</p>
              <h2 className="font-editorial mt-2 text-4xl font-medium tracking-[-0.055em] text-[#101418]">
                План на один день
              </h2>
              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr_1fr_1.2fr]">
                {[
                  ["30 min", result.nextSprint.thirtyMinutes],
                  ["1 hour", result.nextSprint.oneHour],
                  ["2 hours", result.nextSprint.twoHours],
                ].map(([title, items], index) => (
                  <div key={title as string} className="relative border-l border-black/14 pl-5">
                    <span className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-[#101418]" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#20262b]/48">{title as string}</h3>
                    <ul className="mt-5 space-y-3">
                      {(items as string[]).map((item) => (
                        <li key={`${item}-${index}`} className="text-sm leading-7 text-[#20262b]/62">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="rounded-[1.8rem] bg-[#101418] p-5 text-white shadow-[0_28px_70px_rgba(16,20,24,0.18)]">
                  <p className="technical-label-dark">LAUNCH MOVE</p>
                  <p className="mt-5 text-base font-medium leading-7 text-white/82">
                    {result.nextSprint.todayLaunchMove}
                  </p>
                </div>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="liquid-panel-dark mt-6 rounded-[2rem] p-3 text-white">
        <p className="technical-label-dark px-2 pb-3">Что сделать дальше?</p>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {actionButtons.map(({ label, mode, depth, Icon }) => (
              <motion.button
                key={label}
                type="button"
                onClick={() => onToneAdjust(mode, depth)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white/72 transition hover:bg-white/[0.1] hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </motion.button>
            ))}
          </div>
          <motion.button
            type="button"
            onClick={onNewRoast}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#101418]"
          >
            <RefreshCcw className="h-4 w-4" />
            Разнести еще раз
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}

function AssumptionsBlock({ result }: { result: RoastResult }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="liquid-panel rounded-[2.2rem] p-5 sm:p-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <p className="technical-label">AI BASIS</p>
          <h2 className="font-editorial mt-3 text-3xl font-medium tracking-[-0.055em] text-[#101418]">
            На чем основан разбор
          </h2>
        </div>
        <span className="rounded-full border border-black/10 bg-white/44 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#20262b]/48">
          {open ? "Скрыть" : "Показать"}
        </span>
      </button>

      {open ? (
        <div className="mt-5 space-y-5">
          <MiniList title="Предположения AI" items={result.assumptions} />
          <MiniList title="Что AI мог понять неправильно" items={result.misunderstoodRisk} />
          <MiniList title="Что стоит уточнить" items={result.questionsToClarify} />
        </div>
      ) : null}
    </section>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-t border-black/10 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#20262b]/42">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${item}-${index}`} className="grid grid-cols-[24px_1fr] gap-3 text-sm leading-6 text-[#20262b]/62">
            <span className="text-[#20262b]/34">{String(index + 1).padStart(2, "0")}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.055] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/36">{label}</p>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/72">{value}</p>
    </div>
  );
}

