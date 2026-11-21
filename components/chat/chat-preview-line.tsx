import { CameraIcon } from "@/components/icons/camera-icon";
import { ChartColumnIcon } from "@/components/icons/chart-column-icon";
import { FileTextIcon } from "@/components/icons/file-text-icon";
import { MicIcon } from "@/components/icons/mic-icon";
import { cn } from "@/lib/utils/cn";
import type { ChatSummary } from "@/types/conversation";

type ChatPreviewLineProps = {
  chat: ChatSummary;
  typingLabel?: string;
};

const kindIcons = {
  image: CameraIcon,
  file: FileTextIcon,
  voice: MicIcon,
  poll: ChartColumnIcon,
} as const;

export function ChatPreviewLine({ chat, typingLabel }: ChatPreviewLineProps) {
  if (typingLabel) {
    return <span className="truncate font-medium text-accent-text">{typingLabel}</span>;
  }

  const { preview } = chat;
  if (!preview) {
    return <span className="truncate text-muted">No messages yet</span>;
  }

  const KindIcon = preview.kind in kindIcons ? kindIcons[preview.kind as keyof typeof kindIcons] : null;

  return (
    <span className="flex min-w-0 items-center gap-1.5 text-muted">
      {KindIcon ? <KindIcon size={15} className="shrink-0 text-accent-text" /> : null}
      <span className={cn("truncate", chat.unread > 0 && "text-fg", preview.kind === "deleted" && "italic")}>
        {preview.author ? `${preview.author}: ` : ""}
        {preview.text}
      </span>
    </span>
  );
}
