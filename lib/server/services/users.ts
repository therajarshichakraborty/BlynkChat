import "server-only";
import { db } from "../db";
import { notFound } from "../errors";
import { personDetailSelect, toPerson } from "../views/people";
import type { PersonView } from "@/types/conversation";
import { blockedUserIds } from "./blocks";

export async function getMe(userId: string): Promise<PersonView> {
  const user = await db.user.findUnique({ where: { id: userId }, select: personDetailSelect });
  if (!user) throw notFound("Your account could not be found.");
  return toPerson(user);
}

export async function listContacts(userId: string): Promise<PersonView[]> {
  const blocked = await blockedUserIds(userId);
  const users = await db.user.findMany({
    where: {
      id: { not: userId, notIn: [...blocked] },
      memberships: {
        some: {
          leftAt: null,
          conversation: {
            type: { in: ["DIRECT", "GROUP"] },
            members: { some: { userId, leftAt: null } },
          },
        },
      },
    },
    select: personDetailSelect,
    orderBy: { name: "asc" },
  });
  return users.map(toPerson);
}

export async function searchPeople(userId: string, query: string, take = 20): Promise<PersonView[]> {
  const needle = query.trim().replace(/^@/, "");
  if (!needle) return [];
  const blocked = await blockedUserIds(userId);
  const users = await db.user.findMany({
    where: {
      id: { not: userId, notIn: [...blocked] },
      OR: [
        { username: { contains: needle, mode: "insensitive" } },
        { name: { contains: needle, mode: "insensitive" } },
      ],
    },
    select: personDetailSelect,
    orderBy: { username: "asc" },
    take,
  });
  return users.map(toPerson);
}

export async function sharesConversation(userId: string, otherId: string) {
  const shared = await db.conversation.count({
    where: {
      type: { in: ["DIRECT", "GROUP"] },
      AND: [
        { members: { some: { userId, leftAt: null } } },
        { members: { some: { userId: otherId, leftAt: null } } },
      ],
    },
  });
  return shared > 0;
}
