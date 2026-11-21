import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { toneGradient } from "@/lib/utils/tone";
import type { Tone } from "@/types/tone";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type AvatarProps = {
  initials: string;
  tone: Tone;
  image?: string | null;
  size?: AvatarSize;
  shape?: "circle" | "square";
  online?: boolean;
  ring?: boolean;
  label?: string;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  xs: "size-5 text-[8px]",
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-11 text-md",
  xl: "size-14 text-lg",
  "2xl": "size-22 text-3xl",
};

const pixelSizes: Record<AvatarSize, number> = { xs: 20, sm: 28, md: 36, lg: 44, xl: 56, "2xl": 88 };

const squareRadius: Record<AvatarSize, string> = {
  xs: "rounded-[5px]",
  sm: "rounded-xs",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-[24px]",
};

const dotClasses: Record<AvatarSize, string> = {
  xs: "size-1.5 border",
  sm: "size-2 border-[1.5px]",
  md: "size-2.5 border-2",
  lg: "size-3 border-2",
  xl: "size-3.5 border-2",
  "2xl": "size-5 border-[3px]",
};

export function Avatar({
  initials,
  tone,
  image,
  size = "md",
  shape = "circle",
  online = false,
  ring = false,
  label,
  className,
}: AvatarProps) {
  const shapeClass = shape === "circle" ? "rounded-full" : squareRadius[size];
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          unoptimized
          className={cn("object-cover", sizeClasses[size], shapeClass, ring && "ring-2 ring-bg")}
        />
      ) : (
        <span
          className={cn(
            "inline-grid place-items-center font-semibold tracking-tight text-white select-none",
            toneGradient(tone),
            sizeClasses[size],
            shapeClass,
            ring && "ring-2 ring-bg",
          )}
        >
          {initials}
        </span>
      )}
      {online ? (
        <span
          className={cn(
            "absolute right-0 bottom-0 rounded-full border-bg bg-success",
            dotClasses[size],
          )}
        />
      ) : null}
    </span>
  );
}
