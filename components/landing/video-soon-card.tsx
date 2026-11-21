import { CaptionsIcon } from "@/components/icons/captions-icon";
import { ClockIcon } from "@/components/icons/clock-icon";
import { MicIcon } from "@/components/icons/mic-icon";
import { PhoneOffIcon } from "@/components/icons/phone-off-icon";
import { ScreenShareIcon } from "@/components/icons/screen-share-icon";
import { VideoIcon } from "@/components/icons/video-icon";
import { Tag } from "@/components/ui/tag";
import { VideoTile } from "./video-tile";
import { WaitlistForm } from "./waitlist-form";

const controls = [
  { icon: MicIcon, label: "Microphone" },
  { icon: VideoIcon, label: "Camera" },
  { icon: ScreenShareIcon, label: "Share screen" },
  { icon: CaptionsIcon, label: "Captions" },
];

export function VideoSoonCard() {
  return (
    <article
      id="video"
      aria-labelledby="video-title"
      className="grid scroll-mt-24 gap-6 overflow-hidden rounded-xl border border-accent-line bg-linear-to-br from-accent-soft via-card to-card p-6 shadow-sm md:col-span-2 md:grid-cols-[1fr_1.15fr] md:p-7 dark:from-[#0f2563] dark:via-[#0d1a3d] dark:to-card"
    >
      <div className="flex flex-col">
        <Tag className="self-start">
          <ClockIcon size={12} />
          Coming soon
        </Tag>
        <h3 id="video-title" className="mt-4 text-2xl font-semibold">
          HD video calls
        </h3>
        <p className="mt-2 text-base text-muted">
          Group video for up to 32 people, screen sharing, background blur and live captions.
          Rolling out early 2027.
        </p>
        <div className="mt-6 md:mt-auto md:pt-6">
          <WaitlistForm />
        </div>
      </div>
      <div aria-hidden="true" className="relative grid grid-cols-2 gap-2.5 pb-6">
        <VideoTile
          name="Ananya"
          initials="AS"
          tone="blue"
          speaking
          background="h-28 bg-linear-to-br from-[#3d6bf0] to-[#1c3fa8]"
        />
        <VideoTile
          name="Kabir"
          initials="KM"
          tone="violet"
          muted
          background="h-28 bg-linear-to-br from-[#1b7f9b] to-[#173d7a]"
        />
        <VideoTile
          name="Meera"
          initials="MI"
          tone="teal"
          background="h-28 bg-linear-to-br from-[#6b4fd8] to-[#2f2a8f]"
        />
        <VideoTile
          name="Rohan"
          initials="RM"
          tone="cyan"
          background="h-28 bg-linear-to-br from-[#2b5ce6] to-[#1d3a9e]"
        />
        <span className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#0b0b0d]/90 p-1.5 text-white shadow-md">
          {controls.map(({ icon: ControlIcon, label }) => (
            <span key={label} className="inline-grid size-8 place-items-center rounded-full">
              <ControlIcon size={16} />
            </span>
          ))}
          <span className="inline-grid size-8 place-items-center rounded-full bg-danger">
            <PhoneOffIcon size={16} />
          </span>
        </span>
      </div>
    </article>
  );
}
