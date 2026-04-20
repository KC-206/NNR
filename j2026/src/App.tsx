import { AnimatePresence, motion } from "framer-motion";
import { Howl } from "howler";
import { useEffect, useMemo, useRef, useState } from "react";
import { AudioController } from "./components/AudioController";
import { Carousel } from "./components/Carousel";
import { EndingScreen } from "./components/EndingScreen";
import { GradientBackground } from "./components/GradientBackground";
import { IntroScreen } from "./components/IntroScreen";
import { LandingGate } from "./components/LandingGate";
import { Navigation } from "./components/Navigation";
import { ParticleLayer } from "./components/ParticleLayer";
import { Slide } from "./components/Slide";
import {
  endingContent,
  hiddenMemory,
  introContent,
  landingContent,
  memories,
  playlist,
} from "./data/memories";

type Phase = "landing" | "intro" | "experience" | "ending";

const AUDIO_FADE_MS = 1400;

function App() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.46);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [secretToast, setSecretToast] = useState<string | null>(null);
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false);
  const soundMapRef = useRef<Map<string, Howl>>(new Map());
  const activeTrackRef = useRef<string | null>(null);

  const slides = useMemo(
    () => (hiddenUnlocked ? [...memories, hiddenMemory] : memories),
    [hiddenUnlocked],
  );

  const currentMemory = slides[currentIndex];
  const currentTrack = currentMemory?.song ?? playlist[currentIndex % playlist.length];
  const backgroundPalette =
    phase === "landing"
      ? landingContent.gradient
      : phase === "intro"
      ? introContent.gradient
      : phase === "ending"
        ? endingContent.gradient
        : currentMemory.gradient;
  const accent = phase === "experience" ? currentMemory.accent : "#f4c7da";

  useEffect(() => {
    memories.slice(0, 2).forEach((memory) => {
      const image = new Image();
      image.src = memory.image;
    });

    [...new Set([...playlist, ...memories.map((memory) => memory.song).filter(Boolean)])].forEach(
      (track) => {
        if (!track) {
          return;
        }

        getOrCreateSound(track);
      },
    );

    return () => {
      soundMapRef.current.forEach((sound) => sound.unload());
      soundMapRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (phase !== "experience" || currentIndex !== memories.length - 1 || hiddenUnlocked) {
      return;
    }

    const timer = window.setTimeout(() => {
      setHiddenUnlocked(true);
      setSecretToast("A final memory quietly unlocked.");
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [currentIndex, hiddenUnlocked, phase]);

  useEffect(() => {
    if (phase === "landing" || phase === "intro") {
      return;
    }

    if (phase === "ending") {
      const currentTrackId = activeTrackRef.current;

      if (!currentTrackId) {
        return;
      }

      const sound = getOrCreateSound(currentTrackId);
      sound.fade(sound.volume(), isMuted ? 0 : Math.max(volume * 0.25, 0.08), 1800);
      return;
    }

    fadeToTrack(currentTrack, isMuted ? 0 : volume);
  }, [currentTrack, isMuted, phase, volume]);

  useEffect(() => {
    if (!secretToast) {
      return;
    }

    const timer = window.setTimeout(() => setSecretToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [secretToast]);

  const goNext = () => {
    if (phase !== "experience") {
      return;
    }

    if (currentIndex >= slides.length - 1) {
      setPhase("ending");
      return;
    }

    setDirection(1);
    setCurrentIndex((value) => value + 1);
  };

  const goPrev = () => {
    if (phase !== "experience" || currentIndex === 0) {
      return;
    }

    setDirection(-1);
    setCurrentIndex((value) => value - 1);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        setSpaceHeld(true);
      }

      if (event.repeat || phase !== "experience") {
        return;
      }

      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goPrev();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setSpaceHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [phase, currentIndex, slides.length]);

  const handleBegin = () => {
    setPhase("experience");
    fadeToTrack(currentTrack, isMuted ? 0 : volume);
  };

  const handleRestart = () => {
    setPhase("landing");
    setCurrentIndex(0);
    setDirection(1);
    setHiddenUnlocked(false);
    setSpaceHeld(false);
    setSecretToast(null);

    const activeTrackId = activeTrackRef.current;

    if (activeTrackId) {
      const sound = getOrCreateSound(activeTrackId);
      sound.fade(sound.volume(), 0, AUDIO_FADE_MS);
      window.setTimeout(() => sound.stop(), AUDIO_FADE_MS + 100);
      activeTrackRef.current = null;
    }
  };

  function getOrCreateSound(track: string) {
    const existing = soundMapRef.current.get(track);

    if (existing) {
      return existing;
    }

    const sound = new Howl({
      src: [track],
      html5: false,
      preload: true,
      loop: true,
      volume: 0,
    });

    soundMapRef.current.set(track, sound);
    return sound;
  }

  function fadeToTrack(track: string, targetVolume: number) {
    const nextSound = getOrCreateSound(track);
    const activeTrackId = activeTrackRef.current;

    if (activeTrackId === track) {
      if (!nextSound.playing()) {
        nextSound.play();
      }

      nextSound.fade(nextSound.volume(), targetVolume, AUDIO_FADE_MS);
      return;
    }

    if (!nextSound.playing()) {
      nextSound.volume(0);
      nextSound.play();
    }

    nextSound.fade(nextSound.volume(), targetVolume, AUDIO_FADE_MS);

    if (activeTrackId) {
      const previousSound = getOrCreateSound(activeTrackId);
      previousSound.fade(previousSound.volume(), 0, AUDIO_FADE_MS);
      window.setTimeout(() => previousSound.stop(), AUDIO_FADE_MS + 100);
    }

    activeTrackRef.current = track;
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-black text-stone-100 selection:bg-white/20 selection:text-white">
      <GradientBackground palette={backgroundPalette} />
      <ParticleLayer accent={accent} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-6xl justify-end px-6 pt-6 sm:px-10">
          <div className="pointer-events-auto">
            <AudioController
              muted={isMuted}
              volume={volume}
              onToggleMute={() => setIsMuted((value) => !value)}
              onVolumeChange={setVolume}
            />
          </div>
        </div>

        <AnimatePresence initial={false} mode="wait">
          {phase === "landing" ? (
            <LandingGate key="landing" content={landingContent} onUnlock={() => setPhase("intro")} />
          ) : null}

          {phase === "intro" ? (
            <IntroScreen key="intro" content={introContent} onBegin={handleBegin} />
          ) : null}

          {phase === "experience" ? (
            <Carousel key="experience" onNext={goNext} onPrev={goPrev}>
              <Slide
                key={currentMemory.id}
                memory={currentMemory}
                direction={direction}
                priorityImage={currentIndex < 2}
                onSecretReveal={(message) => setSecretToast(message)}
              />
            </Carousel>
          ) : null}

          {phase === "ending" ? (
            <EndingScreen key="ending" content={endingContent} onRestart={handleRestart} />
          ) : null}
        </AnimatePresence>

        {phase === "experience" ? (
          <Navigation
            current={currentIndex + 1}
            total={slides.length}
            canGoBack={currentIndex > 0}
            canGoForward={true}
            onPrev={goPrev}
            onNext={goNext}
          />
        ) : null}

        <AnimatePresence>
          {spaceHeld && phase === "experience" ? (
            <motion.div
              key="alternate-message"
              className="pointer-events-none absolute inset-x-6 bottom-28 z-30 mx-auto max-w-2xl rounded-[1.8rem] border border-white/12 bg-black/45 px-6 py-5 text-center backdrop-blur-md sm:bottom-32"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.4 }}
            >
              <p className="font-sans text-[11px] uppercase tracking-[0.45em] text-white/40">
                Held Close
              </p>
              <p className="mt-3 font-serif text-xl leading-8 text-white/88">
                {currentMemory.altMessage}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {secretToast ? (
            <motion.div
              key={secretToast}
              className="pointer-events-none absolute inset-x-6 top-24 z-30 mx-auto max-w-lg rounded-full border border-white/12 bg-black/45 px-6 py-4 text-center font-sans text-xs uppercase tracking-[0.28em] text-white/72 backdrop-blur-md"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45 }}
            >
              {secretToast}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
