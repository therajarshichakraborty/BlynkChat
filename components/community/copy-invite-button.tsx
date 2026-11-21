"use client";

import { UserPlusIcon } from "@/components/icons/user-plus-icon";
import { IconButton } from "@/components/ui/icon-button";
import { useToast } from "@/components/ui/toast";

type CopyInviteButtonProps = {
  name: string;
  path: string;
};

export function CopyInviteButton({ name, path }: CopyInviteButtonProps) {
  const { show } = useToast();
  return (
    <IconButton
      label={`Copy invite link to ${name}`}
      variant="outline"
      onClick={() =>
        navigator.clipboard.writeText(`${window.location.origin}${path}`).then(
          () => show("Invite link copied", "success"),
          () => show("Could not copy the link."),
        )
      }
    >
      <UserPlusIcon size={19} />
    </IconButton>
  );
}
