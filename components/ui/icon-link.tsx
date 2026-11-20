import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  iconButtonClasses,
  type IconButtonSize,
  type IconButtonVariant,
} from "./icon-button-styles";

type IconLinkProps = {
  href: Route;
  label: string;
  children: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
};

export function IconLink({ href, label, children, variant, size, className }: IconLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={iconButtonClasses(variant, size, className)}
    >
      {children}
    </Link>
  );
}
