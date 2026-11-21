import Link from "next/link";
import { SearchIcon } from "@/components/icons/search-icon";
import { Kbd } from "@/components/ui/kbd";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavLinks } from "./nav-links";
import { NavActions } from "./nav-actions";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-page items-center gap-8 px-4 md:px-8">
        <Logo />
        <NavLinks />
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <form action="/communities" role="search" className="max-lg:hidden">
            <label className="flex h-9 w-56 items-center gap-2 rounded-full border border-line bg-surface/80 px-3 text-muted transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:ring-4 focus-within:ring-ring">
              <SearchIcon size={16} />
              <span className="sr-only">Search communities</span>
              <input
                type="search"
                name="q"
                placeholder="Search"
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-fg outline-none"
              />
              <Kbd>⌘K</Kbd>
            </label>
          </form>
          <ThemeToggle />
          <NavActions />
        </div>
      </div>
      <Link href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </Link>
    </header>
  );
}
