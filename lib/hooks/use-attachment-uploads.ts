import { useEffect, useRef, useState } from "react";
import type { PendingUpload } from "@/components/chat/pending-uploads";
import { imageSize, uploadFile } from "@/lib/uploads-client";
import { maxUploadBytes, type UploadKind } from "@/lib/validation/uploads";

const maxAttachments = 10;

export function useAttachmentUploads(onError: (message: string) => void) {
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const previews = useRef(new Set<string>());

  useEffect(() => {
    const urls = previews.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  function update(localId: string, patch: Partial<PendingUpload>) {
    setUploads((current) => current.map((upload) => (upload.localId === localId ? { ...upload, ...patch } : upload)));
  }

  async function addOne(file: File, kind: UploadKind) {
    if (file.size > maxUploadBytes) {
      onError(`${file.name} is larger than 10 MB.`);
      return;
    }
    const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const image = file.type.startsWith("image/");
    const previewUrl = image ? URL.createObjectURL(file) : null;
    if (previewUrl) previews.current.add(previewUrl);
    setUploads((current) => [
      ...current,
      { localId, name: file.name, size: file.size, previewUrl, status: "uploading", attachment: null },
    ]);
    const meta = image ? await imageSize(file) : {};
    const result = await uploadFile(file, image && kind === "file" ? "image" : kind, meta);
    if (result.ok) update(localId, { status: "ready", attachment: result.data });
    else {
      update(localId, { status: "error" });
      onError(result.error.message);
    }
  }

  function add(files: FileList | File[], kind: UploadKind) {
    const list = [...files].slice(0, Math.max(0, maxAttachments - uploads.length));
    if (list.length < files.length) onError(`You can attach up to ${maxAttachments} files at a time.`);
    for (const file of list) void addOne(file, kind);
  }

  function remove(localId: string) {
    setUploads((current) => {
      const target = current.find((upload) => upload.localId === localId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
        previews.current.delete(target.previewUrl);
      }
      return current.filter((upload) => upload.localId !== localId);
    });
  }

  function clear() {
    for (const upload of uploads) if (upload.previewUrl) URL.revokeObjectURL(upload.previewUrl);
    previews.current.clear();
    setUploads([]);
  }

  const ready = uploads.flatMap((upload) => (upload.status === "ready" && upload.attachment ? [upload.attachment] : []));
  const uploading = uploads.some((upload) => upload.status === "uploading");

  return { uploads, ready, uploading, add, remove, clear };
}
