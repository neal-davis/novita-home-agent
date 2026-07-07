import type { Metadata } from "next";
import MainPageContent from "./index";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import homepageStyles from "./index.module.scss";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Accelerate Your AI with Novita's GPU Cloud | Novita AI",
    description:
      "Optimize your AI with Novita's GPU instances and serverless GPU cloud. Save up to 50%, auto-scale, and access high-capacity storage for global deployment.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.GPUS),
  };
}

export default async function Page() {
  return (
    <main
      className={`relative max-w-full overflow-hidden ${homepageStyles.homepage}`}
    >
      <Header />
      <MainPageContent />
      <FooterBanner />
      <Footer />
    </main>
  );
}
