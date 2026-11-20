import { Icon, type IconProps } from "./icon";

export function HashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </Icon>
  );
}
