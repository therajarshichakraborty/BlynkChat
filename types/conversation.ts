import type { ReceiptView } from "./message";
import type { Tone } from "./tone";

export type ChatKind = "direct" | "group" | "room";

export type ChatFilter = "all" | "unread" | "groups" | "rooms" | "archived";

export type MemberRoleView = "owner" | "admin" | "member";

export type ChatPreview = {
  kind: "text" | "image" | "file" | "voice" | "poll" | "system" | "deleted";
  text: string;
  author: string | null;
  fromMe: boolean;
};

export type ChatSummary = {
  id: string;
  kind: ChatKind;
  title: string;
  initials: string;
  tone: Tone;
  image: string | null;
  href: string;
  peerId: string | null;
  memberCount: number;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  unread: number;
  lastActivityAt: string;
  preview: ChatPreview | null;
  online: boolean;
};

export type PersonView = {
  id: string;
  name: string;
  username: string;
  initials: string;
  tone: Tone;
  image: string | null;
  bio: string;
  title: string;
  location: string;
};

export type PresenceView = {
  online: boolean;
  lastSeenAt: string | null;
};

export type ConversationView = {
  id: string;
  kind: ChatKind;
  title: string;
  description: string;
  initials: string;
  tone: Tone;
  image: string | null;
  peer: PersonView | null;
  presence: PresenceView | null;
  memberCount: number;
  myRole: MemberRoleView;
  canPost: boolean;
  blocked: "none" | "by-me" | "by-them";
  muted: boolean;
  pinned: boolean;
  archived: boolean;
  onlyAdminsCanPost: boolean;
  requireApproval: boolean;
  disappearingSeconds: number | null;
  inviteCode: string | null;
  receiptsEnabled: boolean;
  receipts: ReceiptView[];
  lastReadAt: string | null;
  community: { slug: string; name: string } | null;
};
