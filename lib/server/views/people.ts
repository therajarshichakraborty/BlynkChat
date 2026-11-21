import "server-only";
import type { Tone as DbTone } from "@/prisma/generated/client";
import { initialsFor } from "@/lib/utils/initials";
import type { PersonView } from "@/types/conversation";
import type { SenderView } from "@/types/message";
import type { Tone } from "@/types/tone";

export function toTone(tone: DbTone): Tone {
  return tone.toLowerCase() as Tone;
}

type PersonRow = {
  id: string;
  name: string;
  username: string;
  tone: DbTone;
  image: string | null;
};

type PersonDetailRow = PersonRow & {
  bio: string;
  title: string;
  location: string;
};

export const personSelect = {
  id: true,
  name: true,
  username: true,
  tone: true,
  image: true,
} as const;

export const personDetailSelect = {
  ...personSelect,
  bio: true,
  title: true,
  location: true,
} as const;

export function toSender(row: PersonRow): SenderView {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    initials: initialsFor(row.name),
    tone: toTone(row.tone),
    image: row.image,
  };
}

export function toPerson(row: PersonDetailRow): PersonView {
  return {
    ...toSender(row),
    bio: row.bio,
    title: row.title,
    location: row.location,
  };
}
