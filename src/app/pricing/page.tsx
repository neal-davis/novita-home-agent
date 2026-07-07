import { Metadata } from "next";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { cookies } from "next/headers";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FirstPage from "./components/FirstPage";
import DetailContent from "./components/DetailContent";
import { CANONICAL_URL } from "@/constants/canonical";
import { VisitReport } from "./components/visitReport";
import { getFullLLMModels } from "@/api/model";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

// Set short revalidation time for pricing data (30 seconds)
export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pricing | Novita AI",
    description:
      "See pricing for 200+ AI models, GPU instances, and agent sandboxes. Developer-focused with startup-friendly rates. No hidden fees.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.PRICING),
  };
}

export default async function PricingPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const fullLLMModels = await getFullLLMModels(undefined, token);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--gray-50)]">
      <WebsiteNavbar />
      <FirstPage />
      <DetailContent initialFullLLMModels={fullLLMModels} />
      <FooterSection />
      <VisitReport />
    </div>
  );
}
