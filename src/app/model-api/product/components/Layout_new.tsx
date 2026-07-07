import { Metadata } from "next";
import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import MainPage from "./firstpage/FirstPage_new";
import ProductRecommendations from "./ProductRecommendations/ProductRecommendations";

type ProductPageProps = {
  children?: React.ReactNode;
  title?: React.ReactNode | string;
  desc?: React.ReactNode | string;
  metadata: Metadata;
  docUrl?: string;
  getStartedUrl?: string;
  playgroundUrl?: string;
  pricingUrl?: string;
  tryBtnTxt?: string;
  operateBtns?: React.ReactNode;
};

export default function Page({
  children,
  title,
  desc,
  metadata,
  docUrl,
  getStartedUrl,
  playgroundUrl,
  pricingUrl,
  tryBtnTxt,
  operateBtns,
}: ProductPageProps) {
  return (
    <main className={`relative w-full overflow-hidden`}>
      <Header />
      <MainPage
        title={title || (metadata.title as string)}
        apiUrl={docUrl}
        getStartedUrl={getStartedUrl}
        playgroundUrl={playgroundUrl}
        pricingUrl={pricingUrl}
        introduce={desc || metadata.description}
        TryBtnTxt={tryBtnTxt}
        operateBtns={operateBtns}
      />
      {children}
      <ProductRecommendations />
      <Footer />
    </main>
  );
}
