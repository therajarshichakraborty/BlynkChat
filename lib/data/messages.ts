import { clockTime } from "@/lib/utils/time";
import type { Message } from "@/types/chat";
import type { RoomMessage } from "@/types/community";

type SendMessageInput = {
  id: string;
  chatId: string;
  authorId: string;
  body: string;
};

type SendRoomMessageInput = {
  id: string;
  authorId: string;
  body: string;
};

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), 600);
  });
}

export function sendMessage(input: SendMessageInput): Promise<Message> {
  return delay({ ...input, day: "Today", time: clockTime(), status: "sent" });
}

export function sendRoomMessage(input: SendRoomMessageInput): Promise<RoomMessage> {
  return delay({
    id: input.id,
    authorId: input.authorId,
    time: clockTime(),
    segments: [{ type: "text", value: input.body }],
  });
}
