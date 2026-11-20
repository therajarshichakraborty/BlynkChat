import type { MemberRole, RoomMessage, TextRoom, VoiceRoom } from "@/types/community";

type RoomFixture = {
  textRooms: TextRoom[];
  voiceRooms: VoiceRoom[];
  pinned?: string;
  onlineLabel: string;
  messages: Record<string, RoomMessage[]>;
  typingLabel?: string;
  roles: Record<string, MemberRole>;
  onlineCount: number;
  offlineCount: number;
  headerExtra: string;
};

export const designEngineersRooms: RoomFixture = {
  textRooms: [
    {
      id: "announcements",
      name: "announcements",
      icon: "megaphone",
      topic: "Updates from the moderators",
      unread: 0,
    },
    {
      id: "general",
      name: "general",
      icon: "hash",
      topic: "Daily chatter, wins, and questions",
      unread: 0,
    },
    {
      id: "show-and-tell",
      name: "show-and-tell",
      icon: "hash",
      topic: "Share what you shipped this week",
      unread: 8,
    },
    {
      id: "motion-design",
      name: "motion-design",
      icon: "hash",
      topic: "Springs, curves and choreography",
      unread: 3,
    },
    {
      id: "jobs-board",
      name: "jobs-board",
      icon: "briefcase",
      topic: "Roles at design-led teams",
      unread: 0,
    },
    {
      id: "resources",
      name: "resources",
      icon: "book",
      topic: "Talks, articles and libraries worth keeping",
      unread: 0,
    },
  ],
  voiceRooms: [
    {
      id: "lounge",
      name: "Lounge",
      live: 3,
      participants: [
        { initials: "MI", tone: "teal" },
        { initials: "RM", tone: "cyan" },
        { initials: "IV", tone: "pink" },
      ],
      activity: "Talking about Rive",
    },
    { id: "design-crit", name: "Design crit", live: 0, participants: [] },
  ],
  pinned: "Community call this Friday, 7pm IST. Bring your side projects!",
  onlineLabel: "842 online",
  typingLabel: "Isha and 2 others are typing…",
  roles: {
    kabir: "owner",
    ananya: "admin",
  },
  onlineCount: 42,
  offlineCount: 86,
  headerExtra: "+1.2k",
  messages: {
    general: [
      {
        id: "general-1",
        authorId: "kabir",
        time: "09:02",
        segments: [
          {
            type: "text",
            value: "Shipped the new motion tokens to the shared library 🎉 Spring presets are now ",
          },
          { type: "code", value: "ease.out.expo" },
          { type: "text", value: " by default." },
        ],
        reactions: [
          { emoji: "🚀", count: 24, mine: true },
          { emoji: "🔥", count: 18, mine: false },
          { emoji: "👏", count: 9, mine: false },
        ],
        thread: {
          count: 12,
          lastReply: "Last reply 4m ago",
          participants: [
            { initials: "MI", tone: "teal" },
            { initials: "DK", tone: "purple" },
          ],
        },
      },
      {
        id: "general-2",
        authorId: "meera",
        time: "09:18",
        segments: [
          { type: "text", value: "Quick poll for Friday’s session, what should we deep dive into?" },
        ],
        poll: {
          title: "Friday deep dive",
          votes: 186,
          options: [
            { label: "Scroll-driven animations", percent: 54, voted: true },
            { label: "Design tokens at scale", percent: 31, voted: false },
            { label: "Realtime presence UI", percent: 15, voted: false },
          ],
        },
      },
      {
        id: "general-3",
        authorId: "rohan",
        time: "09:40",
        segments: [
          {
            type: "text",
            value: "Here’s a preview of the presence indicators I was hacking on last night",
          },
        ],
        media: [
          {
            kind: "video",
            tone: "blue",
            alt: "Screen recording of presence indicators",
            duration: "0:14",
          },
          { kind: "image", tone: "violet", alt: "Presence indicator color study" },
        ],
      },
    ],
    announcements: [
      {
        id: "announcements-1",
        authorId: "kabir",
        time: "Mon",
        segments: [
          {
            type: "text",
            value: "Welcome to all 400 new members this week! Read the guidelines in ",
          },
          { type: "code", value: "#resources" },
          { type: "text", value: " before posting." },
        ],
        reactions: [{ emoji: "👋", count: 64, mine: false }],
      },
    ],
    "show-and-tell": [
      {
        id: "show-1",
        authorId: "isha",
        time: "08:12",
        segments: [{ type: "text", value: "Rebuilt our onboarding carousel with scroll snap only. No JS!" }],
        reactions: [{ emoji: "🤯", count: 12, mine: false }],
      },
    ],
    "motion-design": [
      {
        id: "motion-1",
        authorId: "kabir",
        time: "07:58",
        segments: [
          { type: "text", value: "Hot take: most UI transitions should stay under " },
          { type: "code", value: "250ms" },
          { type: "text", value: "." },
        ],
        reactions: [{ emoji: "💯", count: 31, mine: true }],
      },
    ],
    "jobs-board": [
      {
        id: "jobs-1",
        authorId: "aarav",
        time: "Tue",
        segments: [{ type: "text", value: "Relay is hiring a design engineer in Bengaluru. DM me!" }],
      },
    ],
    resources: [
      {
        id: "resources-1",
        authorId: "meera",
        time: "Sun",
        segments: [{ type: "text", value: "Collected every talk from last month’s meetup in one doc." }],
      },
    ],
  },
};

export function defaultRooms(name: string): RoomFixture {
  return {
    textRooms: [
      {
        id: "announcements",
        name: "announcements",
        icon: "megaphone",
        topic: "Updates from the moderators",
        unread: 0,
      },
      {
        id: "general",
        name: "general",
        icon: "hash",
        topic: `Say hello to the ${name} community`,
        unread: 0,
      },
    ],
    voiceRooms: [{ id: "lounge", name: "Lounge", live: 0, participants: [] }],
    onlineLabel: "128 online",
    roles: { aarav: "owner" },
    onlineCount: 12,
    offlineCount: 40,
    headerExtra: "+320",
    messages: {
      general: [
        {
          id: "default-general-1",
          authorId: "aarav",
          time: "09:00",
          segments: [{ type: "text", value: `Welcome to ${name}! Introduce yourself 👋` }],
          reactions: [{ emoji: "👋", count: 12, mine: false }],
        },
      ],
      announcements: [
        {
          id: "default-announcements-1",
          authorId: "aarav",
          time: "Mon",
          segments: [{ type: "text", value: "Community guidelines are pinned. Be kind and ship things." }],
        },
      ],
    },
  };
}
