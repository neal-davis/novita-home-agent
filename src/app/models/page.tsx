import { Metadata } from "next";
import { cookies } from "next/headers";
import { CANONICAL_URL } from "@/constants/canonical";
import { getFullLLMModels } from "@/api/model";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import ModelLibraryHero from "./components/ModelLibraryHero";
import Content from "./model-library/Content";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Model Library With 200+ APIs for AI Applications | Novita AI",
    description:
      "Call 200+ AI models with one API: LLMs, image generation, video, TTS, embeddings. Go from prototype to production without managing servers.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.MODELS),
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { type?: string; provider?: string };
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const llmModelList = await getFullLLMModels(
    ["chat", "embedding", "reranker"],
    token,
  );
  return (
    <div className="flex flex-col min-h-screen bg-[var(--gray-50)]">
      <WebsiteNavbar />
      <ModelLibraryHero />
      <Content
        key={(searchParams?.type || "") + "_" + (searchParams?.provider || "")}
        llmModelList={llmModelList}
        defaultType={searchParams?.type}
        defaultProvider={searchParams?.provider}
      />
      <FooterSection />
    </div>
  );
}
