interface AudioControllerProps {
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
}

export function AudioController({
  muted,
  volume,
  onToggleMute,
  onVolumeChange,
}: AudioControllerProps) {
  return (
    <div className="glass-panel flex items-center gap-4 rounded-full px-4 py-3 text-xs uppercase tracking-[0.28em] text-white/70">
      <button
        type="button"
        onClick={onToggleMute}
        className="rounded-full border border-white/10 px-3 py-1 tracking-[0.24em] text-white transition hover:border-white/25 hover:bg-white/8"
        aria-label={muted ? "Unmute audio" : "Mute audio"}
      >
        {muted ? "Muted" : "Sound"}
      </button>

      <label className="flex items-center gap-3">
        <span className="text-[10px] tracking-[0.4em] text-white/45">Level</span>
        <input
          aria-label="Audio volume"
          type="range"
          min="0"
          max="100"
          value={Math.round(volume * 100)}
          onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
          className="audio-slider w-24 accent-white"
        />
      </label>
    </div>
  );
}
