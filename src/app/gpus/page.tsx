import type { Metadata } from "next";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { CANONICAL_URL } from "@/constants/canonical";
import { NOVITA_URL } from "@/constants/urls";
import GpusHero from "./components/GpusHero";
import GpusPageContent from "./components/GpusPageContent";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "GPU Cloud - High-Performance GPUs for AI | Novita AI",
    description:
      "Launch GPU instances or serverless GPUs across global regions. Train, fine-tune, and run high-throughput inference. Use on-demand or spot at 50% off.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.GPUS),
  };
}

export default async function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--gray-50)]">
      <WebsiteNavbar />
      <GpusHero />
      <GpusPageContent />
      <FooterSection getStartedHref={NOVITA_URL.GPU_CONSOLE_APPLICATION} />
    </div>
  );
}
