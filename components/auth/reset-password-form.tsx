"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { PasswordField } from "@/components/ui/password-field";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation/auth";
import { collectFieldErrors, type FieldErrors } from "@/lib/validation/form";
import { FormAlert } from "./form-alert";
import { SubmitButton } from "./submit-button";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ResetPasswordValues>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors<ResetPasswordValues>>({});
  const [formError, setFormError] = useState("");
  const [pending, startTransition] = useTransition();

  function update(field: keyof ResetPasswordValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    startTransition(async () => {
      const { error } = await authClient.resetPassword({ newPassword: parsed.data.password, token });
      if (error) {
        setFormError("This reset link is invalid or has expired. Request a new one.");
        return;
      }
      router.replace("/login?reset=1");
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError ? <FormAlert message={formError} /> : null}
      <PasswordField
        id="reset-password"
        name="password"
        label="New password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={values.password}
        onChange={(event) => update("password", event.target.value)}
        error={errors.password}
        hint="At least 8 characters with a letter and a number."
        disabled={pending}
      />
      <PasswordField
        id="reset-confirm"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        value={values.confirmPassword}
        onChange={(event) => update("confirmPassword", event.target.value)}
        error={errors.confirmPassword}
        disabled={pending}
      />
      <SubmitButton pending={pending} pendingLabel="Saving password">
        Set new password
      </SubmitButton>
    </form>
  );
}
