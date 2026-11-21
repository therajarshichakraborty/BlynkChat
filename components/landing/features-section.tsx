import { DevicesIcon } from "@/components/icons/devices-icon";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { LockIcon } from "@/components/icons/lock-icon";
import { MicIcon } from "@/components/icons/mic-icon";
import { SparklesIcon } from "@/components/icons/sparkles-icon";
import { UsersIcon } from "@/components/icons/users-icon";
import { ZapIcon } from "@/components/icons/zap-icon";
import { AvatarStack } from "@/components/ui/avatar-stack";
import type { AvatarPerson } from "@/types/user";
import { CipherPreview } from "./cipher-preview";
import { DevicesPreview } from "./devices-preview";
import { FeatureCard } from "./feature-card";
import { RealtimePreview } from "./realtime-preview";
import { RoomsPreview } from "./rooms-preview";
import { SectionEyebrow } from "./section-eyebrow";
import { VideoSoonCard } from "./video-soon-card";
import { VoicePreview } from "./voice-preview";

const groupSample: AvatarPerson[] = [
  { initials: "AS", tone: "blue" },
  { initials: "KM", tone: "violet" },
  { initials: "MI", tone: "sky" },
  { initials: "RM", tone: "teal" },
  { initials: "IV", tone: "slate" },
  { initials: "DK", tone: "orange" },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="mx-auto max-w-page scroll-mt-20 px-4 py-20 md:px-8 md:py-24"
    >
      <div className="flex flex-col items-center text-center">
        <SectionEyebrow icon={<SparklesIcon size={14} />}>Everything you need</SectionEyebrow>
        <h2 id="features-title" className="mt-5 text-3xl font-semibold md:text-5xl">
          One app for every
          <br />
          <span className="bg-linear-to-b from-fg to-muted bg-clip-text text-transparent">
            conversation you have
          </span>
        </h2>
        <p className="mt-5 max-w-xl text-md text-muted md:text-lg">
          From quick DMs to 100k member communities. Relay keeps it all fast, private and
          beautifully organized.
        </p>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          id="realtime"
          icon={<ZapIcon size={16} />}
          title="Real-time, really"
          description="Messages, reactions, typing and read receipts land instantly over a global edge network. No refresh, no lag."
          className="md:col-span-2 md:grid md:grid-cols-2 md:gap-x-8"
        >
          <dl className="flex gap-6 md:col-start-1 md:row-start-2 md:self-end">
            <div>
              <dt className="sr-only">Median delivery</dt>
              <dd className="text-3xl font-semibold">
                48<span className="text-base text-muted">ms</span>
              </dd>
              <dd className="text-xs text-muted">median delivery</dd>
            </div>
            <div className="border-l border-line pl-6">
              <dt className="sr-only">Uptime</dt>
              <dd className="text-3xl font-semibold">
                99.99<span className="text-base text-muted">%</span>
              </dd>
              <dd className="text-xs text-muted">uptime</dd>
            </div>
          </dl>
          <div className="md:col-start-2 md:row-span-2 md:row-start-1">
            <RealtimePreview />
          </div>
        </FeatureCard>
        <FeatureCard
          id="security"
          icon={<LockIcon size={16} />}
          title="Private by default"
          description="End-to-end encryption on every chat, call and file. Not even we can read them."
        >
          <CipherPreview />
        </FeatureCard>
        <FeatureCard
          id="groups"
          icon={<UsersIcon size={16} />}
          title="Groups that scale"
          description="Up to 1,024 members with admins, polls, mentions and threaded replies."
        >
          <AvatarStack people={groupSample} size="lg" extra="+1k" className="mt-auto" />
        </FeatureCard>
        <FeatureCard
          id="communities"
          icon={<GlobeIcon size={16} />}
          title="Communities & rooms"
          description="Organize groups under one community with text rooms, voice rooms and announcements."
        >
          <RoomsPreview />
        </FeatureCard>
        <FeatureCard
          id="voice"
          icon={<MicIcon size={16} />}
          title="Voice notes & audio calls"
          description="Crystal-clear voice messages with 2x playback and HD audio calling."
        >
          <VoicePreview />
        </FeatureCard>
        <VideoSoonCard />
        <FeatureCard
          id="sync"
          icon={<DevicesIcon size={16} />}
          title="Synced on every screen"
          description="Start on your phone, continue on iPad, finish on desktop. Drafts and read state follow you."
        >
          <DevicesPreview />
        </FeatureCard>
      </div>
    </section>
  );
}
