import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { AcquisitionSource } from "../types/roast";
import { isValidEmail } from "../services/profile";

type SoftSignupModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    email: string;
    name?: string;
    acquisitionSource: AcquisitionSource;
    acquisitionSourceOther?: string;
  }) => void;
  title?: string;
  cta?: string;
};

const sources: { id: AcquisitionSource; label: string }[] = [
  { id: "threads", label: "Threads" },
  { id: "friends", label: "Друзья" },
  { id: "search", label: "Поиск" },
  { id: "telegram", label: "Telegram" },
  { id: "youtube", label: "YouTube" },
  { id: "other", label: "Другое" },
];

export function SoftSignupModal({
  open,
  onClose,
  onSubmit,
  title = "Сохрани разбор и продолжи улучшать проект",
  cta = "Сохранить разбор",
}: SoftSignupModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [source, setSource] = useState<AcquisitionSource>("threads");
  const [other, setOther] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const submit = () => {
    if (!isValidEmail(email)) {
      setError("Введи нормальный email, чтобы сохранить профиль.");
      return;
    }

    if (source === "other" && !other.trim()) {
      setError("Напиши, откуда ты узнал о нас.");
      return;
    }

    setError("");
    onSubmit({
      email,
      ...(name.trim() ? { name } : {}),
      acquisitionSource: source,
      ...(source === "other" ? { acquisitionSourceOther: other } : {}),
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-[#101418]/38 px-4 py-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="soft-signup-title"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-[2.2rem] border border-black/10 bg-[#f4f4f1]/90 p-5 shadow-[0_40px_130px_rgba(16,20,24,0.22),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="technical-label">LOCAL PROFILE</p>
                <h2 id="soft-signup-title" className="apple-heading font-apple-display mt-3 text-4xl text-[#101418]">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#20262b]/60">
                  Создай профиль, чтобы не потерять результат, сравнивать версии и собрать Launch Pack.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white/50 text-[#20262b]/58 transition hover:bg-white/80"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="technical-label mb-2 block">EMAIL</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="lab-field w-full rounded-[1.25rem] px-4 py-3 text-sm"
                  placeholder="you@example.com"
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="technical-label mb-2 block">NAME / OPTIONAL</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="lab-field w-full rounded-[1.25rem] px-4 py-3 text-sm"
                  placeholder="Как к тебе обращаться?"
                />
              </label>
            </div>

            <div className="mt-5">
              <p className="technical-label mb-3">Откуда узнал о нас?</p>
              <div className="flex flex-wrap gap-2">
                {sources.map((item) => {
                  const active = source === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSource(item.id)}
                      className={[
                        "min-h-10 rounded-full px-4 text-xs font-semibold transition",
                        active
                          ? "bg-[#101418] text-white shadow-[0_16px_36px_rgba(16,20,24,0.16)]"
                          : "border border-black/10 bg-white/42 text-[#20262b]/62 hover:bg-white/72",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              {source === "other" ? (
                <input
                  value={other}
                  onChange={(event) => setOther(event.target.value)}
                  className="lab-field mt-3 w-full rounded-[1.25rem] px-4 py-3 text-sm"
                  placeholder="Напиши откуда"
                />
              ) : null}
            </div>

            {error ? <p className="mt-4 text-sm font-semibold text-[#7a3434]">{error}</p> : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-xs leading-6 text-[#20262b]/48">
                Без спама. Это нужно, чтобы сохранить твои разборы и понять, откуда приходят первые пользователи.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-11 rounded-full border border-black/10 bg-white/42 px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#20262b]/58 transition hover:bg-white/72"
                >
                  Позже
                </button>
                <button type="button" onClick={submit} className="lab-btn-dark min-h-11 px-5 text-sm font-semibold">
                  {cta}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
