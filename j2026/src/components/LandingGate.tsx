import { motion } from "framer-motion";
import { useState } from "react";
import type { LandingContent } from "../types";

interface LandingGateProps {
  content: LandingContent;
  onUnlock: () => void;
}

export function LandingGate({ content, onUnlock }: LandingGateProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (value.trim() === content.password) {
      setError("");
      onUnlock();
      return;
    }

    setError("That password doesn't open this door.");
  };

  return (
    <motion.section
      key="landing-gate"
      className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-24 sm:px-10 lg:grid-cols-[0.92fr_1.08fr]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
    >
      <motion.div
        className="order-2 max-w-xl lg:order-1"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, delay: 0.2 }}
      >
        <p className="mb-5 font-sans text-xs uppercase tracking-[0.6em] text-white/50">
          {content.eyebrow}
        </p>
        <h1 className="font-serif text-5xl font-medium tracking-[0.03em] text-white sm:text-6xl">
          {content.title}
        </h1>
        <p className="mt-6 max-w-lg font-sans text-base leading-8 text-white/72 sm:text-lg">
          {content.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 max-w-md">
          <label className="mb-3 block font-sans text-[11px] uppercase tracking-[0.45em] text-white/45">
            {content.promptLabel}
          </label>

          <div className="glass-panel rounded-[1.6rem] p-3">
            <input
              type="password"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                if (error) {
                  setError("");
                }
              }}
              placeholder={content.placeholder}
              className="w-full rounded-[1rem] border border-white/10 bg-black/30 px-5 py-4 font-sans text-base text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
            />
          </div>

          <div className="mt-5 flex items-center gap-4">
            <button
              type="submit"
              className="rounded-full border border-white/18 bg-white/8 px-7 py-3 font-sans text-sm uppercase tracking-[0.35em] text-white transition duration-500 hover:border-white/35 hover:bg-white/14"
            >
              {content.buttonLabel}
            </button>
            <p className="font-sans text-xs text-white/40">{content.helperText}</p>
          </div>

          {error ? (
            <p className="mt-4 font-sans text-sm text-rose-200/90">{error}</p>
          ) : null}
        </form>
      </motion.div>

      <motion.div
        className="order-1 lg:order-2"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.15, ease: "easeOut" }}
      >
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-glow">
          <div className="absolute inset-0 z-[1] bg-vignette" />
          <img
            src={content.image}
            alt={content.title}
            className="aspect-[16/11] w-full rounded-[1.6rem] object-cover"
          />
        </div>
      </motion.div>
    </motion.section>
  );
}
