"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { SparklesIcon } from "@/components/icons/sparkles-icon";
import { XIcon } from "@/components/icons/x-icon";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import { TextAreaField } from "@/components/ui/text-area-field";
import { TextField } from "@/components/ui/text-field";
import { createCommunity } from "@/lib/actions/communities";
import { cn } from "@/lib/utils/cn";
import { categoryOptions, roomHref } from "@/lib/utils/community-links";
import type { CategoryView } from "@/types/community";

type CreateCommunityDialogProps = {
  onClose: () => void;
};

export function CreateCommunityDialog({ onClose }: CreateCommunityDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryView>("technology");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "Give your community a name." });
      return;
    }
    setErrors({});
    setFormError("");
    startTransition(async () => {
      const result = await createCommunity({ name: name.trim(), description: description.trim(), category, visibility });
      if (!result.ok) {
        setErrors(result.error.fields ?? {});
        setFormError(result.error.message);
        return;
      }
      onClose();
      router.push(roomHref(result.data.slug) as Route);
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="create-community-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-lg overflow-hidden rounded-[24px] border border-line bg-card p-0 text-fg shadow-lg backdrop:bg-overlay backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} noValidate className="flex max-h-[calc(100dvh-32px)] flex-col">
        <header className="flex items-start gap-4 border-b border-line px-5 py-5 md:px-6">
          <span className="inline-grid size-12 shrink-0 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent-text">
            <SparklesIcon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="create-community-title" className="text-xl font-semibold tracking-tight">
              Start a community
            </h2>
            <p className="text-sm text-muted">You get an announcements room and a general room to start.</p>
          </div>
          <IconButton label="Close" onClick={onClose}>
            <XIcon size={20} />
          </IconButton>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 md:px-6">
          {formError ? <FormAlert message={formError} /> : null}
          <TextField
            id="community-name"
            label="Community name"
            placeholder="e.g. Frontend Guild"
            maxLength={48}
            value={name}
            error={errors.name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextAreaField
            id="community-description"
            label="Description"
            placeholder="What brings people here?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <fieldset>
            <legend className="text-sm font-medium">Category</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {categoryOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-sm font-medium transition-colors duration-150 has-focus-visible:ring-4 has-focus-visible:ring-ring",
                    category === option.value ? "bg-inverse text-on-inverse" : "border border-line text-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  <input
                    type="radio"
                    name="community-category"
                    value={option.value}
                    checked={category === option.value}
                    onChange={() => setCategory(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium">Who can join?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["public", "private"] as const).map((value) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer flex-col rounded-lg border p-3 transition-colors duration-150 has-focus-visible:ring-4 has-focus-visible:ring-ring",
                    visibility === value ? "border-accent bg-accent-soft" : "border-line hover:bg-surface",
                  )}
                >
                  <input
                    type="radio"
                    name="community-visibility"
                    value={value}
                    checked={visibility === value}
                    onChange={() => setVisibility(value)}
                    className="sr-only"
                  />
                  <span className="text-md font-medium">{value === "public" ? "Public" : "Private"}</span>
                  <span className="text-xs text-muted">
                    {value === "public" ? "Anyone can find and join." : "Hidden from explore."}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <footer className="flex justify-end gap-3 border-t border-line px-5 py-4 md:px-6">
          <Button variant="outline" shape="rounded" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" shape="rounded" disabled={pending} aria-busy={pending}>
            {pending ? <Spinner /> : null}
            Create community
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
