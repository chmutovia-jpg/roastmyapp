import type { AnalysisMeta } from "../types/roast";

type AnalysisSourceBadgeProps = {
  meta: AnalysisMeta;
  compact?: boolean;
  dark?: boolean;
};

const isDev = import.meta.env.DEV;

export function AnalysisSourceBadge({ meta, compact = false, dark = false }: AnalysisSourceBadgeProps) {
  const label = meta.source === "openai" ? "AI analysis" : compact ? "Demo" : "Demo analysis";
  const reason = meta.reason ? meta.reason.replaceAll("_", " ") : "";
  const title = [
    `AI source: ${meta.source}`,
    meta.reason ? `Reason: ${meta.reason}` : "",
    meta.model ? `Model: ${meta.model}` : "",
    typeof meta.durationMs === "number" ? `Duration: ${meta.durationMs}ms` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <span
      title={title}
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
        dark
          ? "border border-white/12 bg-white/[0.07] text-white/58"
          : "border border-black/10 bg-white/46 text-[#20262b]/58",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          meta.source === "openai"
            ? dark
              ? "bg-white/80"
              : "bg-[#101418]"
            : dark
              ? "bg-white/42"
              : "bg-[#20262b]/36",
        ].join(" ")}
      />
      {label}
      {isDev && reason && !compact ? <span className="normal-case tracking-normal opacity-70">({reason})</span> : null}
    </span>
  );
}
