import bcrypt from "bcrypt";

const SALT_ROUNDS = 20;

export async function hashPassword(userGivenPassword: string): Promise<string> {
  return await bcrypt.hash(userGivenPassword, SALT_ROUNDS);
}

export async function compareGivenPasswordWithHashedPassword(
  userGivenPassword: string,
  userHashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(userGivenPassword, userHashedPassword);
}

export const hashValue = hashPassword;
export const compareValue = compareGivenPasswordWithHashedPassword;
