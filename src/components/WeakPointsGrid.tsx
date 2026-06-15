import type { RoastResult, WeakPointKey } from "../types/roast";
import { weakPointLabels } from "../types/roast";

type WeakPointsGridProps = {
  weakPoints: RoastResult["weakPoints"];
};

const keys: WeakPointKey[] = ["offer", "ux", "design", "value", "trust", "monetization"];

export function WeakPointsGrid({ weakPoints }: WeakPointsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {keys.map((key, index) => {
        const point = weakPoints[key];
        return (
          <div
            key={key}
            className="rounded-[1.8rem] border border-black/10 bg-white/46 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition duration-300 hover:-translate-y-1 hover:bg-white/64"
          >
            <div className="mb-8 flex items-start justify-between gap-4 border-t border-black/12 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#20262b]/38">
                  0{index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#101418]">
                  {weakPointLabels[key]}
                </h3>
              </div>
              <span className="font-apple-display text-4xl leading-none tracking-[-0.06em] text-[#101418]">
                {point.score}
              </span>
            </div>
            <p className="text-sm leading-7 text-[#20262b]/60">{point.comment}</p>
          </div>
        );
      })}
    </div>
  );
}
