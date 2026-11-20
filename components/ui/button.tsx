import type { ButtonHTMLAttributes } from "react";
import {
  buttonClasses,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  block?: boolean;
};

export function Button({
  variant,
  size,
  shape,
  block,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, shape, block, className })}
      {...props}
    />
  );
}
