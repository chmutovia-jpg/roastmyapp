import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
  ["Reading signal", "Читаю идею и оффер"],
  ["Checking first impression", "Проверяю, что поймет человек за 5 секунд"],
  ["Finding weak points", "Ищу, где теряется ценность"],
  ["Rewriting offer", "Собираю более понятный оффер"],
  ["Preparing Threads angle", "Готовлю посты, которые не звучат как пресс-релиз"],
] as const;

const labLabels = ["UX SCAN", "OFFER CHECK", "SIGNAL", "THREADS"];

export function AnalysisPipeline() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((current) => Math.min(steps.length - 1, current + 1));
    }, 430);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="grid w-full max-w-[980px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="relative mx-auto grid h-[280px] w-[280px] place-items-center sm:h-[360px] sm:w-[360px]">
        {labLabels.map((label, index) => {
          const positions = [
            "left-0 top-12",
            "right-0 top-16",
            "bottom-16 left-4",
            "bottom-10 right-4",
          ];
          return (
            <motion.span
              key={label}
              className={`absolute ${positions[index]} rounded-full border border-white/12 bg-white/[0.055] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 backdrop-blur-xl`}
              animate={{ opacity: [0.36, 0.82, 0.36], y: [0, -5, 0] }}
              transition={{ duration: 3, delay: index * 0.25, repeat: Infinity, ease: "easeInOut" }}
            >
              {label}
            </motion.span>
          );
        })}

        <motion.div
          className="absolute h-[230px] w-[230px] rounded-full border border-white/10 sm:h-[300px] sm:w-[300px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-white/64 shadow-[0_0_28px_rgba(232,244,248,0.36)]" />
        </motion.div>

        <motion.div
          className="orb-shell h-40 w-40 rounded-full sm:h-52 sm:w-52"
          animate={{ scale: [1, 1.04, 1], filter: ["blur(0px)", "blur(0.45px)", "blur(0px)"] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="liquid-panel-dark rounded-[2.2rem] p-5 sm:p-7">
        <p className="technical-label-dark">Сейчас будет больно, но полезно.</p>
        <div className="mt-6 space-y-3">
          {steps.map(([title, subtitle], index) => {
            const done = index < active;
            const current = index === active;
            return (
              <motion.div
                key={title}
                animate={{ opacity: done || current ? 1 : 0.42 }}
                className={[
                  "grid grid-cols-[34px_1fr] gap-4 rounded-[1.4rem] border p-4",
                  current
                    ? "border-white/18 bg-white/[0.08]"
                    : done
                      ? "border-white/10 bg-white/[0.045]"
                      : "border-white/8 bg-transparent",
                ].join(" ")}
              >
                <motion.span
                  animate={current ? { scale: [1, 1.08, 1] } : undefined}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className={[
                    "grid h-8 w-8 place-items-center rounded-full border",
                    done ? "border-white/18 bg-white text-[#101418]" : "border-white/14 bg-white/[0.04] text-white/48",
                  ].join(" ")}
                >
                  {done ? <Check className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                </motion.span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/54">{subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
