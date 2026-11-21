import type { UploadKind } from "@/lib/validation/uploads";
import type { ActionResult } from "@/types/action";
import type { AttachmentView } from "@/types/message";

type UploadMeta = {
  width?: number;
  height?: number;
  durationMs?: number;
  waveform?: number[];
};

function isResult(value: unknown): value is ActionResult<AttachmentView> {
  return typeof value === "object" && value !== null && "ok" in value;
}

export async function imageSize(file: Blob) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return {};
  }
}

export async function uploadFile(file: File, kind: UploadKind, meta: UploadMeta = {}): Promise<ActionResult<AttachmentView>> {
  const form = new FormData();
  form.set("file", file);
  form.set("kind", kind);
  if (meta.width) form.set("width", String(meta.width));
  if (meta.height) form.set("height", String(meta.height));
  if (meta.durationMs !== undefined) form.set("durationMs", String(Math.round(meta.durationMs)));
  if (meta.waveform) form.set("waveform", JSON.stringify(meta.waveform));
  try {
    const response = await fetch("/api/uploads", { method: "POST", body: form });
    const body: unknown = await response.json().catch(() => null);
    if (isResult(body)) return body;
    return { ok: false, error: { code: "INTERNAL", message: "The upload failed. Try again." } };
  } catch {
    return { ok: false, error: { code: "INTERNAL", message: "You appear to be offline. Try again." } };
  }
}
