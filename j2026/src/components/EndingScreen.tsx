import { motion } from "framer-motion";
import type { EndingContent } from "../types";

interface EndingScreenProps {
  content: EndingContent;
  onRestart: () => void;
}

export function EndingScreen({ content, onRestart }: EndingScreenProps) {
  return (
    <motion.section
      key="ending-screen"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16 text-center sm:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
    >
      <motion.p
        className="font-sans text-xs uppercase tracking-[0.6em] text-white/45"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.9 }}
      >
        The End
      </motion.p>

      <motion.h2
        className="mt-6 font-serif text-4xl font-medium tracking-[0.04em] text-white sm:text-6xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 1.1 }}
      >
        {content.title}
      </motion.h2>

      <motion.p
        className="mt-8 max-w-2xl font-sans text-base leading-8 text-white/68 sm:text-lg"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 1.1 }}
      >
        {content.message}
      </motion.p>

      <motion.button
        type="button"
        onClick={onRestart}
        className="mt-12 rounded-full border border-white/18 bg-white/8 px-7 py-3 font-sans text-sm uppercase tracking-[0.35em] text-white transition duration-500 hover:border-white/35 hover:bg-white/14"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35, duration: 0.9 }}
      >
        {content.buttonLabel}
      </motion.button>
    </motion.section>
  );
}
