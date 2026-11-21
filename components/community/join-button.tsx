"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckIcon } from "@/components/icons/check-icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { setCommunityMembership } from "@/lib/actions/communities";
import { roomHref } from "@/lib/utils/community-links";

type JoinButtonProps = {
  communityId: string;
  slug: string;
  name: string;
  initiallyJoined: boolean;
  openAfterJoin?: boolean;
  size?: "sm" | "lg";
};

export function JoinButton({ communityId, slug, name, initiallyJoined, openAfterJoin = false, size = "sm" }: JoinButtonProps) {
  const router = useRouter();
  const { show } = useToast();
  const [joined, setJoined] = useState(initiallyJoined);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !joined;
    startTransition(async () => {
      setJoined(next);
      const result = await setCommunityMembership({ communityId, join: next });
      if (!result.ok) {
        setJoined(!next);
        show(result.error.message);
        return;
      }
      show(next ? `You joined ${name}` : `You left ${name}`, "success");
      if (next && openAfterJoin) router.push(roomHref(slug) as Route);
      else router.refresh();
    });
  }

  return (
    <Button
      size={size === "lg" ? "lg" : "sm"}
      variant={joined ? "outline" : "dark"}
      aria-pressed={joined}
      aria-label={joined ? `Leave ${name}` : `Join ${name}`}
      onClick={toggle}
      disabled={pending}
      className={size === "lg" ? "min-w-40" : "h-9 min-w-20 px-4"}
    >
      {pending ? (
        <Spinner />
      ) : joined ? (
        <>
          <CheckIcon size={16} />
          Joined
        </>
      ) : (
        "Join"
      )}
    </Button>
  );
}
