import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ImagePlus,
  MousePointerClick,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { stageLabels, type ProjectStage, type RoastInput } from "../types/roast";
import type { DemoProject } from "../utils/demoProjects";
import { AIEngineStatus } from "./AIEngineStatus";
import { DemoProjectPicker } from "./DemoProjectPicker";
import { InputQualityMeter } from "./InputQualityMeter";
import { StepIndicator } from "./StepIndicator";

type ProjectFormProps = {
  input: RoastInput;
  onChange: (input: RoastInput) => void;
  onContinue: () => void;
  onBack: () => void;
  onDemoFill: (project?: DemoProject) => void;
};

const stages: ProjectStage[] = ["idea", "mvp", "landing", "users", "sales"];

const fieldClass = "lab-field w-full rounded-[1.25rem] px-4 py-3 text-sm leading-6";
const labelClass = "technical-label mb-2 block";

type SuggestionTarget = "audience" | "action" | "landing" | "price" | "screenshot" | "idea";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProjectForm({ input, onChange, onContinue, onBack, onDemoFill }: ProjectFormProps) {
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const ideaRef = useRef<HTMLTextAreaElement>(null);
  const landingRef = useRef<HTMLTextAreaElement>(null);
  const audienceRef = useRef<HTMLInputElement>(null);
  const actionRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLLabelElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canContinue = Boolean(
    input.ideaDescription.trim() || input.landingText.trim() || input.screenshotBase64,
  );

  const update = (patch: Partial<RoastInput>) =>
    onChange({ ...input, ...patch, source: "user" });

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setFileError("Поддерживаются только png, jpg и webp.");
      return;
    }
    if (file.size > 3_500_000) {
      setFileError("Лучше загрузить скрин до 3.5 МБ, чтобы localStorage не страдал.");
      return;
    }
    setFileError("");
    const screenshotBase64 = await readFileAsDataUrl(file);
    update({ screenshotBase64 });
  };

  const focusSuggestion = (target: SuggestionTarget) => {
    if (target !== "idea" && target !== "screenshot") {
      setAdvancedOpen(true);
    }

    window.setTimeout(() => {
      if (target === "audience") audienceRef.current?.focus();
      if (target === "action") actionRef.current?.focus();
      if (target === "landing") landingRef.current?.focus();
      if (target === "price") priceRef.current?.focus();
      if (target === "idea") ideaRef.current?.focus();
      if (target === "screenshot") uploadRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 120);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[1220px] px-4 py-10 pb-[calc(9rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-14"
    >
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#20262b]/48 transition hover:text-[#111416]"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
          <StepIndicator current="signal" />
          <h1 className="font-editorial mt-5 max-w-2xl text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#101418] sm:text-6xl">
            Дай AI достаточно сигнала.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#20262b]/58">
            Одного источника уже хватит: идея, оффер или скрин. Детали можно добавить позже.
          </p>
        </div>
        <DemoProjectPicker onSelect={onDemoFill} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="liquid-panel rounded-[2.4rem] p-4 sm:p-6">
          <div className="rounded-[2rem] bg-[#f8f8f6]/62 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-5">
            <label className="block">
              <span className={labelClass}>PROJECT NAME</span>
              <input
                value={input.projectName}
                onChange={(event) => update({ projectName: event.target.value })}
                className={fieldClass}
                placeholder="Можно без названия, но с ним приятнее"
              />
            </label>

            <label className="mt-5 block">
              <span className={labelClass}>INPUT SIGNAL</span>
              <textarea
                ref={ideaRef}
                value={input.ideaDescription}
                onChange={(event) => update({ ideaDescription: event.target.value })}
                className={`${fieldClass} min-h-52 resize-y text-base leading-8`}
                placeholder="Вставь идею, оффер или описание проекта. Например: я делаю AI-планировщик дня, который сам расставляет задачи по энергии пользователя..."
              />
            </label>

            <div className="mt-5">
              <p className="mb-3 flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-[#20262b]/44" />
                <span className="technical-label">SCREENSHOT / OPTIONAL</span>
              </p>
              <label
                ref={uploadRef}
                role="button"
                tabIndex={0}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  void onFile(event.dataTransfer.files?.[0]);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={[
                  "group flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.8rem] border border-dashed p-5 text-center transition duration-300",
                  isDragging
                    ? "border-[#101418]/36 bg-white/74 shadow-[inset_0_0_50px_rgba(255,255,255,0.8)]"
                    : "border-black/12 bg-white/38 hover:bg-white/62",
                ].join(" ")}
              >
                <span className="grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition group-hover:-translate-y-0.5">
                  <UploadCloud className="h-5 w-5 text-[#20262b]/66" />
                </span>
                <span className="mt-3 text-sm font-semibold text-[#111416]">Upload screenshot</span>
                <span className="mt-1 text-xs leading-5 text-[#20262b]/48">png, jpg, webp. Preview сохранится локально.</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    void onFile(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>

              <AnimatePresence>
                {fileError ? (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-2 text-sm text-[#52646d]"
                  >
                    {fileError}
                  </motion.p>
                ) : null}
              </AnimatePresence>

              {input.screenshotBase64 ? (
                <div className="mt-3 overflow-hidden rounded-[1.6rem] border border-black/10 bg-white/58 shadow-[0_20px_50px_rgba(16,20,24,0.1)]">
                  <img
                    src={input.screenshotBase64}
                    alt="Preview загруженного скриншота"
                    className="max-h-48 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => update({ screenshotBase64: undefined })}
                    className="flex w-full items-center justify-center gap-2 border-t border-black/10 px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#20262b]/58 transition hover:bg-white/72"
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить скрин
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setAdvancedOpen((value) => !value)}
              className="mt-5 flex w-full items-center justify-between rounded-full border border-black/10 bg-white/42 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-[#20262b]/58 transition hover:bg-white/72"
            >
              Добавить детали
              <ChevronDown className={`h-4 w-4 transition ${advancedOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence initial={false}>
              {advancedOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-[#20262b]/44" />
                        <span className="technical-label">AUDIENCE</span>
                      </span>
                      <input
                        ref={audienceRef}
                        value={input.targetAudience}
                        onChange={(event) => update({ targetAudience: event.target.value })}
                        className={fieldClass}
                        placeholder="Кому продается продукт?"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2">
                        <MousePointerClick className="h-4 w-4 text-[#20262b]/44" />
                        <span className="technical-label">TARGET ACTION</span>
                      </span>
                      <input
                        ref={actionRef}
                        value={input.desiredAction}
                        onChange={(event) => update({ desiredAction: event.target.value })}
                        className={fieldClass}
                        placeholder="Регистрация, покупка, email..."
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className={labelClass}>LANDING / OFFER TEXT</span>
                      <textarea
                        ref={landingRef}
                        value={input.landingText}
                        onChange={(event) => update({ landingText: event.target.value })}
                        className={`${fieldClass} min-h-28 resize-y`}
                        placeholder="Вставь заголовок, подзаголовок или текст первого экрана..."
                      />
                    </label>

                    <label className="block">
                      <span className={labelClass}>PRICE SIGNAL</span>
                      <input
                        ref={priceRef}
                        value={input.price}
                        onChange={(event) => update({ price: event.target.value })}
                        className={fieldClass}
                        placeholder="5$ в месяц или пока бесплатно"
                      />
                    </label>

                    <div>
                      <span className={labelClass}>STAGE</span>
                      <div className="flex flex-wrap gap-2">
                        {stages.map((stage) => {
                          const active = input.stage === stage;
                          return (
                            <motion.button
                              key={stage}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => update({ stage })}
                              className={[
                                "min-h-10 rounded-full px-4 text-xs font-semibold transition",
                                active
                                  ? "bg-[#101418] text-white shadow-[0_16px_36px_rgba(16,20,24,0.16),inset_0_1px_0_rgba(255,255,255,0.14)]"
                                  : "border border-black/10 bg-white/42 text-[#20262b]/62 hover:bg-white/72",
                              ].join(" ")}
                            >
                              {stageLabels[stage]}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-6 text-[#20262b]/54">
                {canContinue
                  ? "Сначала разберем, потом улучшим. Данные хранятся только локально."
                  : "Добавь идею, оффер или скрин, чтобы выбрать режим."}
              </p>
              <motion.button
                type="button"
                onClick={onContinue}
                disabled={!canContinue}
                whileHover={canContinue ? { scale: 1.02 } : undefined}
                whileTap={canContinue ? { scale: 0.98 } : undefined}
                className="lab-btn-dark inline-flex min-h-12 items-center justify-center gap-3 px-6 text-sm font-semibold disabled:opacity-35"
              >
                Выбрать режим
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <InputQualityMeter input={input} onSuggestionClick={focusSuggestion} />
          <AIEngineStatus input={input} />
        </aside>
      </div>
    </motion.section>
  );
}
