"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CheckIcon } from "@/components/icons/check-icon";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { emailSchema } from "@/lib/validation/auth";
import { FormAlert } from "./form-alert";
import { SubmitButton } from "./submit-button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await authClient.requestPasswordReset({
        email: parsed.data,
        redirectTo: "/reset-password",
      });
      if (result.error?.status === 429) {
        setFormError("Too many requests. Wait a minute and try again.");
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <p role="status" className="flex items-start gap-2.5 rounded-md bg-success-soft px-3 py-3 text-sm text-success-text">
        <CheckIcon size={18} className="mt-0.5 shrink-0" />
        If an account exists for that email, a reset link is on its way. In development the link is printed in the server console.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError ? <FormAlert message={formError} /> : null}
      <TextField
        id="forgot-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setError("");
        }}
        error={error || undefined}
        disabled={pending}
      />
      <SubmitButton pending={pending} pendingLabel="Sending link">
        Send reset link
      </SubmitButton>
    </form>
  );
}
