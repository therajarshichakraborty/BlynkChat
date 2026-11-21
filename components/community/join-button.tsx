"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/icons/check-icon";
import { Button } from "@/components/ui/button";

type JoinButtonProps = {
  name: string;
  initiallyJoined: boolean;
};

export function JoinButton({ name, initiallyJoined }: JoinButtonProps) {
  const [joined, setJoined] = useState(initiallyJoined);

  return (
    <Button
      size="sm"
      variant={joined ? "outline" : "dark"}
      aria-pressed={joined}
      aria-label={joined ? `Leave ${name}` : `Join ${name}`}
      onClick={() => setJoined((value) => !value)}
      className="h-9 min-w-20 px-4"
    >
      {joined ? (
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
