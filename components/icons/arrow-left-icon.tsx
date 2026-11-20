import { Icon, type IconProps } from "./icon";

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 19-7-7 7-7M19 12H5" />
    </Icon>
  );
}
