"use client";

import { useState } from "react";
import { PauseIcon } from "@/components/icons/pause-icon";
import { PlayIcon } from "@/components/icons/play-icon";
import { Waveform } from "@/components/ui/waveform";
import { cn } from "@/lib/utils/cn";
import type { VoiceNote as VoiceNoteData } from "@/types/chat";

type VoiceNoteProps = {
  voice: VoiceNoteData;
  outgoing: boolean;
};

export function VoiceNote({ voice, outgoing }: VoiceNoteProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setPlaying((value) => !value)}
        aria-label={playing ? "Pause voice message" : `Play voice message, ${voice.duration}`}
        aria-pressed={playing}
        className={cn(
          "inline-grid size-10 shrink-0 place-items-center rounded-full transition-transform duration-150 active:scale-95",
          outgoing ? "bg-white text-accent-solid" : "bg-accent-solid text-on-accent",
        )}
      >
        {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
      </button>
      <Waveform bars={voice.bars} played={playing ? 0.4 : 0} className="min-w-0 overflow-hidden" />
      <span className="text-sm tabular-nums">{voice.duration}</span>
    </div>
  );
}
