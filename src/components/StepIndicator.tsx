import { Check } from "lucide-react";
import { motion } from "framer-motion";

type Step = "signal" | "mode" | "audit";

type StepIndicatorProps = {
  current: Step;
};

const steps: { id: Step; label: string }[] = [
  { id: "signal", label: "Signal" },
  { id: "mode", label: "Mode" },
  { id: "audit", label: "Audit" },
];

export function StepIndicator({ current }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <div className="flex w-fit items-center gap-1 rounded-full border border-black/10 bg-white/44 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-2xl">
      {steps.map((step, index) => {
        const active = step.id === current;
        const complete = index < currentIndex;
        return (
          <motion.div
            key={step.id}
            layout
            className={[
              "flex min-h-8 items-center gap-2 rounded-full px-3 text-[10px] font-bold uppercase tracking-[0.14em]",
              active
                ? "bg-[#101418] text-white shadow-[0_12px_28px_rgba(16,20,24,0.16)]"
                : complete
                  ? "text-[#20262b]"
                  : "text-[#20262b]/38",
            ].join(" ")}
          >
            {complete ? <Check className="h-3 w-3" /> : null}
            {step.label}
          </motion.div>
        );
      })}
    </div>
  );
}
