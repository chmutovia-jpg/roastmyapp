import { motion } from "framer-motion";
import { ArrowRight, Eye, History, MoveUpRight } from "lucide-react";
import { DemoProjectPicker } from "./DemoProjectPicker";
import type { DemoProject } from "../utils/demoProjects";

type HeroProps = {
  historyCount: number;
  onStart: () => void;
  onDemo: () => void;
  onDemoSelect: (project: DemoProject) => void;
  onHistory: () => void;
};

export function Hero({ historyCount, onStart, onDemo, onDemoSelect, onHistory }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="hero-object left-[7%] top-[18%] h-24 w-24 opacity-65 sm:h-36 sm:w-36"
          animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="hero-object right-[8%] top-[24%] h-32 w-32 opacity-55 blur-[1px] sm:h-48 sm:w-48"
          animate={{ y: [0, 16, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="hero-ring bottom-[20%] left-[18%] h-36 w-36 opacity-55 sm:h-56 sm:w-56"
          animate={{ y: [0, 10, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute left-1/2 top-[48%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/38 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1180px] flex-col items-center justify-start py-7 text-center sm:min-h-[82vh] sm:py-10 lg:min-h-[86vh] lg:justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="lab-pill mb-5 inline-flex items-center gap-3 px-4 py-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#8fa2aa]" />
          <span className="technical-label">ROAST ENGINE / V.01</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="font-editorial max-w-4xl text-[2.45rem] font-medium leading-[0.96] tracking-[-0.055em] text-[#101418] min-[390px]:text-[2.75rem] sm:text-[4.8rem] lg:text-[6rem]"
        >
          Твой проект выглядит нормально.
          <span className="block text-[#111416]/58">Пока AI его не разнес.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-xl text-[15px] leading-7 text-[#20262b]/62 sm:mt-6 sm:text-lg sm:leading-8"
        >
          Загрузи идею, скрин или лендинг. Получи честный разбор, новый оффер и посты
          для Threads.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex flex-col items-center justify-center gap-3 sm:mt-7 sm:flex-row"
        >
          <motion.button
            type="button"
            onClick={onStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lab-btn-dark group inline-flex min-h-[52px] items-center justify-center gap-3 px-7 text-sm font-semibold"
          >
            Разнести проект
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </motion.button>
          <motion.button
            type="button"
            onClick={onDemo}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lab-btn-light inline-flex min-h-[52px] items-center justify-center gap-3 px-7 text-sm font-semibold"
          >
            <Eye className="h-4 w-4" />
            Посмотреть пример
          </motion.button>
          <DemoProjectPicker onSelect={onDemoSelect} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid w-full gap-3 sm:mt-10 md:grid-cols-[0.8fr_1.2fr_0.8fr]"
        >
          <button
            type="button"
            onClick={onHistory}
            className="liquid-panel rounded-[1.7rem] p-4 text-left transition duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="technical-label">ARCHIVE</span>
              <History className="h-4 w-4 text-[#20262b]/45" />
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#111416]">
              {historyCount}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#20262b]/54">сохраненных разборов</p>
          </button>

          <div className="liquid-panel rounded-[2rem] p-4 text-left md:p-5">
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="technical-label">EXAMPLE AUDIT</span>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#101418]">
                  DayPilot
                </h2>
              </div>
              <div className="text-right">
                <div className="font-editorial text-5xl leading-none tracking-[-0.06em] text-[#101418]">
                  6.4
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#20262b]/42">
                  / 10
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-3 border-t border-black/10 pt-4 sm:grid-cols-2">
              <p className="text-sm leading-6 text-[#20262b]/64">Главная проблема: продаешь функцию, а не результат.</p>
              <p className="text-sm leading-6 text-[#20262b]/64">Исправить первым: переписать первый экран.</p>
            </div>
          </div>

          <div className="liquid-panel rounded-[1.7rem] p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="technical-label">SIGNAL</span>
              <MoveUpRight className="h-4 w-4 text-[#20262b]/45" />
            </div>
            <p className="mt-5 text-sm leading-6 text-[#20262b]/58">
              Одного источника уже хватит: идея, оффер или скрин.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
