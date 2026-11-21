import { Icon, type IconProps } from "./icon";

export function SquareIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect width="14" height="14" x="5" y="5" rx="3" />
    </Icon>
  );
}
