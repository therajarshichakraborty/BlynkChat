"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CheckIcon } from "@/components/icons/check-icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TextAreaField } from "@/components/ui/text-area-field";
import { TextField } from "@/components/ui/text-field";
import { updateProfile } from "@/lib/data/profile";
import { validateUsername } from "@/lib/validation/auth";

type ProfileFormProps = {
  name: string;
  username: string;
  bio: string;
};

export function ProfileForm({ name, username, bio }: ProfileFormProps) {
  const [values, setValues] = useState({ name, username, bio });
  const [saved, setSaved] = useState(values);
  const [errors, setErrors] = useState<{ name?: string; username?: string }>({});
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = {
      name: values.name.trim() ? undefined : "Enter a display name.",
      username: validateUsername(values.username),
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.username) return;
    startTransition(async () => {
      await updateProfile(values);
      setSaved(values);
      setStatus("Profile saved");
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 py-4">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="profile-name"
          label="Display name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          error={errors.name}
        />
        <TextField
          id="profile-username"
          label="Username"
          autoCapitalize="none"
          spellCheck={false}
          value={values.username}
          onChange={(event) => update("username", event.target.value)}
          error={errors.username}
        />
      </div>
      <TextAreaField
        id="profile-bio"
        label="Bio"
        value={values.bio}
        onChange={(event) => update("bio", event.target.value)}
      />
      <div className="flex items-center justify-end gap-3">
        {status ? (
          <p role="status" className="mr-auto inline-flex items-center gap-1.5 text-sm text-success-text">
            <CheckIcon size={16} />
            {status}
          </p>
        ) : null}
        <Button type="submit" shape="rounded" disabled={!dirty || pending} aria-busy={pending}>
          {pending ? <Spinner /> : null}
          Save changes
        </Button>
      </div>
    </form>
  );
}
