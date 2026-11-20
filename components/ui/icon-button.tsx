import type { ButtonHTMLAttributes } from "react";
import {
  iconButtonClasses,
  type IconButtonSize,
  type IconButtonVariant,
} from "./icon-button-styles";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

export function IconButton({
  label,
  variant,
  size,
  className,
  type = "button",
  title,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      className={iconButtonClasses(variant, size, className)}
      {...props}
    />
  );
}
