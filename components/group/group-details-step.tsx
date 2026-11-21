import Image from "next/image";
import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { CameraIcon } from "@/components/icons/camera-icon";
import { MegaphoneIcon } from "@/components/icons/megaphone-icon";
import { ShieldCheckIcon } from "@/components/icons/shield-check-icon";
import { TimerIcon } from "@/components/icons/timer-icon";
import { TextAreaField } from "@/components/ui/text-area-field";
import { TextField } from "@/components/ui/text-field";
import { Toggle } from "@/components/ui/toggle";
import { toneGradient } from "@/lib/utils/tone";
import { cn } from "@/lib/utils/cn";

export type GroupSettings = {
  approval: boolean;
  disappearing: boolean;
  adminsOnly: boolean;
};

type GroupDetailsStepProps = {
  name: string;
  description: string;
  settings: GroupSettings;
  nameError?: string;
  onName: (value: string) => void;
  onDescription: (value: string) => void;
  onSetting: (key: keyof GroupSettings, value: boolean) => void;
  image: string | null;
  uploadingImage: boolean;
  onPickImage: () => void;
};

const groupNameLimit = 48;

const settingRows: { key: keyof GroupSettings; label: string; icon: ReactNode }[] = [
  { key: "approval", label: "Admin approval to join", icon: <ShieldCheckIcon size={18} /> },
  { key: "disappearing", label: "Disappearing messages", icon: <TimerIcon size={18} /> },
  { key: "adminsOnly", label: "Only admins can post", icon: <MegaphoneIcon size={18} /> },
];

function initialsFor(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "G";
}

export function GroupDetailsStep({
  name,
  description,
  settings,
  nameError,
  onName,
  onDescription,
  onSetting,
  image,
  uploadingImage,
  onPickImage,
}: GroupDetailsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className="relative">
          {image ? (
            <Image src={image} alt="" width={72} height={72} unoptimized className="size-18 rounded-xl object-cover shadow-accent" />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                "inline-grid size-18 place-items-center rounded-xl text-2xl font-semibold text-white shadow-accent",
                toneGradient("blue"),
              )}
            >
              {initialsFor(name)}
            </span>
          )}
          <button
            type="button"
            onClick={onPickImage}
            disabled={uploadingImage}
            aria-label="Upload group icon"
            className="absolute -right-1.5 -bottom-1.5 inline-grid size-8 place-items-center rounded-full border border-line bg-card text-fg shadow-sm hover:bg-surface"
          >
            {uploadingImage ? <Spinner className="size-3.5" /> : <CameraIcon size={15} />}
          </button>
        </span>
        <div>
          <p className="text-md font-medium">Group icon</p>
          <p className="text-sm text-muted">PNG or JPG, at least 256px</p>
        </div>
      </div>
      <TextField
        id="group-name"
        label="Group name"
        placeholder="e.g. Launch Squad"
        value={name}
        maxLength={groupNameLimit}
        onChange={(event) => onName(event.target.value)}
        error={nameError}
        trailing={
          <span className="text-xs text-muted tabular-nums" aria-hidden="true">
            {name.length}/{groupNameLimit}
          </span>
        }
      />
      <TextAreaField
        id="group-description"
        label="Description"
        placeholder="What is this group about?"
        value={description}
        onChange={(event) => onDescription(event.target.value)}
      />
      <ul className="flex flex-col gap-1">
        {settingRows.map((row) => (
          <li key={row.key}>
            <label className="flex min-h-11 items-center gap-3 text-md">
              <span className="text-muted">{row.icon}</span>
              <span className="flex-1">{row.label}</span>
              <Toggle
                checked={settings[row.key]}
                onChange={(event) => onSetting(row.key, event.target.checked)}
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
