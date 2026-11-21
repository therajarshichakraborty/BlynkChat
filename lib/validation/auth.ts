const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string) {
  return emailPattern.test(value.trim());
}
