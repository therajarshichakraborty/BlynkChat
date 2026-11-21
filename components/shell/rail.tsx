import Link from "next/link";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { HashIcon } from "@/components/icons/hash-icon";
import { MessageCircleIcon } from "@/components/icons/message-circle-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { StarIcon } from "@/components/icons/star-icon";
import { Avatar } from "@/components/ui/avatar";
import { LogoMark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getUnreadTotal } from "@/lib/data/chats";
import { getCurrentUser } from "@/lib/data/users";
import { roomHref } from "@/lib/utils/community-links";
import { NavLink } from "./nav-link";

export function Rail() {
  const user = getCurrentUser();

  return (
    <nav
      aria-label="App"
      className="flex w-18 shrink-0 flex-col items-center gap-2 border-r border-line bg-surface py-4 max-md:hidden"
    >
      <Link href="/" aria-label="Relay home" className="mb-4 rounded-lg">
        <LogoMark />
      </Link>
      <NavLink href="/chats" match="/chats" label="Chats" variant="rail" badge={getUnreadTotal()}>
        <MessageCircleIcon size={22} />
      </NavLink>
      <NavLink
        href={roomHref("design-engineers")}
        match="/communities/design-engineers"
        label="Rooms"
        variant="rail"
      >
        <HashIcon size={22} />
      </NavLink>
      <NavLink href="/communities" match="/communities" label="Communities" variant="rail" exact>
        <GlobeIcon size={22} />
      </NavLink>
      <span
        role="img"
        aria-label="Calls, coming soon"
        title="Calls coming soon"
        className="inline-grid size-11 place-items-center rounded-lg text-faint"
      >
        <PhoneIcon size={22} />
      </span>
      <NavLink href="/chats?filter=starred" match="/starred" label="Starred" variant="rail">
        <StarIcon size={22} />
      </NavLink>
      <div className="mt-auto flex flex-col items-center gap-2">
        <ThemeToggle className="size-11" />
        <span className="mt-1 rounded-full" title={user.name}>
          <Avatar initials={user.initials} tone={user.tone} size="md" online label={user.name} />
        </span>
      </div>
    </nav>
  );
}
