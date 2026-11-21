import { currentUserId, users } from "@/lib/mock/users";
import "server-only";
import { cache } from "react";
import { getMe, listContacts } from "@/lib/server/services/users";
import type { PersonView } from "@/types/conversation";
import type { User } from "@/types/user";

const usersById = new Map(users.map((user) => [user.id, user]));

export function getUser(id: string): User | undefined {
  return usersById.get(id);
}

export function getCurrentUser(): User {
  const user = usersById.get(currentUserId);
  if (!user) throw new Error("Current user fixture is missing.");
  return user;
}

export function getContacts(userId: string): Promise<PersonView[]> {
  return listContacts(userId);
}

export const getProfile = cache((userId: string): Promise<PersonView> => getMe(userId));
