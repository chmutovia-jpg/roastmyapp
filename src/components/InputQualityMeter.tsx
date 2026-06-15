import { AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import type { RoastInput } from "../types/roast";
import {
  calculateInputQuality,
  getInputQualityCopy,
  getInputQualityTitle,
} from "../utils/calculateInputQuality";

type SuggestionTarget = "audience" | "action" | "landing" | "price" | "screenshot" | "idea";

type InputQualityMeterProps = {
  input: RoastInput;
  onSuggestionClick?: (target: SuggestionTarget) => void;
};

function getSuggestionTarget(text: string): SuggestionTarget {
  if (text.includes("кому")) return "audience";
  if (text.includes("должен")) return "action";
  if (text.includes("первого экрана")) return "landing";
  if (text.includes("Цена")) return "price";
  if (text.includes("скрин")) return "screenshot";
  return "idea";
}

export function InputQualityMeter({ input, onSuggestionClick }: InputQualityMeterProps) {
  const quality = calculateInputQuality(input);
  const Icon = quality.level === "weak" ? AlertCircle : CheckCircle2;

  return (
    <div className="rounded-[1.8rem] border border-black/10 bg-white/48 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="technical-label">DRAFT QUALITY</p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#101418]">
            {getInputQualityTitle(quality.level)}
          </h3>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/58">
          <Icon className="h-4 w-4 text-[#20262b]/62" />
        </span>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/8">
        <motion.div
          className="h-full rounded-full bg-[#101418]"
          initial={{ width: 0 }}
          animate={{ width: `${quality.score}%` }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-[#20262b]/42">
        <span>Signal</span>
        <span>{quality.score}%</span>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#20262b]/60">{getInputQualityCopy(quality.level)}</p>
      {quality.level === "weak" ? (
        <p className="mt-2 text-xs leading-5 text-[#20262b]/42">
          Можно разнести и так, но чем больше контекста — тем больнее и полезнее.
        </p>
      ) : null}

      {quality.suggestions.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {quality.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick?.(getSuggestionTarget(suggestion))}
              className="rounded-full border border-black/10 bg-white/42 px-3 py-2 text-xs font-semibold text-[#20262b]/64 transition hover:bg-white/78 hover:text-[#101418]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
