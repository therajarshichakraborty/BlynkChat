import type { Tone } from "./tone";

export type User = {
  id: string;
  name: string;
  firstName: string;
  username: string;
  initials: string;
  tone: Tone;
  title: string;
  location: string;
  online: boolean;
};

export type AvatarPerson = {
  initials: string;
  tone: Tone;
};
