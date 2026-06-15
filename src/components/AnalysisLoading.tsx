import { motion } from "framer-motion";
import { AnalysisPipeline } from "./AnalysisPipeline";

export function AnalysisLoading() {
  return (
    <section className="dark-lab-bg relative isolate grid min-h-[calc(100vh-4rem)] place-items-center overflow-hidden px-4 py-12 pb-[calc(9rem+env(safe-area-inset-bottom))] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-45">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8" />
        <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/8" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/8" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <AnalysisPipeline />
      </motion.div>
    </section>
  );
}
