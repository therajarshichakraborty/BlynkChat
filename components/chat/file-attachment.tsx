import { DownloadIcon } from "@/components/icons/download-icon";
import { FileTextIcon } from "@/components/icons/file-text-icon";
import { PenToolIcon } from "@/components/icons/pen-tool-icon";
import { IconButton } from "@/components/ui/icon-button";
import type { FileAttachment as FileAttachmentData } from "@/types/chat";

type FileAttachmentProps = {
  file: FileAttachmentData;
};

export function FileAttachment({ file }: FileAttachmentProps) {
  const FileIcon = file.type === "Figma" ? PenToolIcon : FileTextIcon;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-card p-2.5 pr-2 text-fg shadow-xs">
      <span className="inline-grid size-11 shrink-0 place-items-center rounded-md bg-accent-solid text-on-accent">
        <FileIcon size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-md font-medium">{file.name}</span>
        <span className="text-xs text-muted">
          {file.size} · {file.type}
        </span>
      </span>
      <IconButton label={`Download ${file.name}`} size="sm">
        <DownloadIcon size={18} />
      </IconButton>
    </div>
  );
}
