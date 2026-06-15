import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const { scrollYProgress } = useScroll();
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const ySoft = useTransform(scrollYProgress, [0, 1], [0, 80]);
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

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(16,20,24,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(16,20,24,0.55)_1px,transparent_1px)] [background-size:96px_96px]" />
      <div className="absolute inset-0 opacity-[0.045] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 260 260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%22.45%22/%3E%3C/svg%3E')]" />

      <motion.div
        style={{ y: ySlow }}
        className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#bfc8cb]/28 blur-3xl"
      />
      <motion.div
        style={{ y: ySoft }}
        className="absolute right-[-9rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-[#6c7a84]/14 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 34, 0], y: [0, -22, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-[38%] h-72 w-72 rounded-full bg-white/34 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -26, 0], y: [0, 18, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[18%] top-[55%] h-48 w-48 rounded-full bg-[#d8dddd]/34 blur-2xl"
      />

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
