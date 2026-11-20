"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ModalProps = {
  labelledBy: string;
  children: ReactNode;
  className?: string;
};

export function Modal({ labelledBy, children, className }: ModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      router.back();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        router.back();
      }}
      onClick={handleBackdropClick}
      className={cn(
        "m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-200 overflow-hidden rounded-[24px] border border-line bg-card p-0 text-fg shadow-lg backdrop:bg-overlay backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </dialog>
  );
}
