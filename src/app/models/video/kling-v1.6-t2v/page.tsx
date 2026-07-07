import Case from "./Case";
import { Metadata } from "next";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import Layout from "../../../model-api/product/components/Layout_new";

export const metadata: Metadata = {
  title: "Kling V1.6 Standard Text to Video (720p)",
  description:
    "Kling V1.6 Standard T2V by Kuaishou AI transforms text into 5-second, 720p videos with high-quality visuals, smooth motion, and advanced semantic understanding.",
};

export default function Page() {
  return (
    <Layout
      title={<>Kling V1.6 Standard Text to Video</>}
      metadata={metadata}
      desc="Experience Kling V1.6 T2V now to transform your text into smooth 720P videos."
      docUrl={DOCS_URL.KLING_V1_6_T2V}
      getStartedUrl={DOCS_URL.KLING_V1_6_T2V}
      pricingUrl={NOVITA_URL.PRICING}
    >
      <Case />
    </Layout>
  );
}
