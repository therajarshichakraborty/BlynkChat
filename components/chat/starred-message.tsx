"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { StarIcon } from "@/components/icons/star-icon";
import { useTimeZone } from "@/components/shell/time-zone";
import { IconButton } from "@/components/ui/icon-button";
import { useToast } from "@/components/ui/toast";
import { toggleStar } from "@/lib/actions/reactions";
import { messageSnippet } from "@/lib/utils/messages";
import { dayLabel, clockLabel } from "@/lib/utils/time";
import type { MessageView } from "@/types/message";

type StarredMessageProps = {
  message: MessageView;
};

export function StarredMessage({ message }: StarredMessageProps) {
  const timeZone = useTimeZone();
  const router = useRouter();
  const { show } = useToast();
  const [pending, startTransition] = useTransition();

  function unstar() {
    startTransition(async () => {
      const result = await toggleStar({ messageId: message.id });
      if (!result.ok) show(result.error.message);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{message.sender?.name ?? "Deleted account"}</p>
        <p className="mt-0.5 text-md break-words whitespace-pre-wrap">{messageSnippet(message)}</p>
        <p className="mt-1 text-xs text-muted">
          {dayLabel(message.createdAt, timeZone)} · {clockLabel(message.createdAt, timeZone)}
        </p>
      </div>
      <IconButton label="Unstar" onClick={unstar} disabled={pending} className="text-accent-text">
        <StarIcon size={18} fill="currentColor" />
      </IconButton>
    </div>
  );
}
