import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

type PremiumTeaserProps = {
  open?: boolean;
  compact?: boolean;
  onClose?: () => void;
  onEarlyAccess: () => void;
};

const features = [
  "безлимитные разборы",
  "глубокий аудит",
  "история проектов",
  "Launch Pack",
  "share cards",
  "экспорт",
];

export function PremiumTeaser({ open = true, compact = false, onClose, onEarlyAccess }: PremiumTeaserProps) {
  const content = (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "relative overflow-hidden rounded-[2.2rem] border border-black/10 bg-[#f4f4f1]/92 p-6 shadow-[0_40px_130px_rgba(16,20,24,0.2),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-2xl",
        compact ? "" : "w-full max-w-[620px]",
      ].join(" ")}
    >
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/50 text-[#20262b]/58 transition hover:bg-white/80"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <div className="grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <Sparkles className="h-5 w-5 text-[#20262b]/62" />
      </div>
      <p className="technical-label mt-5">PRO SOON</p>
      <h2 className="apple-heading font-apple-display mt-3 text-4xl text-[#101418]">
        Pro скоро
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[#20262b]/60">
        Лимит MVP закончился. Мы собираем ранний доступ для тех, кто хочет доводить проекты до нормального оффера, а не просто получать красивый разбор.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {features.map((feature) => (
          <span
            key={feature}
            className="rounded-full border border-black/10 bg-white/42 px-3 py-1.5 text-xs font-semibold text-[#20262b]/58"
          >
            {feature}
          </span>
        ))}
      </div>

      <button type="button" onClick={onEarlyAccess} className="lab-btn-dark mt-7 min-h-11 px-5 text-sm font-semibold">
        Хочу ранний доступ
      </button>
    </motion.section>
  );

  if (compact) return open ? content : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[82] grid place-items-center bg-[#101418]/38 px-4 py-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          {content}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
