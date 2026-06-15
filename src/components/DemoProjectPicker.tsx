import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { DemoProject } from "../utils/demoProjects";
import { demoProjects } from "../utils/demoProjects";

type DemoProjectPickerProps = {
  onSelect: (project: DemoProject) => void;
  compact?: boolean;
};

export function DemoProjectPicker({ onSelect, compact = false }: DemoProjectPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={[
          "lab-btn-light inline-flex items-center justify-center gap-2 font-semibold",
          compact ? "min-h-10 px-4 text-xs" : "min-h-12 px-5 text-sm",
        ].join(" ")}
      >
        Загрузить демо
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-3 w-[290px] rounded-[1.6rem] border border-black/10 bg-[#f8f8f6]/92 p-2 shadow-[0_28px_80px_rgba(16,20,24,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl"
          >
            {demoProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(project);
                  setOpen(false);
                }}
                className="block w-full rounded-[1.2rem] px-4 py-3 text-left transition hover:bg-white/76"
              >
                <span className="block text-sm font-semibold tracking-[-0.02em] text-[#101418]">
                  {project.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#20262b]/52">{project.subtitle}</span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
