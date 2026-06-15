import { Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { RoastResult } from "../types/roast";
import { CopyButton } from "./CopyButton";

type ShareCardPreviewProps = {
  result: RoastResult;
};

export function ShareCardPreview({ result }: ShareCardPreviewProps) {
  const [shareState, setShareState] = useState("");
  const firstFix = result.firstFix || result.twoHourFixes[0] || "Переписать первый экран.";
  const text = useMemo(
    () =>
      [
        "Roast My App разобрал мой проект",
        "",
        `${result.projectName}: ${result.score.toFixed(1)}/10`,
        `Главная проблема: ${result.mainProblem}`,
        `Первый фикс: ${firstFix}`,
      ].join("\n"),
    [firstFix, result.mainProblem, result.projectName, result.score],
  );

  const share = async () => {
    if (!("share" in navigator)) {
      setShareState("Web Share недоступен");
      window.setTimeout(() => setShareState(""), 1800);
      return;
    }

    try {
      await navigator.share({
        title: `Roast My App — ${result.projectName}`,
        text,
      });
      setShareState("Готово");
    } catch {
      setShareState("Не поделились");
    } finally {
      window.setTimeout(() => setShareState(""), 1800);
    }
  };

  return (
    <section className="mt-6 liquid-panel rounded-[2.2rem] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="technical-label">SHARE CARD</p>
          <h2 className="apple-heading font-apple-display mt-2 text-4xl text-[#101418]">
            Карточка для скрина
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={text} label="Скопировать текст карточки" />
          <button
            type="button"
            onClick={() => void share()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/46 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#20262b]/64 transition hover:bg-white/78"
          >
            <Share2 className="h-4 w-4" />
            {shareState || "Поделиться"}
          </button>
        </div>
      </div>

      <article className="mt-6 overflow-hidden rounded-[2rem] border border-black/10 bg-[#101418] p-6 text-white shadow-[0_34px_90px_rgba(16,20,24,0.16)]">
        <div className="flex items-center justify-between gap-4">
          <p className="technical-label-dark">Roast My App разобрал мой проект</p>
          <span className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/58">
            RoastMyApp
          </span>
        </div>
        <div className="mt-9 grid gap-7 lg:grid-cols-[170px_1fr] lg:items-end">
          <div>
            <p className="font-apple-display text-[5.2rem] font-medium leading-[0.78] tracking-[-0.08em]">
              {result.score.toFixed(1)}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/36">/ 10</p>
          </div>
          <div>
            <h3 className="apple-heading font-apple-display text-4xl">
              {result.projectName}
            </h3>
            <p className="mt-5 text-sm leading-7 text-white/64">{result.mainProblem}</p>
            <p className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/72">
              Первый фикс: {firstFix}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
