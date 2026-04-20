import { motion } from "framer-motion";
import type { IntroContent } from "../types";

interface IntroScreenProps {
  content: IntroContent;
  onBegin: () => void;
}

export function IntroScreen({ content, onBegin }: IntroScreenProps) {
  return (
    <motion.section
      key="intro-screen"
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 pb-20 pt-24 sm:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      transition={{ duration: 1.4, ease: "easeOut" }}
    >
      <motion.p
        className="mb-5 font-sans text-xs uppercase tracking-[0.6em] text-white/55"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {content.eyebrow}
      </motion.p>

      <motion.h1
        className="max-w-3xl font-serif text-5xl font-medium tracking-[0.03em] text-white sm:text-6xl lg:text-7xl"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 1 }}
      >
        {content.title}
      </motion.h1>

      <motion.p
        className="mt-6 max-w-xl font-sans text-base leading-8 text-white/70 sm:text-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1 }}
      >
        {content.subtitle}
      </motion.p>

      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.9 }}
      >
        <button
          type="button"
          onClick={onBegin}
          className="group rounded-full border border-white/20 bg-white/8 px-7 py-3 font-sans text-sm uppercase tracking-[0.35em] text-white transition duration-500 hover:border-white/35 hover:bg-white/14"
        >
          <span className="transition duration-500 group-hover:tracking-[0.42em]">
            {content.buttonLabel}
          </span>
        </button>
      </motion.div>
    </motion.section>
  );
}
