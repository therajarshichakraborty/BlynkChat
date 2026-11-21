import type { Metadata } from "next";
import { NotifyButton } from "@/components/chat/notify-button";
import { CaptionsIcon } from "@/components/icons/captions-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { ClockIcon } from "@/components/icons/clock-icon";
import { ScreenShareIcon } from "@/components/icons/screen-share-icon";
import { UsersIcon } from "@/components/icons/users-icon";
import { VideoIcon } from "@/components/icons/video-icon";
import { VideoTile } from "@/components/landing/video-tile";
import { IconLink } from "@/components/ui/icon-link";
import { Tag } from "@/components/ui/tag";

export const metadata: Metadata = {
  title: "Video calls coming soon",
  description: "HD group video for up to 32 people, screen sharing and live captions are almost here.",
};

const features = [
  { icon: UsersIcon, label: "Group calls up to 32" },
  { icon: ScreenShareIcon, label: "Screen sharing" },
  { icon: CaptionsIcon, label: "Live captions" },
];

export default function VideoSoonPage() {
  return (
    <main
      id="main"
      className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-linear-to-b from-accent-soft to-bg"
    >
      <div className="flex items-center justify-between px-2 pt-3 md:px-6 md:pt-5">
        <IconLink href="/chats" label="Back to chats">
          <ChevronLeftIcon size={22} />
        </IconLink>
        <Tag className="h-7 px-3">
          <ClockIcon size={13} />
          Coming soon
        </Tag>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-4 pb-10 text-center">
        <div aria-hidden="true" className="relative grid w-full grid-cols-2 gap-2.5">
          <VideoTile name="Ananya" initials="AS" tone="blue" background="h-36 bg-linear-to-br from-[#3d6bf0] to-[#1c3fa8]" />
          <VideoTile name="Kabir" initials="KM" tone="violet" background="mt-6 h-34 bg-linear-to-br from-[#6b4fd8] to-[#2f2a8f]" />
          <VideoTile name="Meera" initials="MI" tone="teal" background="h-30 bg-linear-to-br from-[#1b7f9b] to-[#173d7a]" />
          <VideoTile name="Rohan" initials="RM" tone="cyan" background="h-36 bg-linear-to-br from-[#2b5ce6] to-[#1d3a9e]" />
          <span className="absolute top-1/2 left-1/2 inline-grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-accent-solid text-on-accent shadow-accent">
            <VideoIcon size={24} />
          </span>
        </div>
        <h1 className="mt-8 text-3xl font-semibold">
          Video calls are
          <br />
          <span className="text-accent-text">almost here</span>
        </h1>
        <p className="mt-3 text-md text-muted">
          HD group video for up to 32 people, screen share and live captions. Be the first to try it.
        </p>
        <ul className="mt-6 flex w-full flex-col gap-2.5">
          {features.map(({ icon: FeatureIcon, label }) => (
            <li
              key={label}
              className="flex h-14 items-center gap-3 rounded-lg border border-line bg-card px-4 text-left text-md font-medium shadow-xs"
            >
              <span className="inline-grid size-8 place-items-center rounded-md bg-accent-soft text-accent-text">
                <FeatureIcon size={17} />
              </span>
              <span className="flex-1">{label}</span>
              <CheckIcon size={17} className="text-muted" />
            </li>
          ))}
        </ul>
        <div className="mt-6 w-full">
          <NotifyButton waitlist={12480} />
        </div>
      </div>
    </main>
  );
}
