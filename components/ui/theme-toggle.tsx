"use client";

import { MoonIcon } from "@/components/icons/moon-icon";
import { SunIcon } from "@/components/icons/sun-icon";
import { applyThemePreference } from "@/lib/theme";
import styles from "./theme-toggle.module.css";

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
      className={className ? `${styles.toggle} ${className}` : styles.toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
    >
      <SunIcon className={styles.sun} />
      <MoonIcon className={styles.moon} />
    </button>
  );
}
