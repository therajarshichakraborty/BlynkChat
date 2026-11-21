import { GlobeIcon } from "@/components/icons/globe-icon";
import { UserPlusIcon } from "@/components/icons/user-plus-icon";
import { VideoIcon } from "@/components/icons/video-icon";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils/cn";
import { toneBanner } from "@/lib/utils/tone";
import type { CommunityRoomView } from "@/types/community";
import { RoomList } from "./room-list";

type CommunityRoomsSidebarProps = {
  view: CommunityRoomView;
};

export function CommunityRoomsSidebar({ view }: CommunityRoomsSidebarProps) {
  const { community } = view;

  return (
    <aside
      aria-label={`${community.name} rooms`}
      className="flex w-72 shrink-0 flex-col border-r border-line bg-surface max-md:hidden xl:w-80"
    >
      <div className="border-b border-line p-4">
        <div aria-hidden="true" className={cn("h-24 rounded-lg", toneBanner("blue"))} />
        <Avatar
          initials={community.initials}
          tone={community.tone}
          size="xl"
          shape="square"
          className="-mt-10 ml-3 rounded-xl ring-4 ring-surface"
        />
        <div className="mt-2 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold tracking-tight">{community.name}</h2>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <GlobeIcon size={14} />
              Community · {community.memberCount} members
            </p>
          </div>
          <IconButton label={`Invite people to ${community.name}`} variant="outline">
            <UserPlusIcon size={19} />
          </IconButton>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <RoomList
          communityId={community.id}
          activeRoom={view.room.id}
          textRooms={view.textRooms}
          voiceRooms={view.voiceRooms}
        />
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
