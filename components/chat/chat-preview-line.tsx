import { CameraIcon } from "@/components/icons/camera-icon";
import { CheckCheckIcon } from "@/components/icons/check-check-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { MicIcon } from "@/components/icons/mic-icon";
import { cn } from "@/lib/utils/cn";
import type { Chat } from "@/types/chat";

type ChatPreviewLineProps = {
  chat: Chat;
};

export function ChatPreviewLine({ chat }: ChatPreviewLineProps) {
  if (chat.typing) {
    return <span className="truncate font-medium text-accent-text">typing…</span>;
  }

  const { preview } = chat;
  const prefix = preview.fromMe && chat.kind !== "direct" ? "You: " : preview.author ? `${preview.author}: ` : "";

  return (
    <span className="flex min-w-0 items-center gap-1.5 text-muted">
      {preview.fromMe ? (
        preview.status === "read" ? (
          <CheckCheckIcon size={16} className="shrink-0 text-accent-text" aria-label="Read" />
        ) : (
          <CheckIcon size={16} className="shrink-0" aria-label="Sent" />
        )
      ) : null}
      {preview.kind === "voice" ? <MicIcon size={15} className="shrink-0 text-accent-text" /> : null}
      {preview.kind === "photo" ? <CameraIcon size={15} className="shrink-0" /> : null}
      <span className={cn("truncate", chat.unread > 0 && "text-fg")}>
        {prefix}
        {preview.text}
      </span>
    </span>
  );
}
