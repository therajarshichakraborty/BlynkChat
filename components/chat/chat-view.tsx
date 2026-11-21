import { notFound } from "next/navigation";
import { SidePanel, SidePanelProvider, SidePanelToggle } from "@/components/shell/side-panel";
import { getConversation, getConversationInfo, getMessagePage } from "@/lib/data/chats";
import { getProfile } from "@/lib/data/users";
import { ChatHeader } from "./chat-header";
import { Conversation } from "./conversation";
import { ConversationProvider } from "./conversation-provider";
import { GroupManage } from "@/components/group/group-manage";
import { ProfilePanel } from "./profile-panel";

type ChatViewProps = {
  userId: string;
  conversationId: string;
};

export async function ChatView({ userId, conversationId }: ChatViewProps) {
  const conversation = await getConversation(userId, conversationId);
  if (!conversation) notFound();

  const [page, details, me] = await Promise.all([
    getMessagePage(userId, conversationId),
    getConversationInfo(userId, conversationId),
    getProfile(userId),
  ]);
  const panelLabel = conversation.kind === "direct" ? "contact info" : "group info";

  return (
    <SidePanelProvider>
      <ConversationProvider key={conversation.id} conversation={conversation} me={me} initialPage={page}>
        <main id="main" className="flex min-w-0 flex-1">
          <section aria-label={`Conversation with ${conversation.title}`} className="flex min-w-0 flex-1 flex-col">
            <ChatHeader conversation={conversation}>
              <SidePanelToggle label={panelLabel} />
            </ChatHeader>
            <Conversation />
          </section>
          <SidePanel label={panelLabel}>
            <ProfilePanel
              conversation={conversation}
              details={details}
              footer={
                conversation.kind === "group" ? (
                  <GroupManage
                    conversationId={conversation.id}
                    meId={me.id}
                    myRole={conversation.myRole}
                    members={details.members}
                    memberCount={conversation.memberCount}
                    inviteCode={conversation.inviteCode}
                  />
                ) : null
              }
            />
          </SidePanel>
        </main>
      </ConversationProvider>
    </SidePanelProvider>
  );
}
