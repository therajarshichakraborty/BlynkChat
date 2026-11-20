import { Icon, type IconProps } from "./icon";

export function PauseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </Icon>
  );
}
