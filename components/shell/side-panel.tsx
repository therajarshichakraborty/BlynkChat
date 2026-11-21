"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { PanelRightIcon } from "@/components/icons/panel-right-icon";
import { XIcon } from "@/components/icons/x-icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils/cn";

type PanelState = {
  open: boolean;
  overlay: boolean;
  toggle: () => void;
  closeOverlay: () => void;
};

const PanelContext = createContext<PanelState>({
  open: true,
  overlay: false,
  toggle: () => undefined,
  closeOverlay: () => undefined,
});

const wideQuery = "(min-width: 80rem)";

export function SidePanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [overlay, setOverlay] = useState(false);

  function toggle() {
    if (window.matchMedia(wideQuery).matches) setOpen((value) => !value);
    else setOverlay((value) => !value);
  }

  return (
    <PanelContext value={{ open, overlay, toggle, closeOverlay: () => setOverlay(false) }}>{children}</PanelContext>
  );
}

type SidePanelToggleProps = {
  label: string;
  children?: ReactNode;
};

export function SidePanelToggle({ label, children }: SidePanelToggleProps) {
  const { open, overlay, toggle } = use(PanelContext);
  return (
    <IconButton
      label={`Show or hide ${label}`}
      aria-expanded={open || overlay}
      aria-controls="side-panel"
      onClick={toggle}
      className={cn(open && "xl:text-fg", overlay && "max-xl:text-fg")}
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
  const { open, overlay, closeOverlay } = use(PanelContext);

  useEffect(() => {
    if (!overlay) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeOverlay();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [overlay, closeOverlay]);

  return (
    <>
      {overlay ? (
        <button
          type="button"
          aria-label={`Close ${label}`}
          onClick={closeOverlay}
          className="fixed inset-0 z-30 bg-overlay backdrop-blur-sm xl:hidden"
        />
      ) : null}
      <aside
        id="side-panel"
        aria-label={label}
        className={cn(
          "shrink-0 overflow-y-auto border-l border-line bg-bg",
          open ? "xl:block xl:w-85" : "xl:hidden",
          overlay
            ? "max-xl:fixed max-xl:inset-y-0 max-xl:right-0 max-xl:z-40 max-xl:w-full max-xl:max-w-sm max-xl:shadow-lg"
            : "max-xl:hidden",
        )}
      >
        {overlay ? (
          <div className="sticky top-0 z-10 flex justify-end bg-bg/80 p-2 backdrop-blur-xl xl:hidden">
            <IconButton label={`Close ${label}`} onClick={closeOverlay}>
              <XIcon size={20} />
            </IconButton>
          </div>
        ) : null}
        {children}
      </aside>
    </>
  );
}
