"use client";

import type { ReactNode } from "react";
import { CopyIcon } from "@/components/icons/copy-icon";
import { ForwardIcon } from "@/components/icons/forward-icon";
import { SmilePlusIcon } from "@/components/icons/smile-plus-icon";
import { StarIcon } from "@/components/icons/star-icon";
import { MoreHorizontalIcon } from "@/components/icons/more-horizontal-icon";
import { PinIcon } from "@/components/icons/pin-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { RefreshIcon } from "@/components/icons/refresh-icon";
import { ReplyIcon } from "@/components/icons/reply-icon";
import { TrashIcon } from "@/components/icons/trash-icon";
import { cn } from "@/lib/utils/cn";
import { quickReactions } from "@/lib/validation/reactions";
import { ActionMenu, type MenuItem } from "./action-menu";
import { useConversation } from "./conversation-provider";
import { EmojiPicker } from "./emoji-picker";
import type { ThreadMessage } from "./thread-state";

const editWindowMs = 15 * 60 * 1000;
const deleteWindowMs = 60 * 60 * 1000;

type MessageActionsProps = {
  message: ThreadMessage;
  outgoing: boolean;
  extraItems?: MenuItem[];
  leading?: ReactNode;
  className?: string;
};

function within(createdAt: string, windowMs: number) {
  return Date.now() - Date.parse(createdAt) < windowMs;
}

export function MessageActions({ message, outgoing, extraItems = [], leading, className }: MessageActionsProps) {
  const { conversation, setReplyingTo, setEditing, remove, retry, dispatch, notify, react, star, setForwarding, pin, canPin } =
    useConversation();
  const admin = conversation.myRole !== "member" && conversation.kind !== "direct";

  if (message.pending === "sending") return null;

  if (message.pending === "failed") {
    return (
      <ActionMenu
        label="Message not sent"
        icon={<RefreshIcon size={16} />}
        className="self-center"
        items={[
          { label: "Try again", icon: <RefreshIcon size={16} />, onSelect: () => retry(message) },
          {
            label: "Discard",
            icon: <TrashIcon size={16} />,
            danger: true,
            onSelect: () => dispatch({ type: "discard", clientId: message.clientId ?? "" }),
          },
        ]}
      />
    );
  }

  const items: MenuItem[] = [];
  if (!message.deleted) {
    if (conversation.canPost) {
      items.push({ label: "Reply", icon: <ReplyIcon size={16} />, onSelect: () => setReplyingTo(message) });
    }
    if (message.body) {
      items.push({
        label: "Copy text",
        icon: <CopyIcon size={16} />,
        onSelect: () => {
          navigator.clipboard.writeText(message.body).then(
            () => notify("Copied to clipboard", "success"),
            () => notify("Could not copy this message."),
          );
        },
      });
    }
    items.push({
      label: message.starred ? "Unstar" : "Star",
      icon: <StarIcon size={16} />,
      onSelect: () => star(message),
    });
    if (message.kind !== "poll") {
      items.push({ label: "Forward", icon: <ForwardIcon size={16} />, onSelect: () => setForwarding(message) });
    }
    if (canPin && message.kind !== "system" && !message.threadRootId) {
      items.push({ label: message.pinned ? "Unpin" : "Pin", icon: <PinIcon size={16} />, onSelect: () => pin(message) });
    }
    items.push(...extraItems);
    if (outgoing && message.body && message.kind === "text" && within(message.createdAt, editWindowMs)) {
      items.push({ label: "Edit", icon: <PencilIcon size={16} />, onSelect: () => setEditing(message) });
    }
  }
  items.push({ label: "Delete for me", icon: <TrashIcon size={16} />, danger: true, onSelect: () => remove(message.id, "me") });
  if (!message.deleted && ((outgoing && within(message.createdAt, deleteWindowMs)) || admin)) {
    items.push({
      label: "Delete for everyone",
      icon: <TrashIcon size={16} />,
      danger: true,
      onSelect: () => remove(message.id, "everyone"),
    });
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 self-center opacity-0 transition-opacity duration-150 group-hover/message:opacity-100 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100 [@media(hover:none)]:opacity-100",
        outgoing && "flex-row-reverse",
        className,
      )}
    >
      {leading}
      {!message.deleted && conversation.blocked === "none" && message.kind !== "system" ? (
        <EmojiPicker
          label="React"
          icon={<SmilePlusIcon size={16} />}
          onPick={(emoji) => react(message, emoji)}
          emojis={quickReactions}
          align={outgoing ? "end" : "start"}
        />
      ) : null}
      {!message.deleted && conversation.canPost ? (
        <button
          type="button"
          aria-label="Reply"
          title="Reply"
          onClick={() => setReplyingTo(message)}
          className="inline-grid size-8 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-fg max-md:hidden"
        >
          <ReplyIcon size={16} />
        </button>
      ) : null}
      <ActionMenu label="Message options" icon={<MoreHorizontalIcon size={18} />} items={items} align={outgoing ? "end" : "start"} />
    </div>
  );
}
