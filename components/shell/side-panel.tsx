"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { PanelRightIcon } from "@/components/icons/panel-right-icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils/cn";

type PanelState = {
  open: boolean;
  toggle: () => void;
};

const PanelContext = createContext<PanelState>({ open: true, toggle: () => undefined });

export function SidePanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <PanelContext value={{ open, toggle: () => setOpen((value) => !value) }}>{children}</PanelContext>
  );
}

type SidePanelToggleProps = {
  label: string;
  children?: ReactNode;
};

export function SidePanelToggle({ label, children }: SidePanelToggleProps) {
  const { open, toggle } = use(PanelContext);
  return (
    <IconButton
      label={open ? `Hide ${label}` : `Show ${label}`}
      aria-expanded={open}
      aria-controls="side-panel"
      onClick={toggle}
      className={cn("max-xl:hidden", open && "text-fg")}
    >
      {children ?? <PanelRightIcon size={20} />}
    </IconButton>
  );
}

type SidePanelProps = {
  label: string;
  children: ReactNode;
};

export function SidePanel({ label, children }: SidePanelProps) {
  const { open } = use(PanelContext);
  return (
    <aside
      id="side-panel"
      aria-label={label}
      hidden={!open}
      className="w-85 shrink-0 overflow-y-auto border-l border-line bg-bg max-xl:hidden"
    >
      {children}
    </aside>
  );
}
