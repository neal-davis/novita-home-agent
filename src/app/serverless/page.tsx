import type { Metadata } from "next";
import Footer from "@/app/components/footer/Footer";
import Header from "@/app/components/header/Header";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import FirstPage from "./components/FirstPage";
import Features from "./components/Features";
import Deployment from "./components/Deployment";
import Price from "./components/Price";
import styles from "./page.module.scss";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Effortless Serverless AI Deployment With Cost Savings - Novita AI",
    description:
      "Effortlessly deploy AI applications with elastic scaling and auto load balancing. Pay as you go and reduce operational costs while launching your AI projects.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.SERVERLESS),
  };
}

export default async function Page() {
  return (
    <main className={`relative max-w-full overflow-hidden ${styles.container}`}>
      <Header />
      <FirstPage />
      <Features />
      <Deployment />
      <Price />
      <FooterBanner />
      <Footer />
    </main>
  );
}
