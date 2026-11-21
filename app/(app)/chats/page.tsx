import type { Metadata } from "next";
import { MessageCircleIcon } from "@/components/icons/message-circle-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Chats",
  description: "Your conversations, groups and rooms.",
};

export default async function ChatsPage() {
  await requireUser();
  return (
    <main id="main" className="grid flex-1 place-items-center">
      <EmptyState
        icon={<MessageCircleIcon size={24} />}
        title="Pick a conversation"
        description="Choose a chat from the list or start a new one. Messages are end-to-end encrypted."
      />
    </main>
  );
}
