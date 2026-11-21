const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type LoginValues = {
  email: string;
  password: string;
};

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function isEmail(value: string) {
  return emailPattern.test(value.trim());
}

function validateEmail(value: string) {
  if (!value.trim()) return "Enter your email address.";
  if (!isEmail(value)) return "Enter a valid email address.";
  return undefined;
}

function validatePassword(value: string) {
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

export type SignupValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function validateUsername(value: string) {
  if (value.length < 3 || value.length > 20) return "Use 3 to 20 characters.";
  if (!/^[a-z0-9_]+$/.test(value)) return "Use lowercase letters, numbers and underscores only.";
  return undefined;
}

export function validateSignup(values: SignupValues): FieldErrors<SignupValues> {
  const errors: FieldErrors<SignupValues> = {};
  const username = validateUsername(values.username);
  const email = validateEmail(values.email);
  const password = validatePassword(values.password);
  if (username) errors.username = username;
  if (email) errors.email = email;
  if (password) errors.password = password;
  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function hasErrors<T>(errors: FieldErrors<T>) {
  return Object.values(errors).some(Boolean);
}
