import { Icon, type IconProps } from "./icon";

export function TimerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 2h4M12 14l3-3" />
      <circle cx="12" cy="14" r="8" />
    </Icon>
  );
}
