import type { Tone } from "@/types/tone";

const toneGradients: Record<Tone, string> = {
  blue: "bg-linear-to-br from-[#5b8cff] to-[#2456db]",
  sky: "bg-linear-to-br from-[#5aa8ff] to-[#2563eb]",
  indigo: "bg-linear-to-br from-[#7180ff] to-[#3f4fd8]",
  violet: "bg-linear-to-br from-[#8b7bff] to-[#5a46de]",
  purple: "bg-linear-to-br from-[#c06cf0] to-[#8434c9]",
  pink: "bg-linear-to-br from-[#f2649f] to-[#c2286a]",
  orange: "bg-linear-to-br from-[#f68e55] to-[#cf4f25]",
  amber: "bg-linear-to-br from-[#f2b84b] to-[#b9700c]",
  teal: "bg-linear-to-br from-[#2fc5a8] to-[#0f7c66]",
  emerald: "bg-linear-to-br from-[#34d399] to-[#047857]",
  cyan: "bg-linear-to-br from-[#38bdf8] to-[#0a6fae]",
  slate: "bg-linear-to-br from-[#8b8b95] to-[#4f4f58]",
};

export function toneGradient(tone: Tone) {
  return toneGradients[tone];
}

const toneBanners: Record<Tone, string> = {
  blue: "bg-linear-to-r from-[#4f7dff] via-[#2a4fc2] to-[#0d1a45]",
  sky: "bg-linear-to-r from-[#8fd0ff] via-[#2b6aa8] to-[#0c1f3a]",
  indigo: "bg-linear-to-r from-[#8d97ff] via-[#3a3fa6] to-[#12153d]",
  violet: "bg-linear-to-r from-[#a99dff] via-[#4d3fb0] to-[#151040]",
  purple: "bg-linear-to-r from-[#d79bff] via-[#6a2fa0] to-[#1d0d33]",
  pink: "bg-linear-to-r from-[#ff9cc6] via-[#a3336a] to-[#2a0c1d]",
  orange: "bg-linear-to-r from-[#f7d774] via-[#a8672a] to-[#24150c]",
  amber: "bg-linear-to-r from-[#f9e08a] via-[#b07a1c] to-[#2a1c08]",
  teal: "bg-linear-to-r from-[#5ee6c8] via-[#16786a] to-[#0a2422]",
  emerald: "bg-linear-to-r from-[#6ee7b7] via-[#11795a] to-[#06231a]",
  cyan: "bg-linear-to-r from-[#8fe3ff] via-[#1d6d93] to-[#0a2030]",
  slate: "bg-linear-to-r from-[#b5b5c0] via-[#555560] to-[#18181c]",
};

export function toneBanner(tone: Tone) {
  return toneBanners[tone];
}
