const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type LoginValues = {
  email: string;
  password: string;
};

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function isEmail(value: string) {
  return emailPattern.test(value.trim());
}

export function validateEmail(value: string) {
  if (!value.trim()) return "Enter your email address.";
  if (!isEmail(value)) return "Enter a valid email address.";
  return undefined;
}

export function validatePassword(value: string) {
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/i.test(value) || !/\d/.test(value)) return "Include at least one letter and one number.";
  return undefined;
}

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  if (!values.password) errors.password = "Enter your password.";
  return errors;
}

export function hasErrors<T>(errors: FieldErrors<T>) {
  return Object.values(errors).some(Boolean);
}
