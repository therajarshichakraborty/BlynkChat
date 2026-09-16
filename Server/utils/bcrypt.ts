import bcrypt from "bcryptjs";

const SALT_ROUNDS = 20;

export async function hashPassword(userPassword: string): Promise<string> {
  return bcrypt.hash(userPassword, SALT_ROUNDS);
}

export async function comparePassword(
  userPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(userPassword, hashedPassword);
}

export const hashValue = hashPassword;
export const compareValue = comparePassword;
