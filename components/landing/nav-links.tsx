import Link from "next/link";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#security", label: "Security" },
  { href: "/#video", label: "Video" },
  { href: "/#about", label: "About" },
] as const;

export function NavLinks() {
  return (
    <nav aria-label="Primary" className="max-md:hidden">
      <ul className="flex items-center gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="rounded-full px-3 py-2 text-base font-medium text-muted transition-colors duration-150 hover:text-fg"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
