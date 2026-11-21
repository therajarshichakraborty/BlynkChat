"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateCommunityDialog } from "./create-community-dialog";

type CreateCommunityButtonProps = {
  className?: string;
};

export function CreateCommunityButton({ className = "mt-4 h-9" }: CreateCommunityButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="dark" size="sm" className={className} onClick={() => setOpen(true)}>
        Create community
      </Button>
      {open ? <CreateCommunityDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
