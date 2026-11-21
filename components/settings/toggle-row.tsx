import { Toggle } from "@/components/ui/toggle";

type ToggleRowProps = {
  label: string;
  description: string;
  defaultChecked?: boolean;
};

export function ToggleRow({ label, description, defaultChecked = false }: ToggleRowProps) {
  return (
    <li className="border-b border-line last:border-b-0">
      <label className="flex min-h-16 cursor-pointer items-center gap-4 py-3">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-md font-medium">{label}</span>
          <span className="text-sm text-muted">{description}</span>
        </span>
        <Toggle defaultChecked={defaultChecked} />
      </label>
    </li>
  );
}
