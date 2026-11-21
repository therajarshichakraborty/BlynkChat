import { HashIcon } from "@/components/icons/hash-icon";
import { MegaphoneIcon } from "@/components/icons/megaphone-icon";
import { VolumeIcon } from "@/components/icons/volume-icon";

export function RoomsPreview() {
  return (
    <ul aria-hidden="true" className="mt-auto flex flex-col gap-1 text-sm">
      <li className="flex h-9 items-center gap-2.5 rounded-md border border-line bg-surface px-3 font-medium">
        <HashIcon size={15} className="text-muted" />
        general
      </li>
      <li className="flex h-9 items-center gap-2.5 px-3 text-muted">
        <MegaphoneIcon size={15} />
        announcements
      </li>
      <li className="flex h-9 items-center gap-2.5 px-3 text-muted">
        <VolumeIcon size={15} />
        Lounge · 3 live
      </li>
    </ul>
  );
}
