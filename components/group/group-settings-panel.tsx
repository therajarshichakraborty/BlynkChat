"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { CameraIcon } from "@/components/icons/camera-icon";
import { MegaphoneIcon } from "@/components/icons/megaphone-icon";
import { ShieldCheckIcon } from "@/components/icons/shield-check-icon";
import { TimerIcon } from "@/components/icons/timer-icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TextAreaField } from "@/components/ui/text-area-field";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import { Toggle } from "@/components/ui/toggle";
import { saveGroupSettings } from "@/lib/actions/groups";
import { imageSize, uploadFile } from "@/lib/uploads-client";
import { disappearingOptions, groupNameLimit, type GroupSettingsValues } from "@/lib/validation/groups";
import { imageAccept } from "@/lib/validation/uploads";
import { cn } from "@/lib/utils/cn";

type GroupSettingsPanelProps = {
  conversationId: string;
  admin: boolean;
  title: string;
  description: string;
  onlyAdminsCanPost: boolean;
  requireApproval: boolean;
  disappearingSeconds: number | null;
};

export function GroupSettingsPanel(props: GroupSettingsPanelProps) {
  const { conversationId, admin } = props;
  const router = useRouter();
  const { show } = useToast();
  const imageInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(props.title);
  const [description, setDescription] = useState(props.description);
  const [titleError, setTitleError] = useState("");
  const [pending, startTransition] = useTransition();
  const disappearing = props.disappearingSeconds ?? 0;
  const dirty = title.trim() !== props.title || description.trim() !== props.description;

  function save(values: Omit<GroupSettingsValues, "conversationId">, success: string) {
    startTransition(async () => {
      const result = await saveGroupSettings({ conversationId, ...values });
      if (!result.ok) {
        if (result.error.fields?.title) setTitleError(result.error.fields.title);
        show(result.error.message);
        return;
      }
      show(success, "success");
      router.refresh();
    });
  }

  function handleDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setTitleError("Give your group a name.");
      return;
    }
    save({ title: title.trim(), description: description.trim() }, "Group details saved");
  }

  async function changeIcon(file: File) {
    const result = await uploadFile(file, "image", await imageSize(file));
    if (!result.ok) {
      show(result.error.message);
      return;
    }
    save({ image: result.data.url }, "Group icon updated");
  }

  if (!admin) {
    return (
      <section aria-labelledby="group-settings-heading" className="border-t border-line px-6 py-6">
        <h3 id="group-settings-heading" className="text-md font-semibold">
          Group settings
        </h3>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
          <li className="flex items-center gap-2.5">
            <TimerIcon size={16} />
            Disappearing messages: {disappearingOptions.find((option) => option.value === disappearing)?.label ?? "Off"}
          </li>
          <li className="flex items-center gap-2.5">
            <MegaphoneIcon size={16} />
            {props.onlyAdminsCanPost ? "Only admins can send messages" : "Everyone can send messages"}
          </li>
          <li className="flex items-center gap-2.5">
            <ShieldCheckIcon size={16} />
            {props.requireApproval ? "Admins approve new members" : "Anyone with the link can join"}
          </li>
        </ul>
      </section>
    );
  }

  return (
    <section aria-labelledby="group-settings-heading" className="border-t border-line px-6 py-6">
      <input
        ref={imageInput}
        type="file"
        accept={imageAccept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void changeIcon(file);
          event.target.value = "";
        }}
      />
      <div className="flex items-center justify-between">
        <h3 id="group-settings-heading" className="text-md font-semibold">
          Group settings
        </h3>
        <Button size="sm" variant="ghost" onClick={() => imageInput.current?.click()} disabled={pending}>
          <CameraIcon size={15} />
          Change icon
        </Button>
      </div>
      <form onSubmit={handleDetails} noValidate className="mt-4 flex flex-col gap-4">
        <TextField
          id="group-settings-title"
          label="Group name"
          value={title}
          maxLength={groupNameLimit}
          error={titleError || undefined}
          onChange={(event) => {
            setTitle(event.target.value);
            setTitleError("");
          }}
        />
        <TextAreaField
          id="group-settings-description"
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {dirty ? (
          <Button type="submit" size="sm" shape="rounded" className="self-end" disabled={pending} aria-busy={pending}>
            {pending ? <Spinner /> : null}
            Save
          </Button>
        ) : null}
      </form>
      <ul className="mt-4 flex flex-col gap-1">
        <li>
          <label className="flex min-h-11 items-center gap-3 text-md">
            <MegaphoneIcon size={18} className="text-muted" />
            <span className="flex-1">Only admins can post</span>
            <Toggle
              checked={props.onlyAdminsCanPost}
              disabled={pending}
              onChange={(event) =>
                save(
                  { onlyAdminsCanPost: event.target.checked },
                  event.target.checked ? "Only admins can post now" : "Everyone can post now",
                )
              }
            />
          </label>
        </li>
        <li>
          <label className="flex min-h-11 items-center gap-3 text-md">
            <ShieldCheckIcon size={18} className="text-muted" />
            <span className="flex-1">Admin approval to join</span>
            <Toggle
              checked={props.requireApproval}
              disabled={pending}
              onChange={(event) =>
                save(
                  { requireApproval: event.target.checked },
                  event.target.checked ? "Join requests now need approval" : "Anyone with the link can join",
                )
              }
            />
          </label>
        </li>
      </ul>
      <fieldset className="mt-3">
        <legend className="flex items-center gap-3 text-md">
          <TimerIcon size={18} className="text-muted" />
          Disappearing messages
        </legend>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {disappearingOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-sm font-medium transition-colors duration-150 has-focus-visible:ring-4 has-focus-visible:ring-ring",
                disappearing === option.value
                  ? "border-accent bg-accent-soft text-accent-text"
                  : "border-line text-muted hover:bg-surface hover:text-fg",
              )}
            >
              <input
                type="radio"
                name="disappearing"
                value={option.value}
                checked={disappearing === option.value}
                disabled={pending}
                onChange={() => save({ disappearingSeconds: option.value }, `Disappearing messages: ${option.label}`)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
