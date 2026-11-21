import { currentUserId, users } from "@/lib/mock/users";
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

export function getContacts(): User[] {
  return users.filter((user) => user.id !== currentUserId);
}
