import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import {
  PrismaClient,
  type CommunityCategory,
  type MemberRole,
  type RoomIcon,
  type Tone,
} from "./generated/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set.");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const storageDir = path.resolve(process.env.STORAGE_DIR ?? "./storage");
const demoPassword = "password123";
const now = new Date();

type SeedUser = {
  key: string;
  name: string;
  tone: Tone;
  title: string;
  location: string;
  bio: string;
};

const people: SeedUser[] = [
  { key: "arjun", name: "Arjun Dey", tone: "BLUE", title: "Product Engineer", location: "Kolkata", bio: "Product engineer in Kolkata. Building calm software." },
  { key: "ananya", name: "Ananya Sharma", tone: "BLUE", title: "Product Designer", location: "Bengaluru", bio: "Designing onboarding flows and empty states that feel kind." },
  { key: "kabir", name: "Kabir Malhotra", tone: "VIOLET", title: "Design Engineer", location: "Delhi", bio: "Motion tokens, springs and choreography." },
  { key: "meera", name: "Meera Iyer", tone: "TEAL", title: "Frontend Lead", location: "Chennai", bio: "Web platform nerd. Container queries enjoyer." },
  { key: "rohan", name: "Rohan Mehta", tone: "CYAN", title: "iOS Engineer", location: "Pune", bio: "Shipping TestFlight builds at odd hours." },
  { key: "isha", name: "Isha Verma", tone: "PINK", title: "Motion Designer", location: "Mumbai", bio: "240ms with a soft overshoot." },
  { key: "dev", name: "Dev Kapoor", tone: "PURPLE", title: "Backend Engineer", location: "Hyderabad", bio: "Queues, migrations and boring infrastructure." },
  { key: "aarav", name: "Aarav Singh", tone: "ORANGE", title: "Community Manager", location: "Jaipur", bio: "Bringing builders together, one hackathon at a time." },
  { key: "nikhil", name: "Nikhil Rao", tone: "SLATE", title: "Platform Engineer", location: "Bengaluru", bio: "Caches all the way down." },
  { key: "sara", name: "Sara Thomas", tone: "AMBER", title: "Content Designer", location: "Kochi", bio: "Words that help people get things done." },
];

const ids = new Map<string, string>();

function userId(key: string) {
  const id = ids.get(key);
  if (!id) throw new Error(`Unknown seed user ${key}`);
  return id;
}

function at(daysAgo: number, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  if (date > now) return new Date(now.getTime() - (date.getTime() - now.getTime()) - 60_000);
  return date;
}

function minutesAgo(minutes: number) {
  return new Date(now.getTime() - minutes * 60_000);
}

let clientCounter = 0;
function clientId() {
  clientCounter += 1;
  return `seed-${clientCounter.toString().padStart(5, "0")}`;
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function gradientPng(width: number, height: number, from: [number, number, number], to: [number, number, number]) {
  const rows: Buffer[] = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 3);
    for (let x = 0; x < width; x += 1) {
      const t = (x / width + y / height) / 2;
      row[1 + x * 3] = Math.round(from[0] + (to[0] - from[0]) * t);
      row[2 + x * 3] = Math.round(from[1] + (to[1] - from[1]) * t);
      row[3 + x * 3] = Math.round(from[2] + (to[2] - from[2]) * t);
    }
    rows.push(row);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(Buffer.concat(rows))),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function toneWav(seconds: number, frequency: number) {
  const sampleRate = 8000;
  const samples = Math.round(seconds * sampleRate);
  const buffer = Buffer.alloc(44 + samples);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate, 28);
  buffer.writeUInt16LE(1, 32);
  buffer.writeUInt16LE(8, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples, 40);
  for (let i = 0; i < samples; i += 1) {
    const envelope = 0.35 + 0.25 * Math.sin((i / sampleRate) * Math.PI * 1.3);
    buffer[44 + i] = Math.round(128 + 100 * envelope * Math.sin((2 * Math.PI * frequency * i) / sampleRate));
  }
  return buffer;
}

