import type { RoastResult } from "../types/roast";
import { formatLaunchPack, formatThreadsPosts } from "../utils/formatReport";
import { CopyButton } from "./CopyButton";

type LaunchPackProps = {
  result: RoastResult;
};

export function LaunchPack({ result }: LaunchPackProps) {
  const pack = result.launchPack;
  if (!pack) return null;

  const all = [
    "Threads-посты:",
    formatThreadsPosts(result),
    "",
    "Launch Pack:",
    formatLaunchPack(result),
  ].join("\n");

  return (
    <section className="mt-6 liquid-panel rounded-[2.2rem] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="technical-label">LAUNCH PACK</p>
          <h2 className="apple-heading font-apple-display mt-2 text-4xl text-[#101418]">
            Не просто разбор. Мини-набор для запуска.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#20262b]/58">
            Мини-набор, чтобы не просто получить разбор, а сразу показать проект людям.
          </p>
        </div>
        <CopyButton value={all} label="Скопировать всё" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <article className="rounded-[1.6rem] border border-black/10 bg-white/38 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="technical-label">TELEGRAM POST</p>
            <CopyButton value={pack.telegramPost} label="Telegram" compact />
          </div>
          <p className="mt-4 text-sm leading-7 text-[#20262b]/64">{pack.telegramPost}</p>
        </article>

        <article className="rounded-[1.6rem] border border-black/10 bg-white/38 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="technical-label">PROFILE BIO</p>
            <CopyButton value={pack.profileBio} label="Bio" compact />
          </div>
          <p className="mt-4 text-sm leading-7 text-[#20262b]/64">{pack.profileBio}</p>
          <p className="technical-label mt-5">LANDING HEADLINE</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#101418]">{pack.landingHeadline}</p>
        </article>
      </div>

      <article className="mt-4 rounded-[1.6rem] border border-black/10 bg-white/38 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="technical-label">Комментарии для Threads</p>
          <CopyButton value={pack.replyComments.map((item) => `- ${item}`).join("\n")} label="Комментарии" compact />
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {pack.replyComments.map((comment, index) => (
            <p key={`${comment}-${index}`} className="rounded-[1.1rem] border border-black/10 bg-white/42 p-3 text-sm leading-6 text-[#20262b]/62">
              {comment}
            </p>
          ))}
        </div>
      </article>
    </section>
  );
}
