import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#security", label: "Security" },
      { href: "/#video", label: "Video calls" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#about", label: "About" },
      { href: "/#sync", label: "Platforms" },
      { href: "/#communities", label: "Communities" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-page flex-col gap-10 px-4 py-12 md:flex-row md:justify-between md:px-8">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo />
          <p className="text-sm text-muted">
            Real-time chats, groups and communities. Private by default, fast everywhere.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:gap-16">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold">{column.title}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors duration-150 hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-page px-4 py-6 text-xs text-muted md:px-8">
          © 2026 Relay. Made with care in Kolkata.
        </p>
      </div>
    </footer>
  );
}
