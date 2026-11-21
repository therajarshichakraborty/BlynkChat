import { GlobeIcon } from "@/components/icons/globe-icon";
import { LockIcon } from "@/components/icons/lock-icon";
import { VideoIcon } from "@/components/icons/video-icon";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils/cn";
import { compactCount } from "@/lib/utils/format";
import { toneBanner } from "@/lib/utils/tone";
import type { CommunityRoomPage } from "@/types/community";
import { CopyInviteButton } from "./copy-invite-button";
import { RoomList } from "./room-list";

type CommunityRoomsSidebarProps = {
  page: CommunityRoomPage;
};

export function CommunityRoomsSidebar({ page }: CommunityRoomsSidebarProps) {
  const { community } = page;

  return (
    <aside
      aria-label={`${community.name} rooms`}
      className="flex w-72 shrink-0 flex-col border-r border-line bg-surface max-md:hidden xl:w-80"
    >
      <div className="border-b border-line p-4">
        <div aria-hidden="true" className={cn("h-24 rounded-lg", toneBanner(community.tone))} />
        <Avatar
          initials={community.initials}
          tone={community.tone}
          image={community.image}
          size="xl"
          shape="square"
          className="-mt-10 ml-3 rounded-xl ring-4 ring-surface"
        />
        <div className="mt-2 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold tracking-tight">{community.name}</h2>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              {community.visibility === "public" ? <GlobeIcon size={14} /> : <LockIcon size={14} />}
              Community · {compactCount(community.memberCount)} members
            </p>
          </div>
          <CopyInviteButton name={community.name} path={`/communities/${community.slug}/general`} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <RoomList communitySlug={community.slug} activeRoom={page.room.slug} rooms={page.rooms} />
      </div>
      <div className="p-4">
        <div className="rounded-lg border border-line bg-card p-4 shadow-xs">
          <p className="flex items-center gap-2 text-md font-medium">
            <VideoIcon size={18} className="text-accent-text" />
            Video rooms
            <Tag className="ml-auto">Soon</Tag>
          </p>
          <p className="mt-1 text-sm text-muted">Drop-in video for every community room.</p>
        </div>
      </div>
    </aside>
  );
}
