import Case from "./Case";
import { Metadata } from "next";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import Layout from "../../../model-api/product/components/Layout_new";

export const metadata: Metadata = {
  title: "Wan2.1 Image-to-Video with LoRA (480p & 720p)",
  description:
    "Wan2.1 Image-to-Video is a cutting-edge model for generating smooth 480P and 720P videos from images featuring LoRA support and bilingual text prompts.",
};

export default function Page() {
  return (
    <Layout
      title={<>Wan2.1 Image-to-Video</>}
      metadata={metadata}
      desc="Experience Wan2.1 I2V now to transform your images into smooth 480P or 720P videos with LoRA support and bilingual prompts in Chinese and English."
      docUrl={DOCS_URL.WAN_I2V}
      getStartedUrl={DOCS_URL.WAN_I2V}
      pricingUrl={NOVITA_URL.PRICING}
    >
      <Case />
    </Layout>
  );
}
