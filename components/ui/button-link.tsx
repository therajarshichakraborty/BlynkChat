import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  buttonClasses,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

type ButtonLinkProps = {
  href: Route;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  block?: boolean;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant,
  size,
  shape,
  block,
  className,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, shape, block, className })}>
      {children}
    </Link>
  );
}
