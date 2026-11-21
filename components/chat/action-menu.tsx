"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type MenuItem = {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onSelect: () => void;
};

type ActionMenuProps = {
  label: string;
  icon: ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  placement?: "top" | "bottom";
  buttonClassName?: string;
  className?: string;
};

export function ActionMenu({
  label,
  icon,
  items,
  align = "end",
  placement = "bottom",
  buttonClassName,
  className,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-grid size-8 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-fg",
          buttonClassName,
        )}
      >
        {icon}
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          className={cn(
            "absolute z-30 min-w-48 rounded-lg border border-line bg-card p-1 shadow-lg",
            placement === "bottom" ? "top-full mt-1" : "bottom-full mb-1",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-base transition-colors duration-150 hover:bg-surface",
                  item.danger ? "text-danger-text" : "text-fg",
                )}
              >
                {item.icon ? <span className="text-muted">{item.icon}</span> : null}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
