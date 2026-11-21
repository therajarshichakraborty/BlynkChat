"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon";
import { LockIcon } from "@/components/icons/lock-icon";
import { UsersIcon } from "@/components/icons/users-icon";
import { XIcon } from "@/components/icons/x-icon";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import { Stepper } from "@/components/ui/stepper";
import { createGroup } from "@/lib/actions/groups";
import { imageSize, uploadFile } from "@/lib/uploads-client";
import { cn } from "@/lib/utils/cn";
import { imageAccept } from "@/lib/validation/uploads";
import type { PersonView } from "@/types/conversation";
import { GroupDetailsStep, type GroupSettings } from "./group-details-step";
import { GroupMembersStep } from "./group-members-step";
import { GroupPrivacyStep, type GroupVisibility } from "./group-privacy-step";

type CreateGroupWizardProps = {
  contacts: PersonView[];
  mode: "modal" | "page";
};

const steps = ["Details", "Members", "Privacy"];

export function CreateGroupWizard({ contacts, mode }: CreateGroupWizardProps) {
  const router = useRouter();
  const imageInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [settings, setSettings] = useState<GroupSettings>({
    approval: true,
    disappearing: false,
    adminsOnly: false,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<GroupVisibility>("private");
  const [image, setImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; members?: string; form?: string }>({});
  const [pending, startTransition] = useTransition();

  function close() {
    if (mode === "modal") router.back();
    else router.push("/chats");
  }

  function toggleMember(id: string) {
    setErrors((current) => ({ ...current, members: undefined }));
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function pickImage(file: File) {
    setUploadingImage(true);
    const result = await uploadFile(file, "image", await imageSize(file));
    setUploadingImage(false);
    if (result.ok) setImage(result.data.url);
    else setErrors((current) => ({ ...current, form: result.error.message }));
  }

  function next() {
    if (step === 0 && !name.trim()) {
      setErrors({ name: "Give your group a name." });
      return;
    }
    if (step === 1 && selected.length === 0) {
      setErrors({ members: "Add at least one member." });
      return;
    }
    setErrors({});
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    startTransition(async () => {
      const result = await createGroup({
        name: name.trim(),
        description: description.trim(),
        memberIds: selected,
        visibility,
        image,
        ...settings,
      });
      if (!result.ok) {
        const fields = result.error.fields ?? {};
        if (fields.name) setStep(0);
        else if (fields.memberIds || fields.members) setStep(1);
        setErrors({ name: fields.name, members: fields.memberIds ?? fields.members, form: result.error.message });
        return;
      }
      router.replace(`/chats/${result.data.id}` as Route);
    });
  }

  const last = step === steps.length - 1;

  return (
    <div className="flex max-h-[calc(100dvh-32px)] flex-col">
      <input
        ref={imageInput}
        type="file"
        accept={imageAccept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void pickImage(file);
          event.target.value = "";
        }}
      />
      <header className="flex items-start gap-4 border-b border-line px-5 py-5 md:px-8 md:py-6">
        <span className="inline-grid size-12 shrink-0 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent-text">
          <UsersIcon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="create-group-title" className="text-xl font-semibold tracking-tight">
            Create a new group
          </h2>
          <p className="text-sm text-muted">Up to 1,024 members. Upgrade to a community anytime.</p>
        </div>
        <IconButton label="Close" onClick={close}>
          <XIcon size={20} />
        </IconButton>
      </header>
      <div className="border-b border-line px-5 py-4 md:px-8">
        <Stepper steps={steps} current={step} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {errors.form ? (
          <div className="px-5 pt-5 md:px-8">
            <FormAlert message={errors.form} />
          </div>
        ) : null}
        {step === 2 ? (
          <div className="px-5 py-6 md:px-8">
            <GroupPrivacyStep
              visibility={visibility}
              onChange={setVisibility}
              summary={`${name.trim() || "Your group"} will start with you and ${selected.length} ${selected.length === 1 ? "member" : "members"}.`}
            />
          </div>
        ) : (
          <div className={cn("grid", step === 1 && "md:grid-cols-2")}>
            <div className={cn("px-5 py-6 md:px-8", step === 1 && "border-line max-md:hidden md:border-r")}>
              <GroupDetailsStep
                name={name}
                description={description}
                settings={settings}
                nameError={errors.name}
                image={image}
                uploadingImage={uploadingImage}
                onPickImage={() => imageInput.current?.click()}
                onName={(value) => {
                  setName(value);
                  setErrors((current) => ({ ...current, name: undefined }));
                }}
                onDescription={setDescription}
                onSetting={(key, value) => setSettings((current) => ({ ...current, [key]: value }))}
              />
            </div>
            {step === 1 ? (
              <div className="px-5 py-6 md:px-8">
                <GroupMembersStep
                  contacts={contacts}
                  selected={selected}
                  error={errors.members}
                  onToggle={toggleMember}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
      <footer className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4 md:px-8">
        <p className="mr-auto flex items-center gap-2 text-sm text-muted max-sm:hidden">
          <LockIcon size={16} />
          Messages in this group are end-to-end encrypted
        </p>
        <Button
          variant="outline"
          shape="rounded"
          onClick={() => (step === 0 ? close() : setStep(step - 1))}
          disabled={pending}
          className="max-sm:flex-1"
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        <Button
          shape="rounded"
          onClick={next}
          disabled={pending || uploadingImage}
          aria-busy={pending}
          className="max-sm:flex-1"
        >
          {pending ? <Spinner /> : null}
          {last ? "Create group" : `Next: ${steps[step + 1]}`}
          {!pending ? <ArrowRightIcon size={17} /> : null}
        </Button>
      </footer>
    </div>
  );
}
