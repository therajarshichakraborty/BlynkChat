import { Fragment } from "react";
import type { Message } from "@/types/chat";
import type { User } from "@/types/user";
import { DateDivider } from "./date-divider";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

type MessageListProps = {
  messages: Message[];
  people: Record<string, User>;
  currentUserId: string;
  group: boolean;
  typing?: User;
};

export function MessageList({ messages, people, currentUserId, group, typing }: MessageListProps) {
  return (
    <ol aria-label="Messages" className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-3 py-5 md:px-6">
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const outgoing = message.authorId === currentUserId;
        return (
          <Fragment key={message.id}>
            {previous?.day !== message.day ? <DateDivider label={message.day} /> : null}
            <MessageBubble
              message={message}
              author={people[message.authorId]}
              outgoing={outgoing}
              showAuthor={group && !outgoing}
            />
          </Fragment>
        );
      })}
      {typing ? (
        <TypingIndicator name={typing.firstName} initials={typing.initials} tone={typing.tone} />
      ) : null}
    </ol>
  );
}
