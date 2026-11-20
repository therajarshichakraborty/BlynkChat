import type { Tone } from "./tone";
import type { User } from "./user";

export type ChatKind = "direct" | "group" | "room";

export type ChatFilter = "all" | "unread" | "groups" | "rooms" | "starred";

export type DeliveryStatus = "sending" | "sent" | "read";

export type ChatPreview = {
  kind: "text" | "voice" | "photo";
  text: string;
  author?: string;
  fromMe: boolean;
  status?: DeliveryStatus;
};

export type Chat = {
  id: string;
  kind: ChatKind;
  title: string;
  initials: string;
  tone: Tone;
  peerId?: string;
  memberCount?: string;
  pinned: boolean;
  muted: boolean;
  starred: boolean;
  unread: number;
  lastAt: string;
  preview: ChatPreview;
  typing: boolean;
  online: boolean;
};

export type Reaction = {
  emoji: string;
  count: number;
  mine: boolean;
};

export type FileAttachment = {
  name: string;
  size: string;
  type: string;
};

export type VoiceNote = {
  duration: string;
  bars: number[];
};

export type ReplyQuote = {
  author: string;
  text: string;
};

export type ImageAttachment = {
  tone: Tone;
  alt: string;
};

export type Message = {
  id: string;
  chatId: string;
  authorId: string;
  day: string;
  time: string;
  body?: string;
  status?: DeliveryStatus;
  replyTo?: ReplyQuote;
  file?: FileAttachment;
  voice?: VoiceNote;
  image?: ImageAttachment;
  reactions?: Reaction[];
};

export type SharedItem = {
  kind: "file" | "link";
  name: string;
  meta: string;
};

export type ChatThread = {
  chat: Chat;
  peer?: User;
  people: Record<string, User>;
  messages: Message[];
  media: Tone[];
  mediaCount: number;
  shared: SharedItem[];
  commonGroups: Chat[];
};
