"use client";

import { useState } from "react";
import { BellIcon } from "@/components/icons/bell-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { Button } from "@/components/ui/button";

type NotifyButtonProps = {
  waitlist: number;
};

export function NotifyButton({ waitlist }: NotifyButtonProps) {
  const [subscribed, setSubscribed] = useState(false);
  const count = waitlist + (subscribed ? 1 : 0);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        size="lg"
        block
        variant={subscribed ? "soft" : "primary"}
        aria-pressed={subscribed}
        onClick={() => setSubscribed((value) => !value)}
      >
        {subscribed ? <CheckIcon size={18} /> : <BellIcon size={18} />}
        {subscribed ? "We will notify you at launch" : "Notify me at launch"}
      </Button>
      <p className="text-sm text-muted" aria-live="polite">
        {count.toLocaleString("en-US")} people on the waitlist
      </p>
    </div>
  );
}
