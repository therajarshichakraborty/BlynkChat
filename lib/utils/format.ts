const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export function compactCount(value: number) {
  return value < 1000 ? String(value) : compact.format(value).toLowerCase();
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;
}
