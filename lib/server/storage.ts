import "server-only";
import { randomBytes } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { env } from "./env";

const root = path.resolve(env.STORAGE_DIR);

export function resolveStoragePath(relative: string) {
  const absolute = path.resolve(root, relative);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error("Refusing to access a path outside the storage directory.");
  }
  return absolute;
}

export async function saveFile(contents: Buffer, extension: string) {
  const now = new Date();
  const folder = path.posix.join(String(now.getUTCFullYear()), String(now.getUTCMonth() + 1).padStart(2, "0"));
  const name = `${randomBytes(16).toString("hex")}${extension ? `.${extension}` : ""}`;
  const relative = path.posix.join(folder, name);
  await mkdir(resolveStoragePath(folder), { recursive: true });
  await writeFile(resolveStoragePath(relative), contents, { flag: "wx" });
  return relative;
}

export async function removeFile(relative: string) {
  await unlink(resolveStoragePath(relative)).catch(() => undefined);
}

export async function fileSize(relative: string) {
  try {
    return (await stat(resolveStoragePath(relative))).size;
  } catch {
    return null;
  }
}

export function readStream(relative: string, range?: { start: number; end: number }) {
  const stream = createReadStream(resolveStoragePath(relative), range);
  return Readable.toWeb(stream) as ReadableStream<Uint8Array>;
}
