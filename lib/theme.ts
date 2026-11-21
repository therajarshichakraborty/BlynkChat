export type ThemePreference = "light" | "dark" | "system";

const themeStorageKey = "relay-theme";

export const timeZoneCookie = "relay-tz";

export const themeScript = `(function(){var k="${themeStorageKey}";var d=document.documentElement;try{document.cookie="${timeZoneCookie}="+encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)+";path=/;max-age=31536000;samesite=lax";}catch(e){}try{var m=window.matchMedia("(prefers-color-scheme: dark)");var r=function(){var s=localStorage.getItem(k);d.dataset.theme=s==="light"||s==="dark"?s:m.matches?"dark":"light";};r();m.addEventListener("change",r);}catch(e){d.dataset.theme="light";}})();`;

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(themeStorageKey);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export function applyThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") {
      window.localStorage.removeItem(themeStorageKey);
    } else {
      window.localStorage.setItem(themeStorageKey, preference);
    }
  } catch {}
  document.documentElement.dataset.theme = preference === "system" ? systemTheme() : preference;
}
