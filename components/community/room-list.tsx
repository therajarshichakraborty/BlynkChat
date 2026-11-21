import Link from "next/link";
import { BookOpenIcon } from "@/components/icons/book-open-icon";
import { BriefcaseIcon } from "@/components/icons/briefcase-icon";
import { HashIcon } from "@/components/icons/hash-icon";
import { MegaphoneIcon } from "@/components/icons/megaphone-icon";
import { VolumeIcon } from "@/components/icons/volume-icon";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { roomHref } from "@/lib/utils/community-links";
import { cn } from "@/lib/utils/cn";
import type { RoomIconView, RoomSummary } from "@/types/community";

const roomIcons: Record<RoomIconView, typeof HashIcon> = {
  hash: HashIcon,
  megaphone: MegaphoneIcon,
  briefcase: BriefcaseIcon,
  book: BookOpenIcon,
};

type RoomListProps = {
  communitySlug: string;
  activeRoom: string;
  rooms: RoomSummary[];
};

export function RoomList({ communitySlug, activeRoom, rooms }: RoomListProps) {
  return (
    <nav aria-label="Rooms" className="flex flex-col gap-6 px-3 py-5">
      <section aria-labelledby="text-rooms">
        <h3 id="text-rooms" className="px-3 pb-2 text-2xs font-semibold tracking-wider text-muted uppercase">
          Text rooms
        </h3>
        <ul className="flex flex-col gap-0.5">
          {rooms.map((room) => {
            const RoomGlyph = roomIcons[room.icon];
            const active = room.slug === activeRoom;
            return (
              <li key={room.id}>
                <Link
                  href={roomHref(communitySlug, room.slug)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2.5 rounded-md border px-3 text-md transition-colors duration-150",
                    active
                      ? "border-line bg-card font-medium text-fg shadow-xs"
                      : "border-transparent text-muted hover:bg-raised hover:text-fg",
                    room.unread > 0 && !active && "font-medium text-fg",
                  )}
                >
                  <RoomGlyph size={17} className="shrink-0 text-muted" />
                  <span className="truncate">{room.name}</span>
                  {room.unread > 0 && !active ? <Badge count={room.unread} label="unread" className="ml-auto" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <section aria-labelledby="voice-rooms">
        <h3 id="voice-rooms" className="px-3 pb-2 text-2xs font-semibold tracking-wider text-muted uppercase">
          Voice rooms
        </h3>
        <ul className="flex flex-col gap-1">
          <li className="flex items-center gap-2.5 rounded-md px-3 py-2 text-md text-muted" title="Voice rooms are coming soon">
            <VolumeIcon size={17} className="shrink-0" />
            <span className="truncate">Lounge</span>
            <Tag className="ml-auto">Soon</Tag>
          </li>
        </ul>
      </section>
    </nav>
  );
}
