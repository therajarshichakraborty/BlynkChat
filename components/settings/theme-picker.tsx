"use client";

import { useSyncExternalStore } from "react";
import { DevicesIcon } from "@/components/icons/devices-icon";
import { MoonIcon } from "@/components/icons/moon-icon";
import { SunIcon } from "@/components/icons/sun-icon";
import { applyThemePreference, readThemePreference, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils/cn";

const options: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: DevicesIcon },
];

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    listeners.delete(listener);
    observer.disconnect();
  };
}

function choose(preference: ThemePreference) {
  applyThemePreference(preference);
  listeners.forEach((listener) => listener());
}

export function ThemePicker() {
  const current = useSyncExternalStore<ThemePreference>(
    subscribe,
    readThemePreference,
    () => "system",
  );

  return (
    <fieldset className="py-4">
      <legend className="sr-only">Theme</legend>
      <div className="grid grid-cols-3 gap-3">
        {options.map(({ value, label, icon: OptionIcon }) => {
          const checked = current === value;
          return (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-lg border px-3 py-4 text-md font-medium transition-colors duration-150 has-focus-visible:ring-4 has-focus-visible:ring-ring",
                checked ? "border-accent bg-accent-soft text-accent-text" : "border-line text-muted hover:bg-surface hover:text-fg",
              )}
            >
              <input
                type="radio"
                name="theme"
                value={value}
                checked={checked}
                onChange={() => choose(value)}
                className="sr-only"
              />
              <OptionIcon size={22} />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
