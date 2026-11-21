"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { signUp } from "@/lib/data/auth";
import { afterAuthRoute } from "@/lib/site";
import {
  hasErrors,
  validateSignup,
  type FieldErrors,
  type SignupValues,
} from "@/lib/validation/auth";
import { FormAlert } from "./form-alert";
import { SubmitButton } from "./submit-button";

const initialValues: SignupValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<SignupValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<SignupValues>>({});
  const [formError, setFormError] = useState("");
  const [pending, startTransition] = useTransition();

  function update(field: keyof SignupValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    setFormError("");
    if (hasErrors(nextErrors)) return;
    startTransition(async () => {
      const result = await signUp(values);
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
        id="signup-username"
        name="username"
        label="Username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="your_name"
        value={values.username}
        onChange={(event) => update("username", event.target.value)}
        error={errors.username}
        hint="3 to 20 characters: lowercase letters, numbers and underscores."
        disabled={pending}
      />
      <TextField
        id="signup-email"
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
        id="signup-password"
        name="password"
        label="Password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={values.password}
        onChange={(event) => update("password", event.target.value)}
        error={errors.password}
        hint="At least 8 characters with a letter and a number."
        disabled={pending}
      />
      <PasswordField
        id="signup-confirm"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        value={values.confirmPassword}
        onChange={(event) => update("confirmPassword", event.target.value)}
        error={errors.confirmPassword}
        disabled={pending}
      />
      <SubmitButton pending={pending} pendingLabel="Creating account">
        Create account
      </SubmitButton>
    </form>
  );
}
