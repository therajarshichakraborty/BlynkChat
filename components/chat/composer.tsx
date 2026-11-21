"use client";

import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { MicIcon } from "@/components/icons/mic-icon";
import { PaperclipIcon } from "@/components/icons/paperclip-icon";
import { PlusIcon } from "@/components/icons/plus-icon";
import { SendIcon } from "@/components/icons/send-icon";
import { SmileIcon } from "@/components/icons/smile-icon";
import { IconButton } from "@/components/ui/icon-button";
import { messageBodyLimit } from "@/lib/validation/messages";
import { EmojiPicker } from "./emoji-picker";

type ComposerProps = {
  placeholder: string;
  onSend: (body: string) => void;
  initialValue?: string;
  banner?: ReactNode;
  onCancel?: () => void;
  onTyping?: () => void;
  attachments?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  canSendEmpty?: boolean;
  busy?: boolean;
  inputId?: string;
};

export function Composer({
  placeholder,
  onSend,
  initialValue = "",
  banner,
  onCancel,
  onTyping,
  attachments,
  leading,
  trailing,
  canSendEmpty = false,
  busy = false,
  inputId = "composer-input",
}: ComposerProps) {
  const [value, setValue] = useState(initialValue);
  const empty = value.trim().length === 0 && !canSendEmpty;

  function submit() {
    if (empty || busy) return;
    onSend(value.trim());
    setValue("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
    if (event.key === "Escape" && onCancel) {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl border border-line bg-card shadow-md transition-[border-color,box-shadow] duration-150 focus-within:border-accent-line"
    >
      {banner}
      {attachments}
      <div className="flex items-end gap-1 p-1.5 md:gap-1.5 md:p-2">
        {leading === undefined ? (
          <IconButton label="Add attachment" className="max-sm:hidden">
            <PlusIcon size={20} />
          </IconButton>
        ) : (
          leading
        )}
        <label htmlFor={inputId} className="sr-only">
          {placeholder}
        </label>
        <textarea
          id={inputId}
          rows={1}
          value={value}
          maxLength={messageBodyLimit}
          autoFocus={Boolean(initialValue)}
          onChange={(event) => {
            setValue(event.target.value);
            if (event.target.value.trim()) onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="field-sizing-content max-h-40 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2.5 text-md leading-5 outline-none"
        />
        <EmojiPicker
          label="Emoji"
          icon={<SmileIcon size={20} />}
          onPick={(emoji) => setValue((current) => `${current}${emoji}`)}
          align="end"
          buttonClassName="size-10"
        />
        {trailing === undefined ? (
          <>
            <IconButton label="Attach file" className="max-sm:hidden">
              <PaperclipIcon size={20} />
            </IconButton>
            <IconButton label="Record voice note" className="max-sm:hidden">
              <MicIcon size={20} />
            </IconButton>
          </>
        ) : (
          trailing
        )}
        <IconButton type="submit" label="Send message" variant="accent" disabled={empty || busy}>
          <SendIcon size={18} />
        </IconButton>
      </div>
    </form>
  );
}
