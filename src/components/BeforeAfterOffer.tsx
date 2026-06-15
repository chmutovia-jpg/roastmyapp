import type { RoastInput, RoastResult } from "../types/roast";
import { formatOffer } from "../utils/formatReport";
import { CopyButton } from "./CopyButton";

type BeforeAfterOfferProps = {
  input: RoastInput;
  result: RoastResult;
  onSimplify: () => void;
  onCompareVersions?: () => void;
};

export function BeforeAfterOffer({ input, result, onSimplify, onCompareVersions }: BeforeAfterOfferProps) {
  const before = input.landingText.trim() || input.ideaDescription.trim() || "Исходный оффер не был указан явно.";

  return (
    <section className="mt-5 liquid-panel rounded-[2.2rem] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="technical-label">BEFORE / AFTER OFFER</p>
          <h2 className="apple-heading font-apple-display mt-2 text-4xl text-[#101418]">
            Проект стал понятнее
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={formatOffer(result)} label="Скопировать новый оффер" />
          <button
            type="button"
            onClick={onCompareVersions}
            disabled={!onCompareVersions}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white/46 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#20262b]/64 transition hover:bg-white/78 disabled:opacity-45"
          >
            Сравнить версии
          </button>
          <button
            type="button"
            onClick={onSimplify}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white/46 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#20262b]/64 transition hover:bg-white/78"
          >
            Сделать еще проще
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.6rem] border border-black/10 bg-white/36 p-5">
          <p className="technical-label">Было</p>
          <p className="mt-4 line-clamp-6 text-sm leading-7 text-[#20262b]/58">{before}</p>
        </article>
        <article className="rounded-[1.6rem] border border-black/10 bg-[#101418] p-5 text-white">
          <p className="technical-label-dark">Стало</p>
          <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.04em]">
            {result.improvedOffer.headline}
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/68">{result.improvedOffer.subheadline}</p>
          <span className="mt-5 inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#101418]">
            {result.improvedOffer.cta}
          </span>
        </article>
      </div>
    </section>
  );
}
