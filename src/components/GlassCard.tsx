import type { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
  tone?: "light" | "dark";
};

export function GlassCard({
  children,
  className = "",
  interactive = false,
  tone = "light",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={[
        tone === "dark" ? "liquid-panel-dark text-white" : "liquid-panel text-[#111416]",
        "rounded-[2rem]",
        interactive ? "transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_34px_94px_rgba(16,20,24,0.14)]" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
