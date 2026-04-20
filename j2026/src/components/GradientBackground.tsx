import { motion } from "framer-motion";
import type { GradientPalette } from "../types";

interface GradientBackgroundProps {
  palette: GradientPalette;
}

export function GradientBackground({ palette }: GradientBackgroundProps) {
  const [first, second, third] = palette;

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      animate={{
        backgroundImage: [
          `linear-gradient(120deg, ${first}, ${second}, ${third})`,
          `linear-gradient(145deg, ${third}, ${second}, ${first})`,
          `linear-gradient(120deg, ${first}, ${second}, ${third})`,
        ],
      }}
      transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    >
      <motion.div
        className="absolute -left-24 top-[-10%] h-80 w-80 rounded-full blur-3xl"
        animate={{ x: [0, 50, -20, 0], y: [0, 30, -25, 0], opacity: [0.18, 0.28, 0.22, 0.18] }}
        transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{ background: `radial-gradient(circle, ${second}99 0%, transparent 70%)` }}
      />
      <motion.div
        className="absolute bottom-[-12%] right-[-8%] h-96 w-96 rounded-full blur-3xl"
        animate={{ x: [0, -45, 20, 0], y: [0, -30, 18, 0], opacity: [0.14, 0.24, 0.18, 0.14] }}
        transition={{ duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{ background: `radial-gradient(circle, ${third}aa 0%, transparent 70%)` }}
      />
      <div className="absolute inset-0 bg-vignette" />
      <div className="grain-layer absolute inset-0 opacity-25" />
    </motion.div>
  );
}
