import { ServiceError } from "@/lib/server/errors";
import { createUpload } from "@/lib/server/services/attachments";
import { getSessionUser } from "@/lib/server/session";
import { maxUploadBytes, uploadMetaSchema } from "@/lib/validation/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function failure(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

function parseWaveform(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function optional(value: FormDataEntryValue | null) {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return failure(401, "UNAUTHORIZED", "Your session has ended. Log in again.");

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxUploadBytes + 64 * 1024) return failure(413, "VALIDATION", "Files can be up to 10 MB.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return failure(400, "VALIDATION", "We could not read that upload. Try again.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return failure(400, "VALIDATION", "Choose a file to upload.");
  if (file.size > maxUploadBytes) return failure(413, "VALIDATION", "Files can be up to 10 MB.");

  const meta = uploadMetaSchema.safeParse({
    kind: form.get("kind"),
    width: optional(form.get("width")),
    height: optional(form.get("height")),
    durationMs: optional(form.get("durationMs")),
    waveform: parseWaveform(form.get("waveform")),
  });
  if (!meta.success) return failure(400, "VALIDATION", meta.error.issues[0]?.message ?? "Invalid upload.");

  try {
    const attachment = await createUpload(user.id, {
      ...meta.data,
      name: file.name,
      mime: file.type,
      contents: Buffer.from(await file.arrayBuffer()),
    });
    return Response.json({ ok: true, data: attachment });
  } catch (error) {
    if (error instanceof ServiceError) {
      return failure(error.code === "RATE_LIMITED" ? 429 : 400, error.code, error.message);
    }
    console.error("[relay:uploads]", error);
    return failure(500, "INTERNAL", "The upload failed. Try again.");
  }
}
