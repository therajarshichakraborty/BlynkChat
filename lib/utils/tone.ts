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
