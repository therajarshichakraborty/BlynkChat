import type { ReactNode } from "react";
import { XIcon } from "@/components/icons/x-icon";

type ComposerBannerProps = {
  icon: ReactNode;
  title: string;
  text: string;
  onCancel: () => void;
};

export function ComposerBanner({ icon, title, text, onCancel }: ComposerBannerProps) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-3 py-2">
      <span className="text-accent-text">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col border-l-[3px] border-accent pl-3">
        <span className="text-sm font-semibold text-accent-text">{title}</span>
        <span className="truncate text-sm text-muted">{text}</span>
      </span>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel"
        className="inline-grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-fg"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}
