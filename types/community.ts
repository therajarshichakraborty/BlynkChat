import type { Reaction } from "./chat";
import type { Tone } from "./tone";
import type { AvatarPerson, User } from "./user";

export type CommunityCategory =
  | "technology"
  | "design"
  | "ml"
  | "startups"
  | "campus"
  | "hobbies"
  | "local";

export type Community = {
  id: string;
  name: string;
  initials: string;
  tone: Tone;
  description: string;
  memberCount: string;
  verified: boolean;
  joined: boolean;
  categories: CommunityCategory[];
  memberSample: AvatarPerson[];
  activity: string;
  unread: number;
  highlight?: string;
};

export type RoomIcon = "hash" | "megaphone" | "briefcase" | "book";

export type TextRoom = {
  id: string;
  name: string;
  icon: RoomIcon;
  topic: string;
  unread: number;
};

export type VoiceRoom = {
  id: string;
  name: string;
  live: number;
  participants: AvatarPerson[];
  activity?: string;
};

export type MemberRole = "owner" | "admin" | "member";

export type CommunityMember = {
  user: User;
  role: MemberRole;
};

export type MessageSegment = {
  type: "text" | "code";
  value: string;
};

export type PollOption = {
  label: string;
  percent: number;
  voted: boolean;
};

export type Poll = {
  title: string;
  votes: number;
  options: PollOption[];
};

export type ThreadSummary = {
  count: number;
  lastReply: string;
  participants: AvatarPerson[];
};

export type RoomMedia = {
  kind: "video" | "image";
  tone: Tone;
  alt: string;
  duration?: string;
};

export type RoomMessage = {
  id: string;
  authorId: string;
  time: string;
  segments: MessageSegment[];
  reactions?: Reaction[];
  thread?: ThreadSummary;
  poll?: Poll;
  media?: RoomMedia[];
};

export type CommunityRoomView = {
  community: Community;
  room: TextRoom;
  textRooms: TextRoom[];
  voiceRooms: VoiceRoom[];
  pinned?: string;
  onlineLabel: string;
  people: Record<string, User>;
  messages: RoomMessage[];
  typingLabel?: string;
  admins: CommunityMember[];
  online: CommunityMember[];
  offline: CommunityMember[];
  onlineCount: number;
  offlineCount: number;
  headerSample: AvatarPerson[];
  headerExtra: string;
};
