import type { Tone } from "./tone";

export type MessageKindView = "text" | "image" | "file" | "voice" | "poll" | "system";

export type DeliveryStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export type SenderView = {
  id: string;
  name: string;
  username: string;
  initials: string;
  tone: Tone;
  image: string | null;
};

export type AttachmentView = {
  id: string;
  kind: "image" | "file" | "voice";
  name: string;
  mime: string;
  size: number;
  url: string;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  waveform: number[];
};

export type ReactionView = {
  emoji: string;
  count: number;
  mine: boolean;
};

export type ReplyView = {
  id: string;
  author: string;
  text: string;
};

export type PollOptionView = {
  id: string;
  label: string;
  votes: number;
  percent: number;
  voted: boolean;
};

export type PollView = {
  id: string;
  question: string;
  multipleChoice: boolean;
  totalVotes: number;
  closed: boolean;
  options: PollOptionView[];
};

export type ThreadSummaryView = {
  count: number;
  lastReplyAt: string;
  participants: { initials: string; tone: Tone }[];
};

export type MessageView = {
  id: string;
  conversationId: string;
  clientId: string | null;
  sender: SenderView | null;
  kind: MessageKindView;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
  forwarded: boolean;
  starred: boolean;
  pinned: boolean;
  replyTo: ReplyView | null;
  attachments: AttachmentView[];
  reactions: ReactionView[];
  poll: PollView | null;
  threadRootId: string | null;
  thread: ThreadSummaryView | null;
};

export type MessagePage = {
  messages: MessageView[];
  nextCursor: string | null;
};

export type ReceiptView = {
  userId: string;
  lastReadAt: string | null;
  lastDeliveredAt: string | null;
};
