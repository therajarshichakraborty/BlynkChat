import type { ConversationView, MemberRoleView, MemberView } from "./conversation";
import type { Tone } from "./tone";
import type { AvatarPerson } from "./user";

export type CategoryView = "technology" | "design" | "ml" | "startups" | "campus" | "hobbies" | "local";

export type CommunitySummary = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  tone: Tone;
  image: string | null;
  description: string;
  memberCount: number;
  verified: boolean;
  joined: boolean;
  category: CategoryView;
  visibility: "public" | "private";
  memberSample: AvatarPerson[];
  activity: string;
  unread: number;
  highlight?: string;
};

export type RoomIconView = "hash" | "megaphone" | "briefcase" | "book";

export type RoomSummary = {
  id: string;
  slug: string;
  name: string;
  icon: RoomIconView;
  topic: string;
  unread: number;
};

export type CommunityRoomPage = {
  community: CommunitySummary & { role: MemberRoleView };
  room: RoomSummary;
  rooms: RoomSummary[];
  conversation: ConversationView;
  pinned: { id: string; text: string } | null;
  admins: MemberView[];
  online: MemberView[];
  offline: MemberView[];
  onlineCount: number;
  offlineCount: number;
  headerSample: AvatarPerson[];
  extraCount: number;
};
