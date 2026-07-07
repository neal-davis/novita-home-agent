import { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import FirstPage from "../components/FirstPage/FirstPage";
import Pricing from "../components/Pricing/Pricing";
import Parameters from "../components/Parameters/Parameters";
import Advantage from "../components/Advantage/Advantage";
import { CANONICAL_URL } from "@/constants/canonical";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import ReadyStart from "@/app/components/pageComponents/ReadyStart";
import { createGpuLandingPageContent } from "../components/gpuLandingPageData";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(props: {
  params: { gpu_model: string };
}): Promise<Metadata> {
  const content = createGpuLandingPageContent();
  const result = content.gpuData[props.params.gpu_model];
  if (!result) {
    return {
      title: "",
      description: "",
      alternates: getLocalizedMetadataAlternates(
        CANONICAL_URL.GPU_INSTANCE + "/gpu/" + props.params.gpu_model,
      ),
    };
  }
  return {
    title: result.title,
    description: result.description,
    alternates: getLocalizedMetadataAlternates(
      CANONICAL_URL.GPU_INSTANCE + "/gpu/" + props.params.gpu_model,
    ),
  };
}

export default async function GPULandingPage(props: {
  params: { gpu_model: string };
}) {
  const content = createGpuLandingPageContent();
  const productList = await reqMarketProducts({});
  const gpuData = content.gpuData[props.params.gpu_model];
  if (!gpuData) {
    return redirect("/not-found");
  }
  const productData = productList.products.find((p: any) =>
    p.productName.includes(gpuData.model),
  );

  return (
    <main className="relative max-w-full overflow-hidden">
      <Header />
      <FirstPage
        content={content}
        gpuData={gpuData}
        productData={productData}
      />
      {productData && (
        <Pricing
          content={content}
          gpuData={gpuData}
          productData={productData}
        />
      )}
      <Parameters content={content} gpuData={gpuData} />
      <Advantage content={content} />
      <ReadyStart />
      <FooterBanner />
      <Footer />
    </main>
  );
}
