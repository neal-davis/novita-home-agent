import type { Metadata } from "next";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { CANONICAL_URL } from "@/constants/canonical";
import GpuBareMetalHero from "./components/GpuBareMetalHero";
import GpuBareMetalPageContent from "./components/GpuBareMetalPageContent";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Bare Metal GPU Servers | Low Cost, High Performance | Novita AI",
    description:
      "High-performance bare metal GPU servers by Novita AI. Full control and low cost—ideal for AI, ML, and deep learning workloads.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.GPU_BAREMETAL),
  };
}

export default async function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--gray-50)]">
      <WebsiteNavbar />
      <GpuBareMetalHero />
      <GpuBareMetalPageContent />
      <FooterSection />
    </div>
  );
}