async function storeFile(name: string, contents: Buffer) {
  const relative = path.posix.join("seed", name);
  await mkdir(path.join(storageDir, "seed"), { recursive: true });
  await writeFile(path.join(storageDir, relative), contents);
  return { path: relative, size: contents.length };
}

const waveform = [6, 14, 9, 18, 12, 6, 4, 8, 16, 22, 12, 7, 5, 9, 14, 6, 10, 18, 8, 5, 12, 16, 9, 6, 14, 20, 11, 7, 9, 15, 6, 4];

async function reset() {
  await db.$executeRawUnsafe(`
    truncate table
      story_view, story, block, community_member, poll_vote, poll_option, poll, pinned_message,
      starred_message, reaction, attachment, message_hidden, message, join_request,
      conversation_member, conversation, community, user_settings, verification, session, account, "user"
    restart identity cascade
  `);
}

async function createUsers() {
  const hash = await hashPassword(demoPassword);
  for (const person of people) {
    const user = await db.user.create({
      data: {
        name: person.name,
        email: `${person.key}@relay.dev`,
        emailVerified: true,
        username: person.key,
        displayUsername: person.key,
        title: person.title,
        location: person.location,
        bio: person.bio,
        tone: person.tone,
        lastSeenAt: minutesAgo(5 + people.indexOf(person) * 37),
        settings: { create: {} },
        accounts: { create: { providerId: "credential", accountId: person.key, password: hash } },
      },
    });
    await db.account.updateMany({ where: { userId: user.id }, data: { accountId: user.id } });
    ids.set(person.key, user.id);
  }
}

type SeedMessage = {
  from: string;
  when: Date;
  body?: string;
  reply?: number;
  reactions?: [string, string[]][];
  attachment?: { kind: "IMAGE" | "FILE" | "VOICE"; name: string; mime: string; file: Buffer; width?: number; height?: number; durationMs?: number };
  edited?: boolean;
};

async function createMessages(conversationId: string, messages: SeedMessage[]) {
  const created: string[] = [];
  for (const message of messages) {
    const attachment = message.attachment ? await storeFile(`${clientCounter + 1}-${message.attachment.name}`, message.attachment.file) : null;
    const row = await db.message.create({
      data: {
        conversationId,
        senderId: userId(message.from),
        clientId: clientId(),
        kind: message.attachment?.kind ?? "TEXT",
        body: message.body ?? "",
        replyToId: message.reply === undefined ? undefined : created[message.reply],
        editedAt: message.edited ? message.when : undefined,
        createdAt: message.when,
        attachments:
          message.attachment && attachment
            ? {
                create: {
                  uploaderId: userId(message.from),
                  kind: message.attachment.kind,
                  mime: message.attachment.mime,
                  name: message.attachment.name,
                  size: attachment.size,
                  path: attachment.path,
                  width: message.attachment.width,
                  height: message.attachment.height,
                  durationMs: message.attachment.durationMs,
                  waveform: message.attachment.kind === "VOICE" ? waveform : undefined,
                  createdAt: message.when,
                },
              }
            : undefined,
        reactions: message.reactions
          ? {
              create: message.reactions.flatMap(([emoji, keys]) =>
                keys.map((key) => ({ emoji, userId: userId(key), createdAt: message.when })),
              ),
            }
          : undefined,
      },
    });
    created.push(row.id);
  }
  const last = messages.at(-1);
  if (last) await db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: last.when } });
  return created;
}

