import { Gauge } from "lucide-react";
import { GlassCard } from "./GlassCard";

type ScoreCardProps = {
  score: number;
  caption: string;
};

export function ScoreCard({ score, caption }: ScoreCardProps) {
  const percent = Math.max(0, Math.min(100, score * 10));

  return (
    <GlassCard tone="dark" className="relative overflow-hidden p-7 sm:p-8">
      <div className="absolute right-[-90px] top-[-120px] h-72 w-72 rounded-full border border-white/10 bg-white/[0.035]" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/48">
          <Gauge className="h-3.5 w-3.5" />
          Overall score
        </div>

        <div className="mt-10 flex items-end justify-between gap-6">
          <div>
            <div className="font-apple-display text-[7rem] font-medium leading-[0.78] tracking-[-0.08em] text-white sm:text-[8.5rem]">
              {score.toFixed(1)}
            </div>
            <div className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-white/36">/ 10</div>
          </div>
          <div
            aria-hidden="true"
            className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(rgba(255,255,255,0.86) ${percent}%, rgba(255,255,255,0.12) 0)`,
            }}
          >
            <div className="grid h-[86px] w-[86px] place-items-center rounded-full bg-[#101418] text-xs font-bold uppercase tracking-[0.14em] text-white/45">
              score
            </div>
          </div>
        </div>

        <p className="mt-8 max-w-md text-base leading-8 text-white/58">{caption}</p>
      </div>
    </GlassCard>
  );
}
