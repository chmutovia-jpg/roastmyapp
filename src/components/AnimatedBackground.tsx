import { useEffect, useRef, useState } from "react";

const backgroundOrbs = [
  {
    className: "-left-28 top-16 h-56 w-56 blur-[0.5px] sm:h-80 sm:w-80",
    opacity: 0.55,
    x: 46,
    y: 36,
    speed: 0.62,
    phase: 0.2,
    scale: 0.08,
  },
  {
    className: "background-orb-soft right-[-8rem] top-[14rem] h-[24rem] w-[24rem] blur-[1px] sm:h-[34rem] sm:w-[34rem]",
    opacity: 0.38,
    x: 64,
    y: 42,
    speed: 0.48,
    phase: 1.1,
    scale: 0.05,
  },
  {
    className: "left-[48%] top-[38%] h-44 w-44 blur-[0.5px] sm:h-64 sm:w-64",
    opacity: 0.42,
    x: 36,
    y: 52,
    speed: 0.56,
    phase: 2.4,
    scale: 0.12,
  },
  {
    className: "background-orb-soft right-[14%] top-[52%] h-36 w-36 sm:h-52 sm:w-52",
    opacity: 0.45,
    x: 52,
    y: 28,
    speed: 0.7,
    phase: 3.2,
    scale: 0.07,
  },
  {
    className: "bottom-[-7rem] left-[18%] h-56 w-56 blur-[1.5px] sm:h-[26rem] sm:w-[26rem]",
    opacity: 0.34,
    x: 72,
    y: 40,
    speed: 0.42,
    phase: 4.1,
    scale: 0.06,
  },
  {
    className: "right-[34%] top-24 h-20 w-20 sm:h-28 sm:w-28",
    opacity: 0.52,
    x: 28,
    y: 34,
    speed: 0.82,
    phase: 1.9,
    scale: 0.16,
  },
  {
    className: "background-orb-soft left-[7%] top-[58%] h-28 w-28 sm:h-40 sm:w-40",
    opacity: 0.38,
    x: 44,
    y: 58,
    speed: 0.52,
    phase: 5.2,
    scale: 0.1,
  },
  {
    className: "right-[5%] bottom-[9%] h-24 w-24 sm:h-36 sm:w-36",
    opacity: 0.46,
    x: 38,
    y: 46,
    speed: 0.66,
    phase: 2.9,
    scale: 0.12,
  },
] as const;

export function AnimatedBackground() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 24, visible: false });

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      setSpotlight({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
        visible: true,
      });
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      return undefined;
    }

    const nodes = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>("[data-background-orb]") ?? [],
    );

    let frame = 0;
    let timeout = 0;
    const hasAnimationFrame = typeof window.requestAnimationFrame === "function";
    const getTime = () =>
      typeof window.performance?.now === "function" ? window.performance.now() : Date.now();

    const schedule = (callback: (time: number) => void) => {
      if (hasAnimationFrame) {
        frame = window.requestAnimationFrame(callback);
        return;
      }

      timeout = window.setTimeout(() => callback(getTime()), 1000 / 30);
    };

    const tick = (time: number) => {
      const seconds = time / 1000;

      nodes.forEach((node, index) => {
        const orb = backgroundOrbs[index];
        if (!orb) {
          return;
        }

        const wave = seconds * orb.speed + orb.phase;
        const x = Math.sin(wave) * orb.x + Math.cos(wave * 0.44) * orb.x * 0.28;
        const y = Math.cos(wave * 0.82) * orb.y + Math.sin(wave * 0.36) * orb.y * 0.32;
        const scale = 1 + Math.sin(wave * 0.72) * orb.scale;
        const opacity = orb.opacity + Math.sin(wave * 0.68) * 0.08;

        node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
        node.style.opacity = Math.max(0.24, Math.min(0.68, opacity)).toFixed(2);
      });

      schedule(tick);
    };

    schedule(tick);
    return () => {
      if (hasAnimationFrame) {
        window.cancelAnimationFrame(frame);
      } else {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(16,20,24,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(16,20,24,0.55)_1px,transparent_1px)] [background-size:96px_96px]" />
      <div className="absolute inset-0 opacity-[0.045] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 260 260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%22.45%22/%3E%3C/svg%3E')]" />

      {backgroundOrbs.map((orb) => (
        <div
          key={orb.className}
          data-background-orb
          className={`background-orb ${orb.className}`}
          style={{ opacity: orb.opacity }}
        />
      ))}

      <div
        className="absolute inset-0 hidden opacity-60 md:block"
        style={{
          background: spotlight.visible
            ? `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.42), transparent 22%)`
            : undefined,
        }}
      />
    </div>
  );
}
