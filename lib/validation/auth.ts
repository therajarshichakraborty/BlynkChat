import { z } from "zod";

export const usernameRules = { min: 3, max: 20, pattern: /^[a-z0-9_]+$/ };

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(usernameRules.min, "Use 3 to 20 characters.")
  .max(usernameRules.max, "Use 3 to 20 characters.")
  .regex(usernameRules.pattern, "Use lowercase letters, numbers and underscores only.");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .pipe(z.email("Enter a valid email address."));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use at most 128 characters.")
  .regex(/[a-z]/i, "Include at least one letter and one number.")
  .regex(/\d/, "Include at least one letter and one number.");

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username."),
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginValues = z.input<typeof loginSchema>;
export type SignupValues = z.input<typeof signupSchema>;

export function isEmail(value: string) {
  return emailSchema.safeParse(value).success;
}
