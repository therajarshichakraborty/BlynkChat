import type { Metadata } from "next";
import { AboutSection } from "@/components/landing/about-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Hero } from "@/components/landing/hero";
import { siteDescription } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Relay · Conversations at the speed of thought" },
  description: siteDescription,
};

export default function LandingPage() {
  return (
    <main id="main" className="flex-1">
      <Hero />
      <FeaturesSection />
      <AboutSection />
    </main>
  );
}
