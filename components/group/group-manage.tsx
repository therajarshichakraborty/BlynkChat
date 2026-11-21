"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import { ActionMenu, type MenuItem } from "@/components/chat/action-menu";
import { CopyIcon } from "@/components/icons/copy-icon";
import { LinkIcon } from "@/components/icons/link-icon";
import { LogOutIcon } from "@/components/icons/log-out-icon";
import { MessageCircleIcon } from "@/components/icons/message-circle-icon";
import { MoreHorizontalIcon } from "@/components/icons/more-horizontal-icon";
import { RefreshIcon } from "@/components/icons/refresh-icon";
import { ShieldIcon } from "@/components/icons/shield-icon";
import { TrashIcon } from "@/components/icons/trash-icon";
import { UserPlusIcon } from "@/components/icons/user-plus-icon";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { useToast } from "@/components/ui/toast";
import { startDirectChat } from "@/lib/actions/chats";
import { changeRole, leaveGroup, removeMember, resetInviteLink, transferOwnership } from "@/lib/actions/groups";
import type { ActionResult } from "@/types/action";
import type { MemberRoleView, MemberView } from "@/types/conversation";
import { AddMembersDialog } from "./add-members-dialog";

function subscribeNever() {
  return () => undefined;
}

type GroupManageProps = {
  conversationId: string;
  meId: string;
  myRole: MemberRoleView;
  members: MemberView[];
  memberCount: number;
  inviteCode: string | null;
};

export function GroupManage({ conversationId, meId, myRole, members, memberCount, inviteCode }: GroupManageProps) {
  const router = useRouter();
  const { show } = useToast();
  const [adding, setAdding] = useState(false);
  const [code, setCode] = useState(inviteCode);
  const [pending, startTransition] = useTransition();
  const origin = useSyncExternalStore(
    subscribeNever,
    () => window.location.origin,
    () => "",
  );
  const admin = myRole !== "member";
  const owner = myRole === "owner";

  function run<T>(action: () => Promise<ActionResult<T>>, success: string, after?: (data: T) => void) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        show(result.error.message);
        return;
      }
      if (success) show(success, "success");
      after?.(result.data);
      router.refresh();
    });
  }

  function itemsFor(member: MemberView): MenuItem[] {
    const items: MenuItem[] = [];
    const target = member.person;
    if (target.id === meId) return items;
    items.push({
      label: `Message ${target.name.split(" ")[0]}`,
      icon: <MessageCircleIcon size={16} />,
      onSelect: () =>
        run(() => startDirectChat({ userId: target.id }), "", (data) => router.push(`/chats/${data.id}` as Route)),
    });
    if (!admin || member.role === "owner") return items;
    if (member.role === "member") {
      items.push({
        label: "Make group admin",
        icon: <ShieldIcon size={16} />,
        onSelect: () => run(() => changeRole({ conversationId, userId: target.id, role: "ADMIN" }), "Admin added"),
      });
    } else if (owner) {
      items.push({
        label: "Dismiss as admin",
        icon: <ShieldIcon size={16} />,
        onSelect: () => run(() => changeRole({ conversationId, userId: target.id, role: "MEMBER" }), "Admin dismissed"),
      });
    }
    if (owner) {
      items.push({
        label: "Make group owner",
        icon: <ShieldIcon size={16} />,
        onSelect: () => run(() => transferOwnership({ conversationId, userId: target.id }), "Ownership transferred"),
      });
    }
    if (member.role === "member" || owner) {
      items.push({
        label: "Remove from group",
        icon: <TrashIcon size={16} />,
        danger: true,
        onSelect: () => run(() => removeMember({ conversationId, userId: target.id }), "Member removed"),
      });
    }
    return items;
  }

  const inviteUrl = code ? `${origin}/join/${code}` : "";

  return (
    <>
      {admin && code ? (
        <section aria-labelledby="invite-heading" className="border-t border-line px-6 py-6">
          <h3 id="invite-heading" className="flex items-center gap-2 text-md font-semibold">
            <LinkIcon size={17} className="text-muted" />
            Invite link
          </h3>
          <p className="mt-2 truncate rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs text-muted">
            {inviteUrl}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigator.clipboard.writeText(inviteUrl).then(
                  () => show("Invite link copied", "success"),
                  () => show("Could not copy the link."),
                )
              }
            >
              <CopyIcon size={15} />
              Copy link
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                run(() => resetInviteLink({ conversationId }), "Invite link reset. The old link no longer works.", (data) =>
                  setCode(data.inviteCode),
                )
              }
            >
              <RefreshIcon size={15} />
              Reset link
            </Button>
          </div>
        </section>
      ) : null}
      <section aria-labelledby="members-heading" className="border-t border-line px-6 py-6">
        <div className="flex items-center justify-between">
          <h3 id="members-heading" className="text-md font-semibold">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </h3>
          {admin ? (
            <Button size="sm" variant="soft" onClick={() => setAdding(true)}>
              <UserPlusIcon size={15} />
              Add
            </Button>
          ) : null}
        </div>
        <ul className="mt-3 flex flex-col gap-1">
          {members.map((member) => {
            const items = itemsFor(member);
            return (
              <li key={member.person.id} className="flex items-center gap-3 py-1.5">
                <Avatar
                  initials={member.person.initials}
                  tone={member.person.tone}
                  image={member.person.image}
                  size="md"
                  online={member.online}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-base font-medium">
                    {member.person.id === meId ? "You" : member.person.name}
                  </span>
                  <span className="truncate text-xs text-muted">@{member.person.username}</span>
                </span>
                {member.role !== "member" ? <Tag>{member.role}</Tag> : null}
                {items.length > 0 ? (
                  <ActionMenu label={`Options for ${member.person.name}`} icon={<MoreHorizontalIcon size={18} />} items={items} />
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="border-t border-line px-6 py-6">
        <Button
          variant="outline"
          block
          disabled={pending}
          className="text-danger-text"
          onClick={() => run(() => leaveGroup({ conversationId }), "You left the group", () => router.replace("/chats"))}
        >
          <LogOutIcon size={16} />
          Leave group
        </Button>
      </section>
      {adding ? (
        <AddMembersDialog
          conversationId={conversationId}
          existingIds={members.map((member) => member.person.id)}
          onClose={() => setAdding(false)}
          onDone={(message, tone) => {
            show(message, tone);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
