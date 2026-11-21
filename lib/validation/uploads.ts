import { z } from "zod";

export const maxUploadBytes = 10 * 1024 * 1024;

export const imageMimes = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

export const voiceMimes = ["audio/webm"] as const;

export const fileMimes = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ...imageMimes,
] as const;

export const fileAccept = fileMimes.join(",");
export const imageAccept = imageMimes.join(",");

export const uploadKindSchema = z.enum(["image", "file", "voice"]);

export type UploadKind = z.infer<typeof uploadKindSchema>;

export const uploadMetaSchema = z.object({
  kind: uploadKindSchema,
  width: z.coerce.number().int().min(1).max(20000).optional(),
  height: z.coerce.number().int().min(1).max(20000).optional(),
  durationMs: z.coerce.number().int().min(0).max(30 * 60 * 1000).optional(),
  waveform: z.array(z.number().min(0).max(32)).max(64).optional(),
});

export function baseMime(mime: string) {
  return mime.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function allowedMimes(kind: UploadKind): readonly string[] {
  if (kind === "image") return imageMimes;
  if (kind === "voice") return voiceMimes;
  return fileMimes;
}
