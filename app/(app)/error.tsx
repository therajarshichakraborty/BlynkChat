"use client";

import { AlertCircleIcon } from "@/components/icons/alert-circle-icon";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type AppErrorProps = {
  reset: () => void;
};

export default function AppError({ reset }: AppErrorProps) {
  return (
    <main id="main" className="grid flex-1 place-items-center">
      <EmptyState
        icon={<AlertCircleIcon size={24} />}
        title="Something went wrong"
        description="This view could not be loaded. Your messages are safe. Try again in a moment."
      >
        <Button onClick={reset}>Try again</Button>
      </EmptyState>
    </main>
  );
}
