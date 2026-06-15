import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Sparkles } from "lucide-react";
import type { AcquisitionSource, ProjectWorkspace, UsageStats, UserProfile } from "../types/roast";

type ProfilePanelProps = {
  profile: UserProfile | null;
  usageStats: UsageStats;
  workspaces: ProjectWorkspace[];
  onBack: () => void;
  onCreateProfile: () => void;
  onUpdateSource: (source: AcquisitionSource) => void;
  onClearProfile: () => void;
  onEarlyAccess: () => void;
};

const sourceLabels: Record<AcquisitionSource, string> = {
  threads: "Threads",
  friends: "Друзья",
  search: "Поиск",
  telegram: "Telegram",
  youtube: "YouTube",
  other: "Другое",
};

const sources = Object.keys(sourceLabels) as AcquisitionSource[];

export function ProfilePanel({
  profile,
  usageStats,
  workspaces,
  onBack,
  onCreateProfile,
  onUpdateSource,
  onClearProfile,
  onEarlyAccess,
}: ProfilePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[1180px] px-4 py-10 pb-[calc(9rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#20262b]/48 transition hover:text-[#111416]"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </button>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <section className="liquid-panel rounded-[2.4rem] p-7">
          <p className="technical-label">LOCAL PROFILE</p>
          <h1 className="apple-heading font-apple-display mt-4 text-5xl text-[#101418]">
            Профиль
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#20262b]/58">
            Сейчас профиль хранится локально в браузере. Позже добавим облачную синхронизацию.
          </p>

          {profile ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Info label="Email" value={profile.email} />
              <Info label="Имя" value={profile.name || "Не указано"} />
              <Info
                label="Источник"
                value={
                  profile.acquisitionSource === "other" && profile.acquisitionSourceOther
                    ? profile.acquisitionSourceOther
                    : sourceLabels[profile.acquisitionSource]
                }
              />
              <Info label="Early access" value={profile.wantsEarlyAccess ? "Да" : "Пока нет"} />
            </div>
          ) : (
            <div className="mt-8 rounded-[1.8rem] border border-black/10 bg-white/44 p-5">
              <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#101418]">
                Профиля пока нет
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#20262b]/58">
                Первый разбор можно сделать без регистрации. Профиль нужен, чтобы сохранить проект и версии.
              </p>
              <button type="button" onClick={onCreateProfile} className="lab-btn-dark mt-5 min-h-11 px-5 text-sm font-semibold">
                Создать профиль
              </button>
            </div>
          )}

          {profile ? (
            <div className="mt-8 border-t border-black/10 pt-6">
              <p className="technical-label mb-3">Изменить источник</p>
              <div className="flex flex-wrap gap-2">
                {sources.map((source) => {
                  const active = profile.acquisitionSource === source;
                  return (
                    <button
                      key={source}
                      type="button"
                      onClick={() => onUpdateSource(source)}
                      className={[
                        "min-h-10 rounded-full px-4 text-xs font-semibold transition",
                        active
                          ? "bg-[#101418] text-white shadow-[0_16px_36px_rgba(16,20,24,0.16)]"
                          : "border border-black/10 bg-white/42 text-[#20262b]/62 hover:bg-white/72",
                      ].join(" ")}
                    >
                      {sourceLabels[source]}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={onClearProfile}
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/42 px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#20262b]/56 transition hover:bg-white/72"
              >
                <LogOut className="h-4 w-4" />
                Очистить локальный профиль
              </button>
            </div>
          ) : null}
        </section>

        <aside className="space-y-5">
          <section className="dark-lab-bg rounded-[2.2rem] p-6 text-white">
            <p className="technical-label-dark">USAGE</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric label="Анонимные" value={usageStats.anonymousAnalyses} />
              <Metric label="С профилем" value={usageStats.registeredAnalyses} />
              <Metric label="Уточнения" value={usageStats.clarifications} />
              <Metric label="Проекты" value={workspaces.length} />
            </div>
          </section>

          <section className="liquid-panel rounded-[2.2rem] p-6">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-white/52">
              <Sparkles className="h-5 w-5 text-[#20262b]/56" />
            </div>
            <p className="technical-label mt-5">PRO SOON</p>
            <h2 className="apple-heading font-apple-display mt-3 text-3xl text-[#101418]">
              Хочешь ранний доступ?
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#20262b]/58">
              Отметим интерес локально и позже превратим это в нормальный waitlist.
            </p>
            <button type="button" onClick={onEarlyAccess} className="lab-btn-dark mt-5 min-h-11 px-5 text-sm font-semibold">
              Хочу ранний доступ
            </button>
          </section>
        </aside>
      </div>
    </motion.section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white/38 p-4">
      <p className="technical-label">{label}</p>
      <p className="mt-3 text-sm font-semibold text-[#20262b]/70">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.06] p-4">
      <p className="font-apple-display text-4xl tracking-[-0.06em]">{value}</p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">{label}</p>
    </div>
  );
}
