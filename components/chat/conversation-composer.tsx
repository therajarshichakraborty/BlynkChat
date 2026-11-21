"use client";

import { PencilIcon } from "@/components/icons/pencil-icon";
import { ReplyIcon } from "@/components/icons/reply-icon";
import { firstName, messageSnippet } from "@/lib/utils/messages";
import { Composer } from "./composer";
import { ComposerBanner } from "./composer-banner";
import { ComposerNotice } from "./composer-notice";
import { useConversation } from "./conversation-provider";

function lockedReason(blocked: "none" | "by-me" | "by-them", onlyAdmins: boolean) {
  if (blocked === "by-me") return "You blocked this contact. Unblock them to send a message.";
  if (blocked === "by-them") return "You can no longer send messages to this contact.";
  if (onlyAdmins) return "Only admins can send messages here.";
  return "You can't send messages here.";
}

export function ConversationComposer() {
  const { conversation, me, replyingTo, setReplyingTo, editing, setEditing, send, saveEdit, signalTyping } =
    useConversation();

  if (!conversation.canPost) {
    return <ComposerNotice text={lockedReason(conversation.blocked, conversation.onlyAdminsCanPost)} />;
  }

  const placeholder =
    conversation.kind === "direct"
      ? `Message ${firstName(conversation.title)}…`
      : conversation.kind === "room"
        ? `Message #${conversation.title}`
        : `Message ${conversation.title}…`;

  const banner = editing ? (
    <ComposerBanner
      icon={<PencilIcon size={18} />}
      title="Edit message"
      text={editing.body}
      onCancel={() => setEditing(null)}
    />
  ) : replyingTo ? (
    <ComposerBanner
      icon={<ReplyIcon size={18} />}
      title={`Replying to ${replyingTo.sender?.id === me.id ? "yourself" : (replyingTo.sender?.name ?? "message")}`}
      text={messageSnippet(replyingTo)}
      onCancel={() => setReplyingTo(null)}
    />
  ) : null;

  return (
    <Composer
      key={editing?.id ?? "compose"}
      placeholder={placeholder}
      initialValue={editing?.body ?? ""}
      banner={banner}
      onCancel={editing ? () => setEditing(null) : replyingTo ? () => setReplyingTo(null) : undefined}
      onTyping={editing ? undefined : signalTyping}
      onSend={(body) => (editing ? saveEdit(editing.id, body) : send(body))}
    />
  );
}
