import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon";
import { DevicesIcon } from "@/components/icons/devices-icon";
import { LockIcon } from "@/components/icons/lock-icon";
import { PlayIcon } from "@/components/icons/play-icon";
import { ZapIcon } from "@/components/icons/zap-icon";
import { ButtonLink } from "@/components/ui/button-link";
import { Tag } from "@/components/ui/tag";

const trust = [
  { icon: LockIcon, label: "E2E encrypted" },
  { icon: ZapIcon, label: "Sub-100ms delivery" },
  { icon: DevicesIcon, label: "Mobile, iPad & desktop" },
];

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto flex max-w-page flex-col items-center px-4 pt-16 pb-20 text-center md:px-8 md:pt-24 md:pb-28"
    >
      <Link
        href="/#video"
        className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card/80 py-1 pr-3 pl-1 text-sm shadow-xs transition-colors duration-150 hover:bg-surface"
      >
        <Tag variant="solid" className="h-6 px-2.5">
          New
        </Tag>
        <span className="text-fg">
          Video calls are coming<span className="max-sm:hidden"> to Relay</span>. Join the waitlist
        </span>
        <ChevronRightIcon size={16} className="text-muted" />
      </Link>
      <h1
        id="hero-title"
        className="mt-8 max-w-[15ch] text-4xl font-semibold sm:text-5xl lg:max-w-none lg:text-[72px] lg:leading-[1.05] lg:tracking-[-1.8px]"
      >
        Conversations that
        <br className="max-lg:hidden" />{" "}
        <span className="bg-linear-to-b from-fg to-muted bg-clip-text text-transparent">
          move at the
        </span>{" "}
        <span className="bg-linear-to-r from-accent-solid to-[#7aa6ff] bg-clip-text text-transparent">
          speed of thought
        </span>
      </h1>
      <p className="mt-6 max-w-2xl text-md text-muted md:text-lg">
        Real-time chats, group rooms and communities in one beautifully fast app.
        <br className="max-md:hidden" /> End-to-end encrypted, synced across mobile, iPad and
        desktop.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/signup" size="lg" className="px-7">
          Start chatting free
          <ArrowRightIcon size={18} />
        </ButtonLink>
        <ButtonLink href="/#video" variant="outline" size="lg" className="px-7">
          <PlayIcon size={18} />
          Watch demo
        </ButtonLink>
      </div>
      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
        {trust.map(({ icon: TrustIcon, label }) => (
          <li key={label} className="inline-flex items-center gap-2">
            <TrustIcon size={16} />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
