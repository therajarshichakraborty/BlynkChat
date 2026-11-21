"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon } from "@/components/icons/check-icon";
import { Button } from "@/components/ui/button";
import { isEmail } from "@/lib/validation/auth";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setJoined(true);
  }

  if (joined) {
    return (
      <p role="status" className="inline-flex items-center gap-2 text-base font-medium text-success-text">
        <CheckIcon size={18} />
        You are on the list. We will email you at launch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "waitlist-error" : undefined}
          className="h-10 min-w-0 flex-1 basis-48 rounded-md border border-line bg-bg px-3 text-base outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-4 focus:ring-ring"
        />
        <Button type="submit" shape="rounded" className="rounded-md">
          Join waitlist
        </Button>
      </div>
      {error ? (
        <p id="waitlist-error" className="text-xs text-danger-text" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
