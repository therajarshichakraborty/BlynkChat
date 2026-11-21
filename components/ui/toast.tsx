"use client";

import { createContext, use, useCallback, useEffect, useState, type ReactNode } from "react";
import { AlertCircleIcon } from "@/components/icons/alert-circle-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { XIcon } from "@/components/icons/x-icon";
import { cn } from "@/lib/utils/cn";

type ToastTone = "error" | "success";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  show: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue>({ show: () => undefined });

let nextToastId = 1;

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), 5000);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <li
      role={item.tone === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex items-center gap-2.5 rounded-lg border bg-card py-2.5 pr-2 pl-3.5 text-sm shadow-lg",
        item.tone === "error" ? "border-danger/30 text-danger-text" : "border-line text-success-text",
      )}
    >
      {item.tone === "error" ? <AlertCircleIcon size={16} /> : <CheckIcon size={16} />}
      <span className="min-w-0 flex-1 text-fg">{item.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss"
        className="inline-grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-raised hover:text-fg"
      >
        <XIcon size={14} />
      </button>
    </li>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const show = useCallback((message: string, tone: ToastTone = "error") => {
    const id = nextToastId++;
    setItems((current) => [...current.filter((item) => item.message !== message), { id, message, tone }].slice(-3));
  }, []);

  return (
    <ToastContext value={{ show }}>
      {children}
      <ol
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 mx-auto flex w-full max-w-sm flex-col gap-2 px-4 md:bottom-6"
      >
        {items.map((item) => (
          <Toast key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </ol>
    </ToastContext>
  );
}

export function useToast() {
  return use(ToastContext);
}
