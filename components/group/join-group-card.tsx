"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { ClockIcon } from "@/components/icons/clock-icon";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { joinGroup } from "@/lib/actions/groups";
import { initialsFor } from "@/lib/utils/initials";
import type { InvitePreview } from "@/types/conversation";

type JoinGroupCardProps = {
  code: string;
  invite: InvitePreview;
};

export function JoinGroupCard({ code, invite }: JoinGroupCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState(invite.status);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function join() {
    setError("");
    startTransition(async () => {
      const result = await joinGroup({ code });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      if (result.data.status === "member") router.replace(`/chats/${result.data.conversationId}` as Route);
      else setStatus("pending");
    });
  }

  return (
    <section
      aria-labelledby="join-title"
      className="flex w-full max-w-sm flex-col items-center rounded-[24px] border border-line bg-card px-6 py-8 text-center shadow-lg"
    >
      <Avatar initials={initialsFor(invite.title)} tone={invite.tone} image={invite.image} size="2xl" shape="square" />
      <h1 id="join-title" className="mt-4 text-2xl font-semibold tracking-tight">
        {invite.title}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Group · {invite.memberCount} {invite.memberCount === 1 ? "member" : "members"}
      </p>
      {invite.description ? <p className="mt-3 text-base">{invite.description}</p> : null}
      {error ? (
        <div className="mt-5 w-full">
          <FormAlert message={error} />
        </div>
      ) : null}
      {status === "pending" ? (
        <p className="mt-6 flex items-center gap-2 rounded-md bg-accent-soft px-4 py-3 text-sm text-accent-text" role="status">
          <ClockIcon size={16} />
          Request sent. An admin needs to approve it.
        </p>
      ) : (
        <Button size="lg" block className="mt-6" onClick={join} disabled={pending} aria-busy={pending}>
          {pending ? <Spinner /> : null}
          {invite.requireApproval ? "Request to join" : "Join group"}
        </Button>
      )}
    </section>
  );
}
