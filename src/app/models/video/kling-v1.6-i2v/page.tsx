import Case from "./Case";
import { Metadata } from "next";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import Layout from "../../../model-api/product/components/Layout_new";

export const metadata: Metadata = {
  title: "Kling V1.6 Image to Video Standard & Professional (720p & 1080p)",
  description:
    "Kling V1.6 I2V by Kuaishou AI turns images into dynamic 5-second videos at 720p/1080p, delivering high-quality visuals with smooth motion and rich semantics.",
};

export default function Page() {
  return (
    <Layout
      title={<>Kling V1.6 Image to Video</>}
      metadata={metadata}
      desc="Try Kling V1.6 I2V now to transform your images into smooth 720P/1080P videos."
      docUrl={DOCS_URL.KLING_V1_6_I2V}
      getStartedUrl={DOCS_URL.KLING_V1_6_I2V}
      pricingUrl={NOVITA_URL.PRICING}
    >
      <Case />
    </Layout>
  );
}
