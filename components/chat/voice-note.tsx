"use client";

import { useRef, useState } from "react";
import { PauseIcon } from "@/components/icons/pause-icon";
import { PlayIcon } from "@/components/icons/play-icon";
import { Waveform } from "@/components/ui/waveform";
import { cn } from "@/lib/utils/cn";
import { formatDuration } from "@/lib/utils/time";
import type { AttachmentView } from "@/types/message";

type VoiceNoteProps = {
  voice: AttachmentView;
  outgoing: boolean;
};

const fallbackBars = Array.from({ length: 32 }, (_, index) => 6 + ((index * 7) % 14));

export function VoiceNote({ voice, outgoing }: VoiceNoteProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const durationMs = voice.durationMs ?? 0;
  const bars = voice.waveform.length > 0 ? voice.waveform : fallbackBars;

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  function handleTime() {
    const audio = audioRef.current;
    if (!audio || !durationMs) return;
    setProgress(Math.min(1, (audio.currentTime * 1000) / durationMs));
  }

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audioRef}
        src={voice.url}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={handleTime}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice message" : `Play voice message, ${formatDuration(durationMs)}`}
        aria-pressed={playing}
        className={cn(
          "inline-grid size-10 shrink-0 place-items-center rounded-full transition-transform duration-150 active:scale-95",
          outgoing ? "bg-white text-accent-solid" : "bg-accent-solid text-on-accent",
        )}
      >
        {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
      </button>
      <Waveform bars={bars} played={playing ? Math.max(progress, 0.01) : progress} className="min-w-0 overflow-hidden" />
      <span className="text-sm tabular-nums">{formatDuration(durationMs)}</span>
    </div>
  );
}
