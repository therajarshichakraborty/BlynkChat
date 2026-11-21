import "server-only";
import type { AttachmentKind } from "@/prisma/generated/client";
import { allowedMimes, baseMime, maxUploadBytes, type UploadKind } from "@/lib/validation/uploads";
import type { AttachmentView } from "@/types/message";
import { db } from "../db";
import { invalid, notFound } from "../errors";
import { assertWithinLimit } from "../rate-limit";
import { saveFile } from "../storage";
import { toAttachment } from "../views/messages";

type UploadInput = {
  kind: UploadKind;
  name: string;
  mime: string;
  contents: Buffer;
  width?: number;
  height?: number;
  durationMs?: number;
  waveform?: number[];
};

const extensions: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/webm": "webm",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/json": "json",
  "application/zip": "zip",
};

function startsWith(contents: Buffer, signature: number[], offset = 0) {
  return signature.every((byte, index) => contents[offset + index] === byte);
}

function matchesSignature(mime: string, contents: Buffer) {
  switch (mime) {
    case "image/png":
      return startsWith(contents, [0x89, 0x50, 0x4e, 0x47]);
    case "image/jpeg":
      return startsWith(contents, [0xff, 0xd8, 0xff]);
    case "image/gif":
      return startsWith(contents, [0x47, 0x49, 0x46, 0x38]);
    case "image/webp":
      return startsWith(contents, [0x52, 0x49, 0x46, 0x46]) && startsWith(contents, [0x57, 0x45, 0x42, 0x50], 8);
    case "audio/webm":
      return startsWith(contents, [0x1a, 0x45, 0xdf, 0xa3]);
    case "application/pdf":
      return startsWith(contents, [0x25, 0x50, 0x44, 0x46]);
    case "application/zip":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return startsWith(contents, [0x50, 0x4b]);
    default:
      return true;
  }
}

function safeName(name: string, fallback: string) {
  const cleaned = name
    .replace(/[\\/\u0000-\u001f<>:"|?*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || fallback;
}

function kindFor(upload: UploadKind, mime: string): AttachmentKind {
  if (upload === "voice") return "VOICE";
  if (upload === "image" || mime.startsWith("image/")) return "IMAGE";
  return "FILE";
}

export async function createUpload(userId: string, input: UploadInput): Promise<AttachmentView> {
  assertWithinLimit("upload", userId);
  const mime = baseMime(input.mime);
  if (!allowedMimes(input.kind).includes(mime)) {
    throw invalid("That file type isn't supported. Try a photo, PDF, document or archive.");
  }
  if (input.contents.length === 0) throw invalid("That file is empty.");
  if (input.contents.length > maxUploadBytes) throw invalid("Files can be up to 10 MB.");
  if (!matchesSignature(mime, input.contents)) throw invalid("That file doesn't match its type.");

  const kind = kindFor(input.kind, mime);
  const extension = extensions[mime] ?? input.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) ?? "";
  const path = await saveFile(input.contents, extension);
  const row = await db.attachment.create({
    data: {
      uploaderId: userId,
      kind,
      mime,
      size: input.contents.length,
      name: safeName(input.name, kind === "VOICE" ? "Voice message.webm" : "file"),
      path,
      width: kind === "IMAGE" ? input.width : undefined,
      height: kind === "IMAGE" ? input.height : undefined,
      durationMs: kind === "VOICE" ? input.durationMs : undefined,
      waveform: kind === "VOICE" ? (input.waveform ?? []) : undefined,
    },
  });
  return toAttachment(row);
}

export async function authorizeFile(userId: string, attachmentId: string) {
  const attachment = await db.attachment.findUnique({
    where: { id: attachmentId },
    include: {
      message: { select: { conversationId: true, deletedAt: true, expiresAt: true } },
      story: { select: { authorId: true, expiresAt: true } },
    },
  });
  if (!attachment) throw notFound("That file could not be found.");

  if (attachment.message) {
    const { message } = attachment;
    if (message.deletedAt || (message.expiresAt && message.expiresAt < new Date())) {
      throw notFound("That file is no longer available.");
    }
    const member = await db.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: message.conversationId, userId } },
      select: { leftAt: true },
    });
    if (!member || member.leftAt) throw notFound("That file could not be found.");
    return attachment;
  }

  if (attachment.story) {
    const { story } = attachment;
    if (story.authorId === userId) return attachment;
    if (story.expiresAt < new Date()) throw notFound("That story has expired.");
    const shared = await db.conversation.count({
      where: {
        type: { in: ["DIRECT", "GROUP"] },
        AND: [
          { members: { some: { userId, leftAt: null } } },
          { members: { some: { userId: story.authorId, leftAt: null } } },
        ],
      },
    });
    const blocked = await db.block.count({
      where: {
        OR: [
          { blockerId: userId, blockedId: story.authorId },
          { blockerId: story.authorId, blockedId: userId },
        ],
      },
    });
    if (shared === 0 || blocked > 0) throw notFound("That file could not be found.");
    return attachment;
  }

  if (attachment.uploaderId === userId) return attachment;
  const url = `/api/files/${attachment.id}`;
  const [profiles, groups] = await Promise.all([
    db.user.count({ where: { image: url } }),
    db.conversation.count({ where: { image: url, members: { some: { userId, leftAt: null } } } }),
  ]);
  if (profiles + groups === 0) throw notFound("That file could not be found.");
  return attachment;
}
