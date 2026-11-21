import { Icon, type IconProps } from "./icon";

export function BanIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m4.9 4.9 14.2 14.2" />
    </Icon>
  );
}
