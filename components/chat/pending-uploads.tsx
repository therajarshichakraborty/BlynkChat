import Image from "next/image";
import { AlertCircleIcon } from "@/components/icons/alert-circle-icon";
import { FileTextIcon } from "@/components/icons/file-text-icon";
import { XIcon } from "@/components/icons/x-icon";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/time";
import type { AttachmentView } from "@/types/message";

export type PendingUpload = {
  localId: string;
  name: string;
  size: number;
  previewUrl: string | null;
  status: "uploading" | "ready" | "error";
  attachment: AttachmentView | null;
};

type PendingUploadsProps = {
  uploads: PendingUpload[];
  onRemove: (localId: string) => void;
};

export function PendingUploads({ uploads, onRemove }: PendingUploadsProps) {
  if (uploads.length === 0) return null;
  return (
    <ul aria-label="Attachments" className="flex flex-wrap gap-2 border-b border-line px-3 py-2.5">
      {uploads.map((upload) => (
        <li
          key={upload.localId}
          className={cn(
            "relative flex h-14 max-w-60 items-center gap-2.5 rounded-lg border bg-surface pr-9 pl-1.5",
            upload.status === "error" ? "border-danger/40" : "border-line",
          )}
        >
          {upload.previewUrl ? (
            <Image
              src={upload.previewUrl}
              alt=""
              width={44}
              height={44}
              unoptimized
              className="size-11 rounded-md object-cover"
            />
          ) : (
            <span className="inline-grid size-11 shrink-0 place-items-center rounded-md bg-accent-solid text-on-accent">
              <FileTextIcon size={18} />
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{upload.name}</span>
            <span className={cn("flex items-center gap-1 text-xs", upload.status === "error" ? "text-danger-text" : "text-muted")}>
              {upload.status === "uploading" ? <Spinner className="size-3" /> : null}
              {upload.status === "error" ? <AlertCircleIcon size={12} /> : null}
              {upload.status === "uploading" ? "Uploading…" : upload.status === "error" ? "Upload failed" : formatBytes(upload.size)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onRemove(upload.localId)}
            aria-label={`Remove ${upload.name}`}
            className="absolute top-1/2 right-1.5 inline-grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-raised hover:text-fg"
          >
            <XIcon size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
