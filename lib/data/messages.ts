import type { Message } from "@/types/chat";

type SendMessageInput = {
  id: string;
  chatId: string;
  authorId: string;
  body: string;
  time: string;
};

export function sendMessage(input: SendMessageInput): Promise<Message> {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve({ ...input, day: "Today", status: "sent" }),
      600,
    );
  });
}
