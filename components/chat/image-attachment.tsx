import Image from "next/image";
import type { AttachmentView } from "@/types/message";

type ImageAttachmentProps = {
  image: AttachmentView;
};

export function ImageAttachment({ image }: ImageAttachmentProps) {
  return (
    <a href={image.url} target="_blank" rel="noreferrer" className="block w-64 max-w-full overflow-hidden rounded-lg">
      <Image
        src={image.url}
        alt={image.name}
        width={image.width ?? 512}
        height={image.height ?? 384}
        unoptimized
        className="aspect-4/3 h-auto w-full bg-surface object-cover"
      />
    </a>
  );
}
