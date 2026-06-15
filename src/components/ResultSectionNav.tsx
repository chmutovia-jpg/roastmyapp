import { motion } from "framer-motion";

export type ResultSection = "audit" | "fix" | "threads" | "sprint";

type ResultSectionNavProps = {
  active: ResultSection;
  onChange: (section: ResultSection) => void;
};

const sections: { id: ResultSection; label: string }[] = [
  { id: "audit", label: "Разбор" },
  { id: "fix", label: "Исправить" },
  { id: "threads", label: "Threads" },
  { id: "sprint", label: "Спринт" },
];

export function ResultSectionNav({ active, onChange }: ResultSectionNavProps) {
  return (
    <div className="sticky top-[4.5rem] z-30 -mx-1 overflow-x-auto py-2">
      <div className="flex w-max min-w-full gap-1 rounded-full border border-black/10 bg-[#ededeb]/76 p-1 shadow-[0_20px_54px_rgba(16,20,24,0.08),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-2xl sm:w-fit sm:min-w-0">
        {sections.map((section) => {
          const isActive = section.id === active;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={[
                "relative min-h-10 rounded-full px-5 text-xs font-bold uppercase tracking-[0.14em] transition",
                isActive ? "text-white" : "text-[#20262b]/48 hover:text-[#101418]",
              ].join(" ")}
            >
              {isActive ? (
                <motion.span
                  layoutId="result-section"
                  className="absolute inset-0 rounded-full bg-[#101418] shadow-[0_14px_34px_rgba(16,20,24,0.16)]"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : null}
              <span className="relative">{section.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
