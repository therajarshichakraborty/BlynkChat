"use client";

import { useTimeZone } from "@/components/shell/time-zone";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { lastSeenLabel } from "@/lib/utils/time";
import { useConversation } from "./conversation-provider";

function memberLabel(count: number) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? "member" : "members"}`;
}

export function ChatHeaderAvatar() {
  const { conversation, presence } = useConversation();
  return (
    <Avatar
      initials={conversation.initials}
      tone={conversation.tone}
      image={conversation.image}
      size="lg"
      online={presence?.online ?? false}
    />
  );
}

export function ChatSubtitle() {
  const { conversation, presence, typingLabel } = useConversation();
  const timeZone = useTimeZone();

  let text = "";
  if (typingLabel) text = typingLabel;
  else if (conversation.kind === "direct") {
    if (conversation.blocked !== "none") text = conversation.peer ? `@${conversation.peer.username}` : "";
    else if (presence?.online) text = "online";
    else if (presence?.lastSeenAt) text = lastSeenLabel(presence.lastSeenAt, timeZone);
    else text = conversation.peer?.title || (conversation.peer ? `@${conversation.peer.username}` : "");
  } else if (conversation.kind === "room" && conversation.community) {
    text = `${conversation.community.name} · ${memberLabel(conversation.memberCount)}`;
  } else text = memberLabel(conversation.memberCount);

  return (
    <p className={cn("truncate text-sm", typingLabel ? "font-medium text-accent-text" : "text-muted")} aria-live="polite">
      {text}
    </p>
  );
}
