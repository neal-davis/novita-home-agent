import Case from "./Case";
import { Metadata } from "next";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import Layout from "../../../model-api/product/components/Layout_new";

export const metadata: Metadata = {
  title:
    "Wan2.6: Create Cinematic AI Videos with Multi-Shot Narratives & Audio Sync",
  description:
    "Generate cinematic AI videos from text, images, or videos with Wan 2.6. Free credits and pro features for creators and developers",
};

export default function Page() {
  return (
    <Layout
      title={
        <>
          Wan2.6: Create Cinematic AI Videos with Multi-Shot Narratives & Audio
          Sync
        </>
      }
      metadata={metadata}
      desc="Wan 2.6 is a state-of-art AI image, video model by Alibaba."
      docUrl={DOCS_URL.WAN_2_6_T2V}
      getStartedUrl={DOCS_URL.WAN_2_6_T2V}
      pricingUrl={NOVITA_URL.PRICING}
    >
      <Case />
    </Layout>
  );
}
