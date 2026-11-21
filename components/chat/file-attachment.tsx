import { DownloadIcon } from "@/components/icons/download-icon";
import { FileTextIcon } from "@/components/icons/file-text-icon";
import { iconButtonClasses } from "@/components/ui/icon-button-styles";
import { formatBytes } from "@/lib/utils/time";
import type { AttachmentView } from "@/types/message";

type FileAttachmentProps = {
  file: AttachmentView;
};

function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : "File";
}

export function FileAttachment({ file }: FileAttachmentProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-card p-2.5 pr-2 text-fg shadow-xs">
      <span className="inline-grid size-11 shrink-0 place-items-center rounded-md bg-accent-solid text-on-accent">
        <FileTextIcon size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-md font-medium">{file.name}</span>
        <span className="text-xs text-muted">
          {formatBytes(file.size)} · {extensionOf(file.name)}
        </span>
      </span>
      <a
        href={`${file.url}?download=1`}
        download={file.name}
        aria-label={`Download ${file.name}`}
        title={`Download ${file.name}`}
        className={iconButtonClasses("ghost", "sm")}
      >
        <DownloadIcon size={18} />
      </a>
    </div>
  );
}
