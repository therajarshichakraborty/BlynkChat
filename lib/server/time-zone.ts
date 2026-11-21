import "server-only";
import { cookies } from "next/headers";
import { timeZoneCookie } from "@/lib/theme";

function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export async function getTimeZone() {
  const value = (await cookies()).get(timeZoneCookie)?.value;
  return value && isValidTimeZone(value) ? value : "UTC";
}