async function markRead(conversationId: string, key: string, readAt: Date) {
  const lastRead = await db.message.findFirst({
    where: { conversationId, createdAt: { lte: readAt } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  await db.conversationMember.update({
    where: { conversationId_userId: { conversationId, userId: userId(key) } },
    data: { lastReadAt: readAt, lastDeliveredAt: readAt, lastReadMessageId: lastRead?.id },
  });
}

async function direct(a: string, b: string, messages: SeedMessage[], options: { pinned?: boolean; readByA?: Date; readByB?: Date } = {}) {
  const [first, second] = [userId(a), userId(b)].sort();
  const createdAt = messages[0]?.when ?? now;
  const conversation = await db.conversation.create({
    data: {
      type: "DIRECT",
      directKey: `${first}:${second}`,
      createdById: userId(a),
      createdAt,
      members: {
        create: [
          { userId: userId(a), joinedAt: createdAt, pinnedAt: options.pinned ? now : undefined },
          { userId: userId(b), joinedAt: createdAt },
        ],
      },
    },
  });
  await createMessages(conversation.id, messages);
  const last = messages.at(-1)?.when ?? now;
  await markRead(conversation.id, a, options.readByA ?? last);
  await markRead(conversation.id, b, options.readByB ?? last);
  return conversation.id;
}

async function group(
  title: string,
  tone: Tone,
  description: string,
  owner: string,
  members: string[],
  admins: string[] = [],
) {
  const createdAt = at(30, "10:00");
  const conversation = await db.conversation.create({
    data: {
      type: "GROUP",
      title,
      tone,
      description,
      createdById: userId(owner),
      createdAt,
      members: {
        create: [owner, ...members].map((key) => ({
          userId: userId(key),
          role: (key === owner ? "OWNER" : admins.includes(key) ? "ADMIN" : "MEMBER") as MemberRole,
          joinedAt: createdAt,
        })),
      },
      messages: {
        create: {
          senderId: userId(owner),
          clientId: clientId(),
          kind: "SYSTEM",
          body: `${people.find((person) => person.key === owner)?.name.split(" ")[0]} created the group “${title}”`,
          createdAt,
        },
      },
    },
  });
  return conversation.id;
}

type SeedCommunity = {
  slug: string;
  name: string;
  tone: Tone;
  description: string;
  category: CommunityCategory;
  verified?: boolean;
  owner: string;
  admins?: string[];
  members: string[];
  rooms: { slug: string; title: string; icon: RoomIcon; topic: string }[];
};

const baseRooms = (name: string): SeedCommunity["rooms"] => [
  { slug: "announcements", title: "announcements", icon: "MEGAPHONE", topic: "Updates from the moderators" },
  { slug: "general", title: "general", icon: "HASH", topic: `Say hello to the ${name} community` },
];

const everyone = people.map((person) => person.key);

const communities: SeedCommunity[] = [
  {
    slug: "design-engineers",
    name: "Design Engineers",
    tone: "VIOLET",
    description: "Where design meets code. Motion, tokens, and polished UI.",
    category: "DESIGN",
    verified: true,
    owner: "kabir",
    admins: ["ananya"],
    members: everyone,
    rooms: [
      { slug: "announcements", title: "announcements", icon: "MEGAPHONE", topic: "Updates from the moderators" },
      { slug: "general", title: "general", icon: "HASH", topic: "Daily chatter, wins, and questions" },
      { slug: "show-and-tell", title: "show-and-tell", icon: "HASH", topic: "Share what you shipped this week" },
      { slug: "motion-design", title: "motion-design", icon: "HASH", topic: "Springs, curves and choreography" },
      { slug: "jobs-board", title: "jobs-board", icon: "BRIEFCASE", topic: "Roles at design-led teams" },
      { slug: "resources", title: "resources", icon: "BOOK", topic: "Talks, articles and libraries worth keeping" },
    ],
  },
  {
    slug: "frontend-guild",
    name: "Frontend Guild",
    tone: "SKY",
    description: "Everything web platform: CSS, frameworks, performance and accessibility.",
    category: "TECHNOLOGY",
    owner: "meera",
    members: ["arjun", "dev", "kabir", "rohan", "nikhil", "isha"],
    rooms: [
      ...baseRooms("Frontend Guild"),
      { slug: "help", title: "help", icon: "HASH", topic: "Stuck on something? Ask here" },
    ],
  },
  {
    slug: "weekend-hikers",
    name: "Weekend Hikers",
    tone: "ORANGE",
    description: "Trails, treks and early starts. Plans every Friday night.",
    category: "HOBBIES",
    owner: "aarav",
    members: ["arjun", "isha", "sara", "rohan"],
    rooms: baseRooms("Weekend Hikers"),
  },
  {
    slug: "hackathon-crew",
    name: "Hackathon Crew",
    tone: "CYAN",
    description: "Find teammates, share ideas and ship something in a weekend.",
    category: "CAMPUS",
    owner: "aarav",
    members: ["arjun", "rohan", "dev", "meera", "kabir"],
    rooms: baseRooms("Hackathon Crew"),
  },
  {
    slug: "indie-hackers-india",
    name: "Indie Hackers India",
    tone: "TEAL",
    description: "Build in public, share revenue, ship faster together.",
    category: "STARTUPS",
    owner: "dev",
    members: ["nikhil", "sara", "aarav"],
    rooms: baseRooms("Indie Hackers India"),
  },
  {
    slug: "ml-builders",
    name: "ML Builders",
    tone: "CYAN",
    description: "Model apps, evals and infra. Weekly demo days.",
    category: "ML",
    owner: "nikhil",
    members: ["dev", "kabir", "meera", "sara"],
    rooms: baseRooms("ML Builders"),
  },
  {
    slug: "open-source-club",
    name: "Open Source Club",
    tone: "BLUE",
    description: "Find first issues, pair on PRs, get mentored.",
    category: "TECHNOLOGY",
    owner: "meera",
    members: ["nikhil", "dev", "rohan"],
    rooms: baseRooms("Open Source Club"),
  },
  {
    slug: "campus-devs",
    name: "Campus Devs",
    tone: "SKY",
    description: "Hackathons, internships, and resume reviews.",
    category: "CAMPUS",
    owner: "aarav",
    members: ["rohan", "isha", "sara", "kabir"],
    rooms: baseRooms("Campus Devs"),
  },
  {
    slug: "photography-walks",
    name: "Photography Walks",
    tone: "ORANGE",
    description: "Weekend photo walks across Kolkata and beyond.",
    category: "LOCAL",
    owner: "isha",
    members: ["sara", "ananya", "aarav"],
    rooms: baseRooms("Photography Walks"),
  },
];

async function createCommunities() {
  const rooms = new Map<string, string>();
  for (const community of communities) {
    const createdAt = at(60, "09:00");
    const memberKeys = [community.owner, ...community.members.filter((key) => key !== community.owner)];
    const roleOf = (key: string): MemberRole =>
      key === community.owner ? "OWNER" : community.admins?.includes(key) ? "ADMIN" : "MEMBER";
    const row = await db.community.create({
      data: {
        slug: community.slug,
        name: community.name,
        description: community.description,
        tone: community.tone,
        cover: community.tone,
        category: community.category,
        verified: community.verified ?? false,
        createdById: userId(community.owner),
        createdAt,
        members: { create: memberKeys.map((key) => ({ userId: userId(key), role: roleOf(key), joinedAt: createdAt })) },
      },
    });
    for (const room of community.rooms) {
      const conversation = await db.conversation.create({
        data: {
          type: "ROOM",
          title: room.title,
          slug: room.slug,
          roomIcon: room.icon,
          description: room.topic,
          tone: community.tone,
          communityId: row.id,
          onlyAdminsCanPost: room.slug === "announcements",
          createdById: userId(community.owner),
          createdAt,
          lastMessageAt: createdAt,
          members: { create: memberKeys.map((key) => ({ userId: userId(key), role: roleOf(key), joinedAt: createdAt })) },
        },
      });
      rooms.set(`${community.slug}/${room.slug}`, conversation.id);
    }
  }
  return rooms;
}

function room(rooms: Map<string, string>, key: string) {
  const id = rooms.get(key);
  if (!id) throw new Error(`Unknown room ${key}`);
  return id;
}

async function createPoll(conversationId: string, author: string, when: Date, question: string, options: [string, string[]][]) {
  const message = await db.message.create({
    data: {
      conversationId,
      senderId: userId(author),
      clientId: clientId(),
      kind: "POLL",
      body: question,
      createdAt: when,
      poll: {
        create: {
          question,
          createdAt: when,
          options: { create: options.map(([label], position) => ({ label, position })) },
        },
      },
    },
    include: { poll: { include: { options: { orderBy: { position: "asc" } } } } },
  });
  const poll = message.poll;
  if (!poll) return message.id;
  for (const [index, [, voters]] of options.entries()) {
    const option = poll.options[index];
    if (!option) continue;
    for (const voter of voters) {
      await db.pollVote.create({ data: { pollId: poll.id, optionId: option.id, userId: userId(voter) } });
    }
  }
  await db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: when } });
  return message.id;
}

