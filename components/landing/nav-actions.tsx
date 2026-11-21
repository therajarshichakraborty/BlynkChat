import { ArrowRightIcon } from "@/components/icons/arrow-right-icon";
import { ButtonLink } from "@/components/ui/button-link";

export function NavActions() {
  return (
    <ButtonLink href="/#features" variant="dark" size="sm" className="h-9 px-4">
      Get started
      <ArrowRightIcon size={16} />
    </ButtonLink>
  );
}
