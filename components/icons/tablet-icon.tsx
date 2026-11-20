import { Icon, type IconProps } from "./icon";

export function TabletIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M12 18h.01" />
    </Icon>
  );
}
