"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { MicIcon } from "@/components/icons/mic-icon";
import { PaperclipIcon } from "@/components/icons/paperclip-icon";
import { PlusIcon } from "@/components/icons/plus-icon";
import { SendIcon } from "@/components/icons/send-icon";
import { SmileIcon } from "@/components/icons/smile-icon";
import { IconButton } from "@/components/ui/icon-button";

type ComposerProps = {
  placeholder: string;
  onSend: (body: string) => void;
};

export function Composer({ placeholder, onSend }: ComposerProps) {
  const [value, setValue] = useState("");
  const empty = value.trim().length === 0;

  function submit() {
    if (empty) return;
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
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-1 rounded-xl border border-line bg-card p-1.5 shadow-md transition-[border-color,box-shadow] duration-150 focus-within:border-accent-line md:gap-1.5 md:p-2"
    >
      <IconButton label="Add attachment" className="max-sm:hidden">
        <PlusIcon size={20} />
      </IconButton>
      <label htmlFor="composer-input" className="sr-only">
        {placeholder}
      </label>
      <textarea
        id="composer-input"
        rows={1}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="field-sizing-content max-h-40 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2.5 text-md leading-5 outline-none"
      />
      <IconButton label="Emoji">
        <SmileIcon size={20} />
      </IconButton>
      <IconButton label="Attach file" className="max-sm:hidden">
        <PaperclipIcon size={20} />
      </IconButton>
      <IconButton label="Record voice note" className="max-sm:hidden">
        <MicIcon size={20} />
      </IconButton>
      <IconButton type="submit" label="Send message" variant="accent" disabled={empty}>
        <SendIcon size={18} />
      </IconButton>
    </form>
  );
}
