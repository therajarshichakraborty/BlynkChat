import type { Metadata } from "next";
import { SearchIcon } from "@/components/icons/search-icon";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-page items-center px-4 md:px-8">
        <Logo />
      </header>
      <main id="main" className="grid flex-1 place-items-center px-4">
        <EmptyState
          icon={<SearchIcon size={24} />}
          title="Page not found"
          description="The page you are looking for moved or never existed."
        >
          <ButtonLink href="/">Go home</ButtonLink>
        </EmptyState>
      </main>
    </div>
  );
}
