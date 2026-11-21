import { MicOffIcon } from "@/components/icons/mic-off-icon";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import type { Tone } from "@/types/tone";

type VideoTileProps = {
  name: string;
  initials: string;
  tone: Tone;
  background: string;
  speaking?: boolean;
  muted?: boolean;
  className?: string;
};

export function VideoTile({
  name,
  initials,
  tone,
  background,
  speaking = false,
  muted = false,
  className,
}: VideoTileProps) {
  return (
    <span
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-lg",
        background,
        speaking && "ring-2 ring-white/90",
        className,
      )}
    >
      <Avatar initials={initials} tone={tone} size="lg" />
      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-2xs font-medium text-white backdrop-blur">
        {muted ? <MicOffIcon size={11} /> : null}
        {name}
      </span>
    </span>
  );
}
