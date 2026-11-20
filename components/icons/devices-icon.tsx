import { Icon, type IconProps } from "./icon";

export function DevicesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8M10 19v-3.96M7 19h5" />
      <rect width="6" height="10" x="16" y="12" rx="2" />
    </Icon>
  );
}
