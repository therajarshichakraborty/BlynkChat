import { notFound } from "next/navigation";
import { GroupManage } from "@/components/group/group-manage";
import { GroupSettingsPanel } from "@/components/group/group-settings-panel";
import { JoinRequests } from "@/components/group/join-requests";
import { SidePanel, SidePanelProvider, SidePanelToggle } from "@/components/shell/side-panel";
import { getConversation, getConversationInfo, getMessagePage } from "@/lib/data/chats";
import { getJoinRequests } from "@/lib/data/groups";
import { getProfile } from "@/lib/data/users";
import { ChatHeader } from "./chat-header";
import { Conversation } from "./conversation";
import { ConversationProvider } from "./conversation-provider";
import { ProfilePanel } from "./profile-panel";

type ChatViewProps = {
  userId: string;
  conversationId: string;
};

export async function ChatView({ userId, conversationId }: ChatViewProps) {
  const conversation = await getConversation(userId, conversationId);
  if (!conversation) notFound();

  const group = conversation.kind === "group";
  const [page, details, me, requests] = await Promise.all([
    getMessagePage(userId, conversationId),
    getConversationInfo(userId, conversationId),
    getProfile(userId),
    group && conversation.myRole !== "member" ? getJoinRequests(userId, conversationId) : Promise.resolve([]),
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
                group ? (
                  <>
                    <JoinRequests requests={requests} />
                    <GroupSettingsPanel
                      conversationId={conversation.id}
                      admin={conversation.myRole !== "member"}
                      title={conversation.title}
                      description={conversation.description}
                      onlyAdminsCanPost={conversation.onlyAdminsCanPost}
                      requireApproval={conversation.requireApproval}
                      disappearingSeconds={conversation.disappearingSeconds}
                    />
                    <GroupManage
                      conversationId={conversation.id}
                      meId={me.id}
                      myRole={conversation.myRole}
                      members={details.members}
                      memberCount={conversation.memberCount}
                      inviteCode={conversation.inviteCode}
                    />
                  </>
                ) : null
              }
            />
          </SidePanel>
        </main>
      </ConversationProvider>
    </SidePanelProvider>
  );
}
