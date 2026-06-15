import { Check, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label: string;
  copiedLabel?: string;
  className?: string;
  compact?: boolean;
  tone?: "light" | "dark";
  ariaLabel?: string;
};

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Some embedded browsers deny Clipboard API even after a button click.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}

export function CopyButton({
  value,
  label,
  copiedLabel = "Скопировано",
  className = "",
  compact = false,
  tone = "light",
  ariaLabel,
}: CopyButtonProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const copied = copyState === "copied";

  const onCopy = async () => {
    try {
      const success = await copyText(value);
      setCopyState(success ? "copied" : "failed");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 1400);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={onCopy}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full text-xs font-semibold uppercase tracking-[0.12em]",
        compact ? "min-h-9 px-3" : "min-h-11 px-4",
        tone === "dark"
          ? "border border-white/12 bg-white/[0.07] text-white/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-white/[0.11]"
          : "border border-black/10 bg-white/55 text-[#1b2024] shadow-[0_14px_34px_rgba(16,20,24,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-white/75",
        "transition focus:outline-none focus:ring-2 focus:ring-slate-500/20",
        className,
      ].join(" ")}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="whitespace-nowrap">
        {copyState === "failed" ? "Не скопировано" : copied ? copiedLabel : label}
      </span>
    </motion.button>
  );
}
