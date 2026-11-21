import type { Tone } from "./tone";

export type RealtimeEventMap = {
  "message.created": {
    conversationId: string;
    messageId: string;
    senderId: string | null;
    threadRootId: string | null;
  };
  "message.updated": { conversationId: string; messageId: string };
  "message.deleted": { conversationId: string; messageId: string };
  "reaction.changed": { conversationId: string; messageId: string };
  "receipt.updated": {
    conversationId: string;
    userId: string;
    lastReadAt: string | null;
    lastDeliveredAt: string | null;
  };
  typing: { conversationId: string; userId: string; name: string; initials: string; tone: Tone };
  presence: { userId: string; online: boolean; lastSeenAt: string | null };
  "conversation.updated": { conversationId: string };
  "member.changed": { conversationId: string; userId: string };
  "poll.updated": { conversationId: string; messageId: string };
  "story.created": { storyId: string; authorId: string };
  resync: { reason: string };
};

export type RealtimeEventType = keyof RealtimeEventMap;

export type RealtimeEvent = {
  [K in RealtimeEventType]: { id: string; type: K; data: RealtimeEventMap[K] };
}[RealtimeEventType];

export type RealtimeEventOf<K extends RealtimeEventType> = Extract<RealtimeEvent, { type: K }>;
