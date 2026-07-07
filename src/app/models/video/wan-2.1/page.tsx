import Case from "./Case";
import { Metadata } from "next";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import Layout from "../../../model-api/product/components/Layout_new";

export const metadata: Metadata = {
  title: "Wan2.1 Text-to-Video with LoRA (480p & 720p)",
  description:
    "Wan2.1 Text-to-Video is a leading model that transforms text into high-quality 480P and 720P videos with LoRA support, enabling seamless content creation.",
};

export default function Page() {
  return (
    <Layout
      title={<>Wan2.1 14B Text-to-Video</>}
      metadata={metadata}
      desc="Experience Wan2.1 T2V now to transform your text into smooth 480P or 720P videos with LoRA support and bilingual prompts in Chinese and English."
      docUrl={DOCS_URL.WAN_T2V}
      getStartedUrl={DOCS_URL.WAN_T2V}
      pricingUrl={NOVITA_URL.PRICING}
    >
      <Case />
    </Layout>
  );
}
