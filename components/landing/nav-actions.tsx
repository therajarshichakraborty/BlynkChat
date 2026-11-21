import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon";
import { ButtonLink } from "@/components/ui/button-link";

export function NavActions() {
  return (
    <>
      <Link
        href="/login"
        className="rounded-full px-3 py-2 text-base font-medium text-fg transition-colors duration-150 hover:bg-raised max-sm:hidden"
      >
        Log in
      </Link>
      <ButtonLink href="/signup" variant="dark" size="sm" className="h-9 px-4">
        Get started
        <ArrowRightIcon size={16} />
      </ButtonLink>
    </>
  );
}
