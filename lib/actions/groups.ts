"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/lib/server/action";
import { conversationIdSchema } from "@/lib/validation/messages";
import {
  addMembers as addMembersService,
  createGroup as createGroupService,
  joinByInvite,
  leaveGroup as leaveGroupService,
  removeMember as removeMemberService,
  rotateInvite,
  setMemberRole,
  transferOwnership as transferOwnershipService,
} from "@/lib/server/services/groups";
import {
  createGroupSchema,
  inviteCodeSchema,
  memberSchema,
  membersSchema,
  roleSchema,
  type CreateGroupValues,
} from "@/lib/validation/groups";

function refreshChats() {
  revalidatePath("/chats", "layout");
}

export async function createGroup(input: CreateGroupValues) {
  return runAction(createGroupSchema, input, async (userId, data) => {
    const group = await createGroupService(userId, {
      name: data.name,
      description: data.description,
      memberIds: data.memberIds,
      requireApproval: data.approval || data.visibility === "public",
      onlyAdminsCanPost: data.adminsOnly,
      disappearingSeconds: data.disappearing ? 24 * 60 * 60 : null,
      image: data.image,
    });
    refreshChats();
    return group;
  });
}

export async function addMembers(input: { conversationId: string; userIds: string[] }) {
  return runAction(membersSchema, input, async (userId, data) => {
    const result = await addMembersService(userId, data.conversationId, data.userIds);
    refreshChats();
    return result;
  });
}

export async function removeMember(input: { conversationId: string; userId: string }) {
  return runAction(memberSchema, input, async (userId, data) => {
    await removeMemberService(userId, data.conversationId, data.userId);
    refreshChats();
    return null;
  });
}

export async function changeRole(input: { conversationId: string; userId: string; role: "ADMIN" | "MEMBER" }) {
  return runAction(roleSchema, input, async (userId, data) => {
    await setMemberRole(userId, data.conversationId, data.userId, data.role);
    refreshChats();
    return null;
  });
}

export async function transferOwnership(input: { conversationId: string; userId: string }) {
  return runAction(memberSchema, input, async (userId, data) => {
    await transferOwnershipService(userId, data.conversationId, data.userId);
    refreshChats();
    return null;
  });
}

export async function leaveGroup(input: { conversationId: string }) {
  return runAction(conversationIdSchema, input, async (userId, data) => {
    await leaveGroupService(userId, data.conversationId);
    refreshChats();
    return null;
  });
}

export async function resetInviteLink(input: { conversationId: string }) {
  return runAction(conversationIdSchema, input, async (userId, data) => {
    const result = await rotateInvite(userId, data.conversationId);
    refreshChats();
    return result;
  });
}

export async function joinGroup(input: { code: string }) {
  return runAction(inviteCodeSchema, input, async (userId, data) => {
    const result = await joinByInvite(userId, data.code);
    refreshChats();
    return result;
  });
}
