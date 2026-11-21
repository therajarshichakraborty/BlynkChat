import { PlayIcon } from "@/components/icons/play-icon";
import { cn } from "@/lib/utils/cn";
import { toneGradient } from "@/lib/utils/tone";
import type { RoomMedia as RoomMediaData } from "@/types/community";

type RoomMediaProps = {
  media: RoomMediaData[];
};

export function RoomMedia({ media }: RoomMediaProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {media.map((item) => (
        <li
          key={item.alt}
          role="img"
          aria-label={item.kind === "video" ? `Video, ${item.duration}: ${item.alt}` : item.alt}
          className={cn(
            "relative grid h-40 place-items-center overflow-hidden rounded-lg md:h-46",
            item.kind === "video" ? "aspect-video" : "aspect-square",
            toneGradient(item.tone),
          )}
        >
          {item.kind === "video" ? (
            <>
              <span className="inline-grid size-12 place-items-center rounded-full bg-black/25 text-white backdrop-blur">
                <PlayIcon size={22} />
              </span>
              <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
                {item.duration}
              </span>
            </>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
