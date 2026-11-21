"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { signInErrorMessage } from "@/lib/auth-errors";
import { afterAuthRoute } from "@/lib/site";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { collectFieldErrors, type FieldErrors } from "@/lib/validation/form";
import { FormAlert } from "./form-alert";
import { SubmitButton } from "./submit-button";

function signInWith({ identifier, password }: LoginValues) {
  return identifier.includes("@")
    ? authClient.signIn.email({ email: identifier, password })
    : authClient.signIn.username({ username: identifier.toLowerCase(), password });
}

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>({ identifier: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [formError, setFormError] = useState("");
  const [pending, startTransition] = useTransition();

  function update(field: keyof LoginValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    startTransition(async () => {
      const { error } = await signInWith(parsed.data);
      if (error) {
        setFormError(signInErrorMessage(error));
        return;
      }
      router.replace(afterAuthRoute);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError ? <FormAlert message={formError} /> : null}
      <TextField
        id="login-identifier"
        name="identifier"
        label="Email or username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="you@email.com or your_name"
        value={values.identifier}
        onChange={(event) => update("identifier", event.target.value)}
        error={errors.identifier}
        disabled={pending}
      />
      <PasswordField
        id="login-password"
        name="password"
        label="Password"
        autoComplete="current-password"
        placeholder="Your password"
        value={values.password}
        onChange={(event) => update("password", event.target.value)}
        error={errors.password}
        disabled={pending}
      />
      <SubmitButton pending={pending} pendingLabel="Signing in">
        Log in
      </SubmitButton>
    </form>
  );
}
