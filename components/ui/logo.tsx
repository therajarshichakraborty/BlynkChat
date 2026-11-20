import Link from "next/link";
import { ZapIcon } from "@/components/icons/zap-icon";
import { cn } from "@/lib/utils/cn";

type LogoMarkProps = {
  size?: "sm" | "md";
  className?: string;
};

export function LogoMark({ size = "md", className }: LogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid shrink-0 place-items-center bg-linear-to-b from-[#4d8bff] to-[#2463eb] text-white shadow-accent",
        size === "md" ? "size-10 rounded-lg" : "size-8 rounded-md",
        className,
      )}
    >
      <ZapIcon size={size === "md" ? 20 : 16} />
    </span>
  );
}

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Relay home"
      className={cn("inline-flex items-center gap-2.5 rounded-md", className)}
    >
      <LogoMark size="sm" />
      <span className="text-xl font-semibold tracking-tight">Relay</span>
    </Link>
  );
}
