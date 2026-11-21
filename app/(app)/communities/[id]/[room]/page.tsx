import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Conversation } from "@/components/chat/conversation";
import { ConversationProvider } from "@/components/chat/conversation-provider";
import { CommunityPreview } from "@/components/community/community-preview";
import { CommunityRoomsSidebar } from "@/components/community/community-rooms-sidebar";
import { MembersPanel } from "@/components/community/members-panel";
import { PinnedBar } from "@/components/community/pinned-bar";
import { RoomHeader } from "@/components/community/room-header";
import { UsersIcon } from "@/components/icons/users-icon";
import { SidePanel, SidePanelProvider, SidePanelToggle } from "@/components/shell/side-panel";
import { getMessagePage, getPinnedMessages } from "@/lib/data/chats";
import { getRoom } from "@/lib/data/communities";
import { getProfile } from "@/lib/data/users";
import { requireUser } from "@/lib/server/session";
import { compactCount } from "@/lib/utils/format";

type RoomPageProps = {
  params: Promise<{ id: string; room: string }>;
};

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const user = await requireUser();
  const { id, room } = await params;
  const result = await getRoom(user.id, id, room);
  if (!result) return { title: "Room not found" };
  if (result.kind === "preview") return { title: result.community.name, description: result.community.description };
  return { title: `#${result.page.room.name} · ${result.page.community.name}`, description: result.page.room.topic };
}

export default async function RoomPage({ params }: RoomPageProps) {
  const user = await requireUser();
  const { id, room } = await params;
  const result = await getRoom(user.id, id, room);
  if (!result) notFound();
  if (result.kind === "preview") return <CommunityPreview community={result.community} />;

  const { page } = result;
  const [me, initialPage, pins] = await Promise.all([
    getProfile(user.id),
    getMessagePage(user.id, page.conversation.id),
    getPinnedMessages(user.id, page.conversation.id),
  ]);

  return (
    <SidePanelProvider>
      <CommunityRoomsSidebar page={page} />
      <ConversationProvider key={page.conversation.id} conversation={page.conversation} me={me} initialPage={initialPage}>
        <main id="main" className="flex min-w-0 flex-1">
          <section aria-label={`#${page.room.name}`} className="flex min-w-0 flex-1 flex-col">
            <RoomHeader
              name={page.room.name}
              topic={page.room.topic}
              onlineLabel={`${compactCount(page.onlineCount)} online`}
              sample={page.headerSample}
              extra={page.extraCount > 0 ? `+${compactCount(page.extraCount)}` : undefined}
            >
              <SidePanelToggle label="members">
                <UsersIcon size={20} />
              </SidePanelToggle>
            </RoomHeader>
            <PinnedBar pins={pins} />
            <Conversation variant="room" />
          </section>
          <SidePanel label="Members">
            <MembersPanel
              admins={page.admins}
              online={page.online}
              offline={page.offline}
              onlineCount={page.onlineCount}
              offlineCount={page.offlineCount}
            />
          </SidePanel>
        </main>
      </ConversationProvider>
    </SidePanelProvider>
  );
}
