"use client";

import { Fragment, type ReactNode, type Ref } from "react";
import { useTimeZone } from "@/components/shell/time-zone";
import { dayKey, dayLabel } from "@/lib/utils/time";
import { DateDivider } from "./date-divider";
import type { ThreadMessage } from "./thread-state";
import { UnreadDivider } from "./unread-divider";

type MessageListProps = {
  messages: ThreadMessage[];
  unreadFromId: string | null;
  unreadCount: number;
  unreadRef?: Ref<HTMLLIElement>;
  renderMessage: (message: ThreadMessage, previous: ThreadMessage | undefined) => ReactNode;
  className?: string;
  children?: ReactNode;
};

export function MessageList({
  messages,
  unreadFromId,
  unreadCount,
  unreadRef,
  renderMessage,
  className = "mx-auto flex w-full max-w-4xl flex-col gap-3 px-3 py-5 md:px-6",
  children,
}: MessageListProps) {
  const timeZone = useTimeZone();

  return (
    <ol aria-label="Messages" className={className}>
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const day = dayKey(message.createdAt, timeZone);
        const newDay = !previous || dayKey(previous.createdAt, timeZone) !== day;
        return (
          <Fragment key={message.clientId ?? message.id}>
            {newDay ? <DateDivider label={dayLabel(message.createdAt, timeZone)} /> : null}
            {message.id === unreadFromId && unreadCount > 0 ? (
              <UnreadDivider ref={unreadRef} count={unreadCount} />
            ) : null}
            {renderMessage(message, previous)}
          </Fragment>
        );
      })}
      {children}
    </ol>
  );
}
