import { Metadata } from "next";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { CANONICAL_URL } from "@/constants/canonical";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import Hero from "@/app/sandbox1/components/Hero";
import BuildFor from "@/app/sandbox1/components/BuildFor";
import WhyNovita from "@/app/sandbox1/components/WhyNovita";
import Capabilities from "@/app/sandbox1/components/Capabilities";
import Pricing from "@/app/sandbox1/components/Pricing";
import BuildWith from "@/app/sandbox1/components/BuildWith";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Novita Sandbox: AI Agent Sandbox for Cloud Agents | Novita AI",
    description:
      "Sandbox with secure cloud runtimes, browser access, filesystem, computer use, and long-running task support.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.SANDBOX),
  };
}

export default function Page() {
  return (
    <main className="relative max-w-full overflow-x-clip bg-[var(--surface)]">
      <WebsiteNavbar />
      <Hero />
      <BuildFor />
      <WhyNovita />
      <Capabilities />
      <Pricing />
      <BuildWith />
      <FooterSection />
    </main>
  );
}
