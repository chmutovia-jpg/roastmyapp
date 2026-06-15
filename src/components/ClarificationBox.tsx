import { motion } from "framer-motion";
import { MessageSquareText, RefreshCcw, Sparkles } from "lucide-react";
import { useState } from "react";

type ClarificationBoxProps = {
  isRefining: boolean;
  onRefine: (text: string) => void;
};

const chips = [
  {
    label: "AI неправильно понял аудиторию",
    text: "AI неправильно понял аудиторию. На самом деле продукт для ",
  },
  {
    label: "AI не учел монетизацию",
    text: "AI не учел монетизацию. Модель оплаты такая: ",
  },
  {
    label: "Идея не про это",
    text: "Идея не про это. Правильная рамка такая: ",
  },
  {
    label: "Добавить больше про ЦА",
    text: "Добавь больше фокуса на целевую аудиторию: ",
  },
  {
    label: "Добавить контраргумент",
    text: "Я не согласен с выводом, потому что ",
  },
  {
    label: "Переписать оффер заново",
    text: "Перепиши оффер заново с учетом этого контекста: ",
  },
];

export function ClarificationBox({ isRefining, onRefine }: ClarificationBoxProps) {
  const [text, setText] = useState("");

  const appendChip = (chipText: string) => {
    setText((current) => [current.trim(), chipText].filter(Boolean).join("\n"));
  };

  const submit = () => {
    if (!text.trim()) return;
    onRefine(text);
    setText("");
  };

  const submitAsContext = () => {
    if (!text.trim()) {
      appendChip("Добавь это как дополнительный контекст: ");
      return;
    }

    onRefine(`Дополнительный контекст: ${text}`);
    setText("");
  };

  return (
    <section className="liquid-panel rounded-[2.2rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="technical-label">CLARIFY AI</p>
          <h2 className="font-editorial mt-3 text-4xl font-medium tracking-[-0.055em] text-[#101418]">
            AI не так понял?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#20262b]/58">
            Добавь деталей или возрази — разбор пересоберется с учетом твоей мысли.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/44 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#20262b]/52">
          <MessageSquareText className="h-3.5 w-3.5" />
          Context loop
        </span>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="lab-field mt-5 min-h-32 w-full resize-y rounded-[1.5rem] px-4 py-4 text-sm leading-7"
        placeholder="Например: ты неправильно понял, это не планировщик задач, а приложение для людей после выгорания. Главная ценность — не скорость, а снижение тревоги..."
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => appendChip(chip.text)}
            className="rounded-full border border-black/10 bg-white/38 px-3 py-2 text-xs font-semibold text-[#20262b]/60 transition hover:bg-white/72 hover:text-[#101418]"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-[#20262b]/46">
          Старый результат сохранится, если пересборка не пройдет.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={submitAsContext}
            disabled={isRefining}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/46 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#20262b]/62 transition hover:bg-white/78"
          >
            <Sparkles className="h-4 w-4" />
            Добавить как контекст
          </button>
          <motion.button
            type="button"
            onClick={submit}
            disabled={!text.trim() || isRefining}
            whileHover={text.trim() && !isRefining ? { scale: 1.02 } : undefined}
            whileTap={text.trim() && !isRefining ? { scale: 0.98 } : undefined}
            className="lab-btn-dark inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-semibold disabled:opacity-40"
          >
            <RefreshCcw className="h-4 w-4" />
            {isRefining ? "Уточняю мысль..." : "Пересобрать разбор"}
          </motion.button>
        </div>
      </div>
    </section>
  );
}
