import { ShieldCheckIcon } from "@/components/icons/shield-check-icon";

const cipher =
  "a7f3c9e1 0b44d2aa 9e1f7c03 5d8b21e6 cc90af14 72e3b0d9 4a1c88f2 e60d3b97 1f2a9c4e 7b51e051 6ce49a20 d3f1078b b52e6c19 0a97f4d3 e81c25b0 c4a87b15 9c0f13e8 2bd6a741 f04c9a1e 7b23d8c6 a91e04f7 e5f17a93 08cd4b6e 92a3f1d0 b7e6c48a 1d0f93e2 c4a87b15 f04c9a1e 7b23d8c6 a91e04f7 3c6b8d20 e5f17a93";

export function CipherPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative mt-auto h-28 overflow-hidden rounded-lg border border-line bg-surface p-3"
    >
      <p className="font-mono text-2xs leading-relaxed break-all text-faint">{cipher}</p>
      <span className="absolute inset-0 grid place-items-center">
        <span className="inline-grid size-11 place-items-center rounded-lg bg-accent-solid text-on-accent shadow-accent">
          <ShieldCheckIcon size={22} />
        </span>
      </span>
    </div>
  );
}
