"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckIcon } from "@/components/icons/check-icon";
import { XIcon } from "@/components/icons/x-icon";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { useToast } from "@/components/ui/toast";
import { answerJoinRequest } from "@/lib/actions/groups";
import type { JoinRequestView } from "@/types/conversation";

type JoinRequestsProps = {
  requests: JoinRequestView[];
};

export function JoinRequests({ requests }: JoinRequestsProps) {
  const router = useRouter();
  const { show } = useToast();
  const [pending, startTransition] = useTransition();

  if (requests.length === 0) return null;

  function decide(requestId: string, approve: boolean) {
    startTransition(async () => {
      const result = await answerJoinRequest({ requestId, approve });
      if (!result.ok) show(result.error.message);
      else show(approve ? "Request approved" : "Request declined", "success");
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="requests-heading" className="border-t border-line px-6 py-6">
      <h3 id="requests-heading" className="text-md font-semibold">
        {requests.length} pending {requests.length === 1 ? "request" : "requests"}
      </h3>
      <ul className="mt-3 flex flex-col gap-1">
        {requests.map((request) => (
          <li key={request.id} className="flex items-center gap-3 py-1.5">
            <Avatar initials={request.person.initials} tone={request.person.tone} image={request.person.image} size="md" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-base font-medium">{request.person.name}</span>
              <span className="truncate text-xs text-muted">@{request.person.username}</span>
            </span>
            <IconButton label={`Decline ${request.person.name}`} size="sm" onClick={() => decide(request.id, false)} disabled={pending}>
              <XIcon size={16} />
            </IconButton>
            <IconButton
              label={`Approve ${request.person.name}`}
              size="sm"
              variant="soft"
              onClick={() => decide(request.id, true)}
              disabled={pending}
            >
              <CheckIcon size={16} />
            </IconButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
