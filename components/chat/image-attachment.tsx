import { toneGradient } from "@/lib/utils/tone";
import { cn } from "@/lib/utils/cn";
import type { ImageAttachment as ImageAttachmentData } from "@/types/chat";

type ImageAttachmentProps = {
  image: ImageAttachmentData;
};

export function ImageAttachment({ image }: ImageAttachmentProps) {
  return (
    <span
      role="img"
      aria-label={image.alt}
      className={cn("block aspect-4/3 w-64 max-w-full rounded-lg", toneGradient(image.tone))}
    />
  );
}
