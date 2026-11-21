import { ServiceError } from "@/lib/server/errors";
import { authorizeFile } from "@/lib/server/services/attachments";
import { getSessionUser } from "@/lib/server/session";
import { fileSize, readStream } from "@/lib/server/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const inlineTypes = /^(image\/(png|jpeg|webp|gif)|audio\/(webm|wav|ogg|mpeg))$/;

function parseRange(header: string | null, size: number) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return "invalid" as const;
  const [, rawStart = "", rawEnd = ""] = match;
  if (!rawStart && !rawEnd) return "invalid" as const;
  let start: number;
  let end: number;
  if (!rawStart) {
    start = Math.max(0, size - Number(rawEnd));
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd ? Math.min(Number(rawEnd), size - 1) : size - 1;
  }
  if (start > end || start >= size) return "invalid" as const;
  return { start, end };
}

function contentDisposition(name: string, inline: boolean) {
  const ascii = name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'");
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await context.params;
  let attachment;
  try {
    attachment = await authorizeFile(user.id, id);
  } catch (error) {
    if (error instanceof ServiceError) return new Response("Not found", { status: 404 });
    throw error;
  }

  const size = await fileSize(attachment.path);
  if (size === null) return new Response("Not found", { status: 404 });

  const download = new URL(request.url).searchParams.has("download");
  const inline = !download && inlineTypes.test(attachment.mime);
  const headers = new Headers({
    "Content-Type": attachment.mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
    "Content-Disposition": contentDisposition(attachment.name, inline),
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  });

  const range = parseRange(request.headers.get("range"), size);
  if (range === "invalid") {
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  if (range) {
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${size}`);
    headers.set("Content-Length", String(range.end - range.start + 1));
    return new Response(readStream(attachment.path, range), { status: 206, headers });
  }

  headers.set("Content-Length", String(size));
  return new Response(readStream(attachment.path), { status: 200, headers });
}
