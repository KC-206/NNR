import { motion } from "framer-motion";
import type { MemoryEntry } from "../types";

interface SlideProps {
  memory: MemoryEntry;
  direction: 1 | -1;
  priorityImage: boolean;
  onSecretReveal: (message: string) => void;
}

export function Slide({ memory, direction, priorityImage, onSecretReveal }: SlideProps) {
  const imageFitClass = memory.imageFit === "cover" ? "object-cover" : "object-contain";
  const frameWidth = memory.frameWidth ?? 860;
  const frameHeight = memory.frameHeight ?? 1060;
  const displayScale = memory.displayScale ?? 1;
  const panelMaxWidth = Math.round(frameWidth * displayScale);
  const layoutClass =
    displayScale >= 2
      ? "lg:grid-cols-[0.72fr_1.28fr]"
      : displayScale >= 1.4
        ? "lg:grid-cols-[0.85fr_1.15fr]"
        : "lg:grid-cols-[1.1fr_0.9fr]";

  return (
    <motion.article
      className={`relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-6 pb-28 pt-24 sm:px-10 ${layoutClass}`}
      custom={direction}
      initial={{ opacity: 0, x: direction > 0 ? 90 : -90 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction > 0 ? -70 : 70 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="order-2 max-w-xl lg:order-1">
        <motion.p
          className="mb-5 font-sans text-xs uppercase tracking-[0.6em] text-white/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          {memory.year}
        </motion.p>

        <motion.h2
          className="font-serif text-4xl font-medium leading-tight tracking-[0.03em] text-white sm:text-5xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
        >
          {memory.title}
        </motion.h2>

        <motion.p
          className="mt-7 font-sans text-base leading-8 text-white/72 sm:text-lg"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.85 }}
        >
          {memory.text}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.8 }}
        >
          {memory.highlight ? (
            <span className="rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.42em] text-white/65">
              Highlighted Memory
            </span>
          ) : null}

          <span className="text-[10px] uppercase tracking-[0.4em] text-white/36">
            Hold space for another layer
          </span>
        </motion.div>
      </div>

      <motion.div
        className="order-1 lg:order-2"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <div
          className="relative mx-auto overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-glow"
          style={{ width: "100%", maxWidth: `${panelMaxWidth}px` }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full border border-white/14 bg-black/35 px-4 py-2 font-sans text-[10px] uppercase tracking-[0.34em] text-white/58 backdrop-blur-md transition hover:border-white/28 hover:bg-black/50 hover:text-white/82"
            aria-label="Reveal hidden message"
            onClick={() => memory.secretMessage && onSecretReveal(memory.secretMessage)}
          >
            Secret
          </button>

          <div className="absolute inset-0 z-[1] bg-vignette" />

          <div
            className="relative w-full rounded-[1.6rem] bg-white/95"
            style={{ aspectRatio: `${frameWidth} / ${frameHeight}` }}
          >
            <motion.img
              src={memory.image}
              alt={memory.title}
              loading={priorityImage ? "eager" : "lazy"}
              className={`h-full w-full rounded-[1.6rem] ${imageFitClass}`}
              initial={{ scale: 1.01 }}
              animate={{ scale: memory.imageFit === "cover" ? 1.05 : 1.02 }}
              transition={{ duration: 8, ease: "easeInOut" }}
            />
          </div>

          <div
            className="pointer-events-none absolute inset-0 rounded-[1.6rem]"
            style={{
              background: `linear-gradient(180deg, transparent 18%, ${memory.accent}22 100%)`,
            }}
          />
        </div>
      </motion.div>
    </motion.article>
  );
}