async function seedChats(rooms: Map<string, string>) {
  const onboarding = Buffer.alloc(48 * 1024, 7);
  const voice38 = toneWav(38, 220);
  const voice42 = toneWav(42, 196);
  const sunrise = gradientPng(640, 480, [99, 102, 241], [251, 146, 60]);
  const brand = Buffer.from("%PDF-1.4\n% Relay brand guidelines placeholder\n");

  const ananya = await direct(
    "arjun",
    "ananya",
    [
      { from: "ananya", when: minutesAgo(26), body: "Morning! Did you get a chance to look at the onboarding flow?" },
      {
        from: "arjun",
        when: minutesAgo(22),
        body: "Just did. The empty states look really clean. One thing: can we make the CTA pill shaped like the landing page?",
      },
      {
        from: "ananya",
        when: minutesAgo(15),
        body: "Yes, updated. Also tightened the heading tracking to -1.2px",
        reactions: [["🔥", ["arjun", "ananya"]]],
        attachment: { kind: "FILE", name: "Relay Onboarding v4.fig", mime: "application/octet-stream", file: onboarding },
      },
      {
        from: "arjun",
        when: minutesAgo(10),
        attachment: { kind: "VOICE", name: "voice-note.wav", mime: "audio/wav", file: voice38, durationMs: 38_000 },
      },
      { from: "arjun", when: minutesAgo(8), body: "Perfect. Ship it to the Design Engineers group ✨", reply: 2 },
      { from: "ananya", when: minutesAgo(5), body: "On it. Sharing the brand guidelines too.", attachment: { kind: "FILE", name: "Brand guidelines.pdf", mime: "application/pdf", file: brand } },
      { from: "ananya", when: minutesAgo(4), body: "Perfect. Ship it to the Design Engineers group" },
    ],
    { pinned: true, readByA: minutesAgo(7) },
  );

  await direct(
    "arjun",
    "rohan",
    [
      { from: "arjun", when: minutesAgo(70), body: "How did the TestFlight build go?" },
      { from: "rohan", when: minutesAgo(47), attachment: { kind: "VOICE", name: "voice-note.wav", mime: "audio/wav", file: voice42, durationMs: 42_000 } },
    ],
    { readByA: minutesAgo(60) },
  );

  await direct("arjun", "isha", [
    { from: "isha", when: at(1, "21:04"), body: "Sent you the new loading animation, 240ms with a soft overshoot." },
    { from: "arjun", when: at(1, "21:10"), body: "Haha that animation is so smooth" },
  ]);

  await direct("arjun", "dev", [
    { from: "dev", when: at(3, "10:05"), body: "The queue migration is ready for review whenever you are." },
    { from: "arjun", when: at(3, "10:12"), body: "Let’s sync after standup" },
  ]);

  await direct("arjun", "nikhil", [
    { from: "arjun", when: at(4, "16:30"), body: "Left a couple of comments on the cache PR." },
    { from: "nikhil", when: at(4, "17:02"), body: "Merged. Thanks for the review!" },
  ]);

  await direct("ananya", "kabir", [
    { from: "kabir", when: at(1, "11:00"), body: "Can you review the spring presets before I publish?" },
    { from: "ananya", when: at(1, "11:20"), body: "Looks great. Ship it." },
  ]);

  const designEngineers = await group(
    "Design Engineers",
    "VIOLET",
    "Design engineers at Relay. Motion, tokens and polish.",
    "kabir",
    ["arjun", "meera", "ananya", "rohan", "isha", "dev"],
    ["ananya"],
  );
  await createMessages(designEngineers, [
    {
      from: "kabir",
      when: minutesAgo(40),
      body: "Shipped the new motion tokens to the shared library 🎉 Spring presets are now the default.",
      reactions: [
        ["🚀", ["arjun", "meera", "ananya", "rohan"]],
        ["🔥", ["isha", "dev"]],
      ],
    },
    { from: "meera", when: minutesAgo(24), body: "The springs feel so much better on the sheet transitions. Updating the docs now." },
    { from: "arjun", when: minutesAgo(18), body: "Nice work, Kabir! I’ll wire them into the onboarding flow today." },
    { from: "kabir", when: minutesAgo(12), body: "Pushed a small fix for the easing curve too. Pull before you test." },
    { from: "isha", when: minutesAgo(11), body: "shipped the new motion tokens" },
  ]);
  await markRead(designEngineers, "arjun", minutesAgo(19));
  await db.conversationMember.update({
    where: { conversationId_userId: { conversationId: designEngineers, userId: userId("arjun") } },
    data: { pinnedAt: now },
  });

  const launch = await group(
    "Product Launch",
    "CYAN",
    "Everything for Friday’s launch. Release notes, status page and countdown.",
    "arjun",
    ["dev", "ananya", "rohan", "sara"],
    ["dev"],
  );
  await createMessages(launch, [
    { from: "dev", when: minutesAgo(62), body: "Release notes are final. Status page is ready to flip." },
  ]);
  await createPoll(launch, "dev", minutesAgo(45), "Launch tweet time?", [
    ["5pm IST", ["dev"]],
    ["6pm IST", ["arjun", "ananya", "sara"]],
    ["7pm IST", []],
  ]);
  await createMessages(launch, [{ from: "arjun", when: minutesAgo(30), body: "Countdown starts at 6pm IST" }]);
  for (const key of ["arjun", "dev", "ananya", "rohan", "sara"]) await markRead(launch, key, minutesAgo(29));
  await db.conversationMember.update({
    where: { conversationId_userId: { conversationId: launch, userId: userId("arjun") } },
    data: { pinnedAt: new Date(now.getTime() - 1000) },
  });

  const hikers = await group("Weekend Hikers", "ORANGE", "Trail plans and summit photos.", "aarav", ["arjun", "isha", "sara"]);
  await createMessages(hikers, [
    { from: "aarav", when: at(2, "07:45"), body: "Sunrise from the ridge this morning ⛰️" },
    {
      from: "aarav",
      when: at(2, "07:46"),
      attachment: { kind: "IMAGE", name: "Sunrise over the mountain ridge.png", mime: "image/png", file: sunrise, width: 640, height: 480 },
      reactions: [["😍", ["arjun", "isha", "sara"]]],
    },
  ]);
  for (const key of ["arjun", "isha", "sara", "aarav"]) await markRead(hikers, key, at(2, "08:00"));

  const general = room(rooms, "design-engineers/general");
  const [tokens] = await createMessages(general, [
    {
      from: "kabir",
      when: minutesAgo(48),
      body: "Shipped the new motion tokens to the shared library 🎉 Spring presets are now `ease.out.expo` by default.",
      reactions: [
        ["🚀", ["arjun", "meera", "ananya", "rohan", "isha"]],
        ["🔥", ["dev", "aarav"]],
        ["👏", ["sara", "nikhil"]],
      ],
    },
  ]);
  if (tokens) {
    const replies: [string, number, string][] = [
      ["meera", 44, "The new defaults feel so much snappier."],
      ["dev", 30, "Any plans to export them as CSS custom properties?"],
      ["kabir", 22, "Yes, landing in the next release."],
      ["meera", 4, "Perfect, updating the docs."],
    ];
    for (const [key, ago, body] of replies) {
      await db.message.create({
        data: { conversationId: general, senderId: userId(key), clientId: clientId(), body, threadRootId: tokens, createdAt: minutesAgo(ago) },
      });
    }
  }
  await createPoll(general, "meera", minutesAgo(32), "Friday deep dive: what should we cover?", [
    ["Scroll-driven animations", ["arjun", "kabir", "isha", "rohan"]],
    ["Design tokens at scale", ["ananya", "dev"]],
    ["Realtime presence UI", ["nikhil"]],
  ]);
  const [preview] = await createMessages(general, [
    { from: "rohan", when: minutesAgo(16), body: "Here’s a preview of the presence indicators I was hacking on last night" },
    { from: "kabir", when: minutesAgo(15), body: "Community call this Friday, 7pm IST. Bring your side projects!" },
  ]);
  const pinnedNote = await db.message.findFirst({
    where: { conversationId: general, body: { startsWith: "Community call" } },
    select: { id: true },
  });
  if (pinnedNote) {
    await db.pinnedMessage.create({ data: { conversationId: general, messageId: pinnedNote.id, pinnedById: userId("kabir") } });
  }
  if (preview) {
    await db.message.update({
      where: { id: preview },
      data: {
        attachments: {
          create: {
            uploaderId: userId("rohan"),
            kind: "IMAGE",
            mime: "image/png",
            name: "Presence indicator color study.png",
            ...(await storeFile("presence.png", gradientPng(480, 480, [139, 92, 246], [56, 189, 248]))),
            width: 480,
            height: 480,
          },
        },
        kind: "IMAGE",
      },
    });
  }
  for (const key of everyone) await markRead(general, key, minutesAgo(key === "arjun" ? 20 : 1));

  await createMessages(room(rooms, "design-engineers/announcements"), [
    {
      from: "kabir",
      when: at(3, "09:00"),
      body: "Welcome to all 400 new members this week! Read the guidelines in #resources before posting.",
      reactions: [["👋", ["arjun", "meera", "rohan", "isha"]]],
    },
  ]);
  await createMessages(room(rooms, "design-engineers/show-and-tell"), [
    { from: "isha", when: minutesAgo(90), body: "Rebuilt our onboarding carousel with scroll snap only. No JS!", reactions: [["🤯", ["kabir", "meera"]]] },
  ]);
  await createMessages(room(rooms, "design-engineers/motion-design"), [
    { from: "kabir", when: minutesAgo(104), body: "Hot take: most UI transitions should stay under 250ms.", reactions: [["💯", ["arjun", "isha"]]] },
  ]);
  await createMessages(room(rooms, "design-engineers/jobs-board"), [
    { from: "aarav", when: at(2, "12:00"), body: "Relay is hiring a design engineer in Bengaluru. DM me!" },
  ]);
  await createMessages(room(rooms, "design-engineers/resources"), [
    { from: "meera", when: at(4, "18:00"), body: "Collected every talk from last month’s meetup in one doc." },
  ]);

  const frontend = room(rooms, "frontend-guild/general");
  await createMessages(frontend, [
    { from: "dev", when: at(1, "18:02"), body: "Container queries finally landed in our design system 🎉" },
    { from: "meera", when: at(1, "18:20"), body: "anyone tried the new view transitions?" },
  ]);
  for (const key of ["arjun", "dev", "meera"]) await markRead(frontend, key, at(1, "18:20"));
  await db.conversationMember.update({
    where: { conversationId_userId: { conversationId: frontend, userId: userId("arjun") } },
    data: { mutedUntil: new Date("9999-12-31T00:00:00.000Z") },
  });

  const hackathon = room(rooms, "hackathon-crew/general");
  await createMessages(hackathon, [
    { from: "aarav", when: at(5, "12:00"), body: "Team sign-ups close Friday. Teams of 2 to 4, remote is fine." },
  ]);
  for (const key of ["arjun", "aarav"]) await markRead(hackathon, key, at(5, "12:00"));

  for (const community of communities) {
    const welcome = room(rooms, `${community.slug}/general`);
    const existing = await db.message.count({ where: { conversationId: welcome } });
    if (existing > 0) continue;
    await createMessages(welcome, [
      { from: community.owner, when: at(6, "09:00"), body: `Welcome to ${community.name}! Introduce yourself 👋`, reactions: [["👋", community.members.slice(0, 3)]] },
    ]);
    for (const key of [community.owner, ...community.members]) await markRead(welcome, key, at(6, "09:00"));
  }
  for (const community of communities) {
    const announcements = room(rooms, `${community.slug}/announcements`);
    if ((await db.message.count({ where: { conversationId: announcements } })) > 0) continue;
    await createMessages(announcements, [
      { from: community.owner, when: at(7, "10:00"), body: "Community guidelines are pinned. Be kind and ship things." },
    ]);
    for (const key of [community.owner, ...community.members]) await markRead(announcements, key, at(7, "10:00"));
  }

  return { ananya };
}

