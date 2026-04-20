interface NavigationProps {
  current: number;
  total: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function Navigation({
  current,
  total,
  canGoBack,
  canGoForward,
  onPrev,
  onNext,
}: NavigationProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-6 sm:px-10 sm:pb-10">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoBack}
        className="pointer-events-auto rounded-full border border-white/12 bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.34em] text-white/75 transition hover:border-white/28 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Prev
      </button>

      <div className="glass-panel pointer-events-auto rounded-full px-5 py-3 text-center text-xs uppercase tracking-[0.45em] text-white/60">
        {current} / {total}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoForward}
        className="pointer-events-auto rounded-full border border-white/12 bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.34em] text-white/75 transition hover:border-white/28 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}
