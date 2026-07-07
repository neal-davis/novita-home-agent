import { Metadata } from "next";
import { cookies } from "next/headers";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import Footer from "@/app/components/footer/Footer";
import Header from "@/app/components/header/Header";
import { CANONICAL_URL } from "@/constants/canonical";
import FeaturedModels from "./components/FeaturedModels";
import DeBanner from "@/app/components/de-banner/DeBanner";
import { LLMModelWithStatus } from "@/types/models";
import { ModelType } from "@/types/models";
import { getFullLLMModels } from "@/api/model";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Build Smarter AI with Open-Source LLM API| Novita AI",
    description:
      "Deploy open-source large language models like Llama with Novita AI’s API. Build smarter, scalable AI solutions with ease and flexibility.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.MODELS_LLM),
  };
}

export default async function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const llmModelList: LLMModelWithStatus[] = await getFullLLMModels(
    ["chat"],
    token,
  );
  return (
    <div>
      <Header />
      <FeaturedModels
        modelList={llmModelList.filter(
          (model) => model.type === ModelType.Chat,
        )}
      />
      <DeBanner />
      <FooterBanner />
      <Footer />
    </div>
  );
}