async function seedStories() {
  const day = 24 * 60 * 60 * 1000;
  const stories: { author: string; body: string; background: Tone; ago: number; viewers: string[] }[] = [
    { author: "ananya", body: "New onboarding flow ships Friday ✨", background: "BLUE", ago: 45, viewers: ["kabir"] },
    { author: "kabir", body: "Spring presets are live. Go play with them.", background: "VIOLET", ago: 120, viewers: ["arjun", "meera"] },
    { author: "meera", body: "Container queries everywhere 📦", background: "TEAL", ago: 240, viewers: [] },
    { author: "rohan", body: "TestFlight build 214 is up", background: "CYAN", ago: 300, viewers: [] },
  ];
  for (const story of stories) {
    const createdAt = minutesAgo(story.ago);
    await db.story.create({
      data: {
        authorId: userId(story.author),
        kind: "TEXT",
        body: story.body,
        background: story.background,
        createdAt,
        expiresAt: new Date(createdAt.getTime() + day),
        views: { create: story.viewers.map((viewer) => ({ viewerId: userId(viewer) })) },
      },
    });
  }
  const sunsetFile = await storeFile("story-sunset.png", gradientPng(540, 960, [244, 114, 182], [251, 191, 36]));
  const createdAt = minutesAgo(90);
  const sunset = await db.attachment.create({
    data: {
      uploaderId: userId("isha"),
      kind: "IMAGE",
      mime: "image/png",
      name: "Golden hour.png",
      width: 540,
      height: 960,
      ...sunsetFile,
    },
  });
  await db.story.create({
    data: {
      authorId: userId("isha"),
      kind: "IMAGE",
      body: "Golden hour from the studio",
      background: "PINK",
      createdAt,
      expiresAt: new Date(createdAt.getTime() + day),
      attachmentId: sunset.id,
    },
  });
}

async function main() {
  await reset();
  await createUsers();
  const rooms = await createCommunities();
  await seedChats(rooms);
  await seedStories();
  console.info(`Seeded ${people.length} demo users. Sign in as arjun@relay.dev (or any username) with "${demoPassword}".`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
