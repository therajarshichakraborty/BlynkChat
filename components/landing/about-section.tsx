import { CodeIcon } from "@/components/icons/code-icon";
import { DevicesIcon } from "@/components/icons/devices-icon";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import { MessageCircleIcon } from "@/components/icons/message-circle-icon";
import { ShieldIcon } from "@/components/icons/shield-icon";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionEyebrow } from "./section-eyebrow";
import { StatCard } from "./stat-card";

const stats = [
  { icon: MessageCircleIcon, value: "2M+", label: "Messages every day" },
  { icon: GlobeIcon, value: "40k", label: "Active communities" },
  { icon: DevicesIcon, value: "3", label: "Platforms, one account" },
  { icon: ShieldIcon, value: "0", label: "Ads. Ever." },
];

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto max-w-page scroll-mt-20 px-4 pb-20 md:px-8 md:pb-28"
    >
      <div className="grid gap-10 rounded-xl border border-line bg-card p-6 shadow-sm md:p-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="flex flex-col items-start">
          <SectionEyebrow icon={<HeartIcon size={14} />}>About Relay</SectionEyebrow>
          <h2 id="about-title" className="mt-5 text-3xl font-semibold md:text-4xl">
            Built for people who
            <br className="max-sm:hidden" /> talk, build and ship together.
          </h2>
          <p className="mt-5 max-w-xl text-md text-muted">
            Relay started as a weekend project between friends tired of juggling five chat apps.
            Today it is one calm, fast place for DMs, groups and communities, designed with the
            same care as the tools you love.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/#features" variant="dark">
              Read our story
            </ButtonLink>
            <ButtonLink href="/#features" variant="outline">
              <CodeIcon size={16} />
              Open source SDK
            </ButtonLink>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:gap-4">
          {stats.map(({ icon: StatIcon, value, label }) => (
            <StatCard key={label} icon={<StatIcon size={20} />} value={value} label={label} />
          ))}
        </ul>
      </div>
    </section>
  );
}
