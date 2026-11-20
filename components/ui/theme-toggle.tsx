"use client";

import { MoonIcon } from "@/components/icons/moon-icon";
import { SunIcon } from "@/components/icons/sun-icon";
import { applyThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils/cn";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  function toggle() {
    const current = document.documentElement.dataset.theme;
    applyThemePreference(current === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={cn(
        "inline-grid size-10 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-fg",
        className,
      )}
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </button>
  );
}
