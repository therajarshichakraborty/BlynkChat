"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { ChartColumnIcon } from "@/components/icons/chart-column-icon";
import { PlusIcon } from "@/components/icons/plus-icon";
import { XIcon } from "@/components/icons/x-icon";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/components/ui/text-field";
import { Toggle } from "@/components/ui/toggle";
import { createPoll } from "@/lib/actions/polls";
import { pollOptionLimit } from "@/lib/validation/polls";
import type { MessageView } from "@/types/message";

type PollDialogProps = {
  conversationId: string;
  onClose: () => void;
  onCreated: (message: MessageView) => void;
};

export function PollDialog({ conversationId, onClose, onCreated }: PollDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const filled = options.map((option) => option.trim()).filter(Boolean);
    if (!question.trim()) return setError("Ask a question.");
    if (filled.length < 2) return setError("Add at least two options.");
    setError("");
    startTransition(async () => {
      const result = await createPoll({ conversationId, question: question.trim(), options: filled, multipleChoice });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onCreated(result.data);
      onClose();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="poll-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-md overflow-hidden rounded-[24px] border border-line bg-card p-0 text-fg shadow-lg backdrop:bg-overlay backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} noValidate className="flex max-h-[calc(100dvh-32px)] flex-col">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="inline-grid size-10 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent-text">
            <ChartColumnIcon size={18} />
          </span>
          <h2 id="poll-title" className="flex-1 text-lg font-semibold tracking-tight">
            Create poll
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <XIcon size={20} />
          </IconButton>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          {error ? <FormAlert message={error} /> : null}
          <TextField
            id="poll-question"
            label="Question"
            placeholder="Ask something"
            maxLength={200}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-1.5 text-sm font-medium">Options</legend>
            {options.map((option, index) => (
              <div key={index} className="flex items-end gap-2">
                <TextField
                  id={`poll-option-${index}`}
                  label={`Option ${index + 1}`}
                  className="flex-1 [&_label]:sr-only"
                  placeholder={`Option ${index + 1}`}
                  maxLength={80}
                  value={option}
                  onChange={(event) =>
                    setOptions((current) => current.map((item, position) => (position === index ? event.target.value : item)))
                  }
                />
                {options.length > 2 ? (
                  <IconButton
                    label={`Remove option ${index + 1}`}
                    className="mb-0.5"
                    onClick={() => setOptions((current) => current.filter((_, position) => position !== index))}
                  >
                    <XIcon size={18} />
                  </IconButton>
                ) : null}
              </div>
            ))}
            {options.length < pollOptionLimit ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => setOptions((current) => [...current, ""])}
              >
                <PlusIcon size={16} />
                Add option
              </Button>
            ) : null}
          </fieldset>
          <label className="flex min-h-11 items-center gap-3 text-md">
            <span className="flex-1">Allow multiple answers</span>
            <Toggle checked={multipleChoice} onChange={(event) => setMultipleChoice(event.target.checked)} />
          </label>
        </div>
        <footer className="flex justify-end gap-3 border-t border-line px-5 py-4">
          <Button variant="outline" shape="rounded" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" shape="rounded" disabled={pending} aria-busy={pending}>
            {pending ? <Spinner /> : null}
            Send poll
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
