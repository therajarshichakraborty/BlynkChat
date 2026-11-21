import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityRoomsSidebar } from "@/components/community/community-rooms-sidebar";
import { MembersPanel } from "@/components/community/members-panel";
import { RoomFeed } from "@/components/community/room-feed";
import { RoomHeader } from "@/components/community/room-header";
import { PinIcon } from "@/components/icons/pin-icon";
import { UsersIcon } from "@/components/icons/users-icon";
import { SidePanel, SidePanelProvider, SidePanelToggle } from "@/components/shell/side-panel";
import { getRoomView } from "@/lib/data/rooms";
import { requireUser } from "@/lib/server/session";
import { getCurrentUser } from "@/lib/data/users";

type RoomPageProps = {
  params: Promise<{ id: string; room: string }>;
};

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { id, room } = await params;
  const view = getRoomView(id, room);
  return view
    ? {
        title: `#${view.room.name} · ${view.community.name}`,
        description: view.room.topic,
      }
    : { title: "Room not found" };
}

export default async function RoomPage({ params }: RoomPageProps) {
  await requireUser();
  const { id, room } = await params;
  const view = getRoomView(id, room);
  if (!view) notFound();

  return (
    <SidePanelProvider>
      <CommunityRoomsSidebar view={view} />
      <main id="main" className="flex min-w-0 flex-1">
        <section aria-label={`#${view.room.name}`} className="flex min-w-0 flex-1 flex-col">
          <RoomHeader
            name={view.room.name}
            topic={view.room.topic}
            onlineLabel={view.onlineLabel}
            sample={view.headerSample}
            extra={view.headerExtra}
          >
            <SidePanelToggle label="members">
              <UsersIcon size={20} />
            </SidePanelToggle>
          </RoomHeader>
          {view.pinned ? (
            <p className="flex items-center gap-2.5 border-b border-line bg-accent-soft px-4 py-2.5 text-sm md:px-8 md:text-base">
              <PinIcon size={16} className="shrink-0 text-accent-text" />
              <span className="min-w-0 truncate">
                <strong className="font-semibold">Pinned:</strong>{" "}
                <span className="text-muted">{view.pinned}</span>
              </span>
            </p>
          ) : null}
          <RoomFeed
            key={view.room.id}
            roomName={view.room.name}
            currentUserId={getCurrentUser().id}
            initialMessages={view.messages}
            people={view.people}
            typingLabel={view.typingLabel}
          />
        </section>
        <SidePanel label="Members">
          <MembersPanel
            admins={view.admins}
            online={view.online}
            offline={view.offline}
            onlineCount={view.onlineCount}
            offlineCount={view.offlineCount}
          />
        </SidePanel>
      </main>
    </SidePanelProvider>
  );
}
