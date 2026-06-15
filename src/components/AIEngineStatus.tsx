import { Activity, Gauge } from "lucide-react";
import type { AnalysisMeta, RoastInput, RoastResult } from "../types/roast";
import { analysisDepthLabels, roastModeLabels } from "../types/roast";
import { calculateInputQuality } from "../utils/calculateInputQuality";

type AIEngineStatusProps = {
  input: RoastInput;
  result?: RoastResult | null;
  meta?: AnalysisMeta | null;
  lastAnalysisTime?: string;
};

export function AIEngineStatus({ input, meta, lastAnalysisTime }: AIEngineStatusProps) {
  const quality = calculateInputQuality(input);
  const source = meta?.source || "mock";
  const context = Math.max(12, quality.score);

  return (
    <div className="rounded-[1.8rem] border border-black/10 bg-white/42 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-2xl">
      <div className="mb-5 flex items-center justify-between">
        <p className="technical-label">ROAST ENGINE</p>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#101418] text-white">
          <Activity className="h-4 w-4" />
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <StatusRow label="Status" value={source === "openai" ? "Real AI mode" : "Demo analysis"} />
        {meta?.reason && import.meta.env.DEV ? <StatusRow label="Reason" value={meta.reason} /> : null}
        <StatusRow label="Signal" value={quality.level === "weak" ? "Weak" : quality.level === "strong" ? "Strong" : "Medium"} />
        <StatusRow label="Mode" value={roastModeLabels[input.roastMode]} />
        <StatusRow label="Depth" value={analysisDepthLabels[input.analysisDepth]} />
        <StatusRow label="Last" value={lastAnalysisTime || "еще нет"} />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-[#20262b]/42">
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-3 w-3" />
            Context
          </span>
          <span>{context}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-black/8">
          <div className="h-full rounded-full bg-[#101418]" style={{ width: `${context}%` }} />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-black/8 pt-3">
      <span className="text-[#20262b]/42">{label}</span>
      <span className="truncate text-right font-semibold text-[#101418]">{value}</span>
    </div>
  );
}
