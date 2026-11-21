"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { signIn } from "@/lib/data/auth";
import { afterAuthRoute } from "@/lib/site";
import { hasErrors, validateLogin, type FieldErrors, type LoginValues } from "@/lib/validation/auth";
import { FormAlert } from "./form-alert";
import { SubmitButton } from "./submit-button";

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [formError, setFormError] = useState("");
  const [pending, startTransition] = useTransition();

  function update(field: keyof LoginValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setFormError("");
    if (hasErrors(nextErrors)) return;
    startTransition(async () => {
      const result = await signIn(values);
      if (result.ok) {
        router.push(afterAuthRoute);
      } else {
        setFormError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError ? <FormAlert message={formError} /> : null}
      <TextField
        id="login-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@email.com"
        value={values.email}
        onChange={(event) => update("email", event.target.value)}
        error={errors.email}
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
