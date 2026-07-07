import { Metadata } from "next";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { CANONICAL_URL } from "@/constants/canonical";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import Hero from "./components/Hero";
import WhyNovita from "./components/WhyNovita";
import Capabilities from "./components/Capabilities";
import Pricing from "./components/Pricing";
import BuildWith from "./components/BuildWith";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      "AI Agent Sandbox - Fast, Secure & E2B-Compatible AI Runtime | Novita AI",
    description:
      "Launch AI agents in under 200ms with real-time browser access, computer use, and multi-language support. Secure, scalable, and billed per second.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.SANDBOX),
  };
}

export default function Page() {
  return (
    <main className="relative max-w-full overflow-hidden bg-surface">
      <WebsiteNavbar />
      <Hero />
      <WhyNovita />
      <Capabilities />
      <Pricing />
      <BuildWith />
      <FooterSection />
    </main>
  );
}
