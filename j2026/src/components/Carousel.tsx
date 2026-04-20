import { AnimatePresence } from "framer-motion";
import type { ReactNode, TouchEvent } from "react";
import { useRef } from "react";

interface CarouselProps {
  children: ReactNode;
  onNext: () => void;
  onPrev: () => void;
}

const SWIPE_THRESHOLD = 55;

export function Carousel({ children, onNext, onPrev }: CarouselProps) {
  const startX = useRef<number | null>(null);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    startX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const endX = event.changedTouches[0]?.clientX;

    if (startX.current === null || endX === undefined) {
      return;
    }

    const delta = endX - startX.current;

    if (delta > SWIPE_THRESHOLD) {
      onPrev();
    } else if (delta < -SWIPE_THRESHOLD) {
      onNext();
    }

    startX.current = null;
  };

  return (
    <div className="relative flex-1" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <AnimatePresence initial={false} mode="wait">
        {children}
      </AnimatePresence>
    </div>
  );
}
