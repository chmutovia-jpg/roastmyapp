import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeDollarSign,
  Code2,
  Coffee,
  HeartHandshake,
  MessageCircle,
  ScanLine,
} from "lucide-react";
import {
  analysisDepthLabels,
  roastModeLabels,
  stageLabels,
  type AnalysisDepth,
  type RoastInput,
  type RoastMode,
} from "../types/roast";
import { AIEngineStatus } from "./AIEngineStatus";
import { StepIndicator } from "./StepIndicator";

type RoastModeSelectorProps = {
  input: RoastInput;
  selected: RoastMode;
  onSelect: (mode: RoastMode) => void;
  onDepthChange: (depth: AnalysisDepth) => void;
  onAnalyze: () => void;
  onBack: () => void;
};

const modes: {
  id: RoastMode;
  name: string;
  description: string;
  Icon: typeof HeartHandshake;
}[] = [
  {
    id: "mentor",
    name: "Mentor",
    description: "Честно, спокойно, без попытки добить автора.",
    Icon: HeartHandshake,
  },
  {
    id: "investor",
    name: "Investor",
    description: "Деньги, рынок, удержание и неприятные вопросы.",
    Icon: BadgeDollarSign,
  },
  {
    id: "tired_user",
    name: "Tired User",
    description: "Почему человек закроет страницу через 5 секунд.",
    Icon: Coffee,
  },
  {
    id: "threads_bro",
    name: "Threads Bro",
    description: "Как превратить проект в живой build-in-public пост.",
    Icon: MessageCircle,
  },
  {
    id: "codex_reviewer",
    name: "Codex Review",
    description: "UX, структура MVP, пустые состояния и первый запуск.",
    Icon: Code2,
  },
];

const depths: AnalysisDepth[] = ["fast", "deep", "launch"];

export function RoastModeSelector({
  input,
  selected,
  onSelect,
  onDepthChange,
  onAnalyze,
  onBack,
}: RoastModeSelectorProps) {
  const selectedMode = modes.find((mode) => mode.id === selected) ?? modes[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-[1220px] flex-col justify-center px-4 py-10 pb-[calc(9rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#20262b]/48 transition hover:text-[#111416]"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к сигналу
      </button>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <StepIndicator current="mode" />
          <h1 className="font-editorial mt-5 text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#101418] sm:text-6xl">
            Выбери, кто будет разносить.
          </h1>
          <p className="mt-5 max-w-md text-base leading-8 text-[#20262b]/58">
            Тон меняет угол атаки. Данные уже есть, теперь выбираем глубину и температуру.
          </p>

          <div className="mt-5 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-black/10 bg-white/44 px-4 py-2 text-xs font-semibold text-[#20262b]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
            <span className="technical-label">PROJECT</span>
            <span className="max-w-[260px] truncate text-[#101418]">
              {input.projectName.trim() || "Проект без названия"}
            </span>
            <span className="text-[#20262b]/34">/</span>
            <span>{stageLabels[input.stage]}</span>
          </div>

          <div className="liquid-panel mt-8 rounded-[2.4rem] p-4 sm:p-5">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {modes.map(({ id, name, Icon }) => {
                const active = selected === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    layout
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onSelect(id)}
                    className={[
                      "relative min-h-14 overflow-hidden rounded-full px-4 text-left transition",
                      active
                        ? "bg-[#101418] text-white shadow-[0_22px_54px_rgba(16,20,24,0.18),inset_0_1px_0_rgba(255,255,255,0.16)]"
                        : "border border-black/8 bg-white/40 text-[#20262b]/62 hover:bg-white/72",
                    ].join(" ")}
                  >
                    {active ? (
                      <motion.span
                        layoutId="mode-active"
                        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_45%)]"
                      />
                    ) : null}
                    <span className="relative flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-[0.12em]">{name}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[2rem] border border-black/10 bg-white/46 p-5">
              <p className="technical-label">ACTIVE LENS</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#101418]">
                {roastModeLabels[selectedMode.id]}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#20262b]/60">
                {selectedMode.description}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[2rem] border border-black/10 bg-white/42 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
            <p className="technical-label mb-3">ANALYSIS DEPTH</p>
            <div className="flex flex-wrap gap-2">
              {depths.map((depth) => {
                const active = input.analysisDepth === depth;
                return (
                  <motion.button
                    key={depth}
                    type="button"
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onDepthChange(depth)}
                    className={[
                      "min-h-10 rounded-full px-4 text-xs font-semibold transition",
                      active
                        ? "bg-[#101418] text-white shadow-[0_16px_36px_rgba(16,20,24,0.16),inset_0_1px_0_rgba(255,255,255,0.14)]"
                        : "border border-black/10 bg-white/42 text-[#20262b]/62 hover:bg-white/72",
                    ].join(" ")}
                  >
                    {analysisDepthLabels[depth]}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <AIEngineStatus input={input} />
          <motion.button
            type="button"
            onClick={onAnalyze}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lab-btn-dark inline-flex min-h-14 w-full items-center justify-center gap-3 px-6 text-sm font-semibold"
          >
            <ScanLine className="h-4 w-4" />
            Получить разбор
          </motion.button>
        </aside>
      </div>
    </motion.section>
  );
}
