import { LockIcon } from "@/components/icons/lock-icon";

type ComposerNoticeProps = {
  text: string;
};

export function ComposerNotice({ text }: ComposerNoticeProps) {
  return (
    <p className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-3.5 text-center text-sm text-muted">
      <LockIcon size={15} />
      {text}
    </p>
  );
}
