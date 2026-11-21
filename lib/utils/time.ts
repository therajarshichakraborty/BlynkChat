const dayKeyFormatters = new Map<string, Intl.DateTimeFormat>();

function dayKeyFormatter(timeZone: string) {
  let formatter = dayKeyFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    dayKeyFormatters.set(timeZone, formatter);
  }
  return formatter;
}

export function dayKey(iso: string | Date, timeZone: string) {
  return dayKeyFormatter(timeZone).format(new Date(iso));
}

function daysBetween(fromKey: string, toKey: string) {
  return Math.round((Date.parse(toKey) - Date.parse(fromKey)) / 86_400_000);
}

export function clockLabel(iso: string | Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(iso),
  );
}

export function listTimestamp(iso: string, timeZone: string, now = new Date()) {
  const diff = daysBetween(dayKey(iso, timeZone), dayKey(now, timeZone));
  if (diff <= 0) return clockLabel(iso, timeZone);
  if (diff === 1) return "Yesterday";
  if (diff < 7) return new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short" }).format(new Date(iso));
  return new Intl.DateTimeFormat("en-GB", { timeZone, day: "2-digit", month: "2-digit", year: "2-digit" }).format(
    new Date(iso),
  );
}

export function dayLabel(iso: string, timeZone: string, now = new Date()) {
  const diff = daysBetween(dayKey(iso, timeZone), dayKey(now, timeZone));
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long" }).format(new Date(iso));
  return new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

export function lastSeenLabel(iso: string, timeZone: string, now = new Date()) {
  const diff = daysBetween(dayKey(iso, timeZone), dayKey(now, timeZone));
  const time = clockLabel(iso, timeZone);
  if (diff <= 0) return `last seen today at ${time}`;
  if (diff === 1) return `last seen yesterday at ${time}`;
  return `last seen ${dayLabel(iso, timeZone, now).toLowerCase()}`;
}

export function relativeAgo(iso: string, now = new Date()) {
  const minutes = Math.max(0, Math.round((now.getTime() - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
