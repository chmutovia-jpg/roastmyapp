import { motion } from "framer-motion";
import { ArrowLeft, Archive, ExternalLink, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  roastModeLabels,
  stageLabels,
  type ProjectStage,
  type ProjectWorkspace,
  type ProjectVersion,
  type RoastHistoryItem,
} from "../types/roast";

type HistoryPanelProps = {
  history: RoastHistoryItem[];
  workspaces: ProjectWorkspace[];
  onOpen: (item: RoastHistoryItem) => void;
  onDelete: (id: string) => void;
  onRepeat: (item: RoastHistoryItem) => void;
  onOpenWorkspace: (workspace: ProjectWorkspace, version?: ProjectVersion) => void;
  onDeleteWorkspace: (id: string) => void;
  onNewWorkspaceVersion: (workspace: ProjectWorkspace) => void;
  onBack: () => void;
  onStart: () => void;
};

type Filter = "all" | ProjectStage | "low_score";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "idea", label: "Идеи" },
  { id: "mvp", label: "MVP" },
  { id: "landing", label: "Лендинги" },
  { id: "sales", label: "Продажи" },
  { id: "low_score", label: "Score < 6" },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const latestVersion = (workspace: ProjectWorkspace) => workspace.versions[workspace.versions.length - 1];

export function HistoryPanel({
  history,
  workspaces,
  onOpen,
  onDelete,
  onRepeat,
  onOpenWorkspace,
  onDeleteWorkspace,
  onNewWorkspaceVersion,
  onBack,
  onStart,
}: HistoryPanelProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const hasItems = workspaces.length > 0 || history.length > 0;

  const filteredWorkspaces = useMemo(() => {
    if (filter === "all") return workspaces;
    if (filter === "low_score") return workspaces.filter((item) => latestVersion(item).result.score < 6);
    return workspaces.filter((item) => latestVersion(item).input.stage === filter);
  }, [filter, workspaces]);

  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;
    if (filter === "low_score") return history.filter((item) => item.result.score < 6);
    return history.filter((item) => item.input.stage === filter);
  }, [filter, history]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[1220px] px-4 py-10 pb-[calc(9rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#20262b]/48 transition hover:text-[#111416]"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </button>

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="technical-label">PROJECT WORKSPACE</p>
          <h1 className="apple-heading font-apple-display mt-3 text-4xl text-[#101418] sm:text-6xl">
            Библиотека проектов
          </h1>
        </div>
        <motion.button
          type="button"
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="lab-btn-dark inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          {hasItems ? "Разнести новый проект" : "Разнести первый проект"}
        </motion.button>
      </div>

      {!hasItems ? (
        <div className="liquid-panel rounded-[2.3rem] p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-black/10 bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
            <Archive className="h-7 w-7 text-[#20262b]/45" />
          </div>
          <p className="apple-heading font-apple-display mx-auto mt-7 max-w-2xl text-4xl text-[#101418]">
            Тут будут проекты, которые AI уже успел морально травмировать.
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#20262b]/58">
            История хранится только в localStorage этого браузера.
          </p>
          <motion.button
            type="button"
            onClick={onStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lab-btn-dark mt-7 inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Разнести первый проект
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((item) => {
              const active = item.id === filter;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={[
                    "min-h-10 shrink-0 rounded-full px-4 text-xs font-semibold transition",
                    active
                      ? "bg-[#101418] text-white shadow-[0_14px_34px_rgba(16,20,24,0.14)]"
                      : "border border-black/10 bg-white/42 text-[#20262b]/60 hover:bg-white/72",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {filteredWorkspaces.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredWorkspaces.map((workspace) => {
                const latest = latestVersion(workspace);
                return (
                  <article
                    key={workspace.id}
                    className="liquid-panel rounded-[2rem] p-5 transition duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="technical-label">{stageLabels[latest.input.stage]}</span>
                          <span className="rounded-full border border-black/10 bg-white/44 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#20262b]/46">
                            {workspace.source === "demo" ? "Demo" : "User"}
                          </span>
                        </div>
                        <h2 className="mt-2 truncate text-2xl font-semibold tracking-[-0.04em] text-[#101418]">
                          {workspace.projectName || "Проект без названия"}
                        </h2>
                      </div>
                      <div className="font-apple-display text-5xl leading-none tracking-[-0.06em] text-[#101418]">
                        {latest.result.score.toFixed(1)}
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-2 text-sm leading-7 text-[#20262b]/60">
                      {latest.result.mainProblem}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-[#20262b]/46">
                      <span>{formatDate(workspace.updatedAt)}</span>
                      <span>•</span>
                      <span>{roastModeLabels[latest.input.roastMode]}</span>
                      <span>•</span>
                      <span>{workspace.versions.length} верс.</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenWorkspace(workspace)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#101418] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:scale-[1.02]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Открыть
                      </button>
                      <button
                        type="button"
                        onClick={() => onNewWorkspaceVersion(workspace)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/46 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#20262b]/64 transition hover:bg-white/78"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Новая версия
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteWorkspace(workspace.id)}
                        className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/34 text-[#20262b]/56 transition hover:bg-white/80 hover:text-[#101418]"
                        aria-label="Удалить проект"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {filteredHistory.length ? (
            <section className="mt-8">
              <p className="technical-label mb-3">LEGACY HISTORY</p>
              <div className="grid gap-3 md:grid-cols-2">
                {filteredHistory.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[1.8rem] border border-black/10 bg-white/34 p-5 shadow-[0_24px_70px_rgba(16,20,24,0.07)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="technical-label">{stageLabels[item.input.stage]}</p>
                        <h2 className="mt-2 truncate text-2xl font-semibold tracking-[-0.04em] text-[#101418]">
                          {item.result.projectName || item.input.projectName || "Проект без названия"}
                        </h2>
                      </div>
                      <div className="font-apple-display text-5xl leading-none tracking-[-0.06em] text-[#101418]">
                        {item.result.score.toFixed(1)}
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-2 text-sm leading-7 text-[#20262b]/60">
                      {item.result.mainProblem}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-[#20262b]/46">
                      <span>{formatDate(item.createdAt)}</span>
                      <span>•</span>
                      <span>{roastModeLabels[item.input.roastMode]}</span>
                      <span>•</span>
                      <span>v{item.result.version || item.version || 1}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onOpen(item)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#101418] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:scale-[1.02]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Открыть
                      </button>
                      <button
                        type="button"
                        onClick={() => onRepeat(item)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/46 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#20262b]/64 transition hover:bg-white/78"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Повторить
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/34 text-[#20262b]/56 transition hover:bg-white/80 hover:text-[#101418]"
                        aria-label="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </motion.section>
  );
}
