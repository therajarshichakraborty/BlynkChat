import type { RoomMessage } from "@/types/community";

type SendRoomMessageInput = {
  id: string;
  authorId: string;
  body: string;
};

function clockTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), 600);
  });
}

export function sendRoomMessage(input: SendRoomMessageInput): Promise<RoomMessage> {
  return delay({
    id: input.id,
    authorId: input.authorId,
    time: clockTime(),
    segments: [{ type: "text", value: input.body }],
  });
}
