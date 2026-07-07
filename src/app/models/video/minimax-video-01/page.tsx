import Case from "./Case";
import { Metadata } from "next";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import Layout from "../../../model-api/product/components/Layout_new";

export const metadata: Metadata = {
  title: "MiniMax (Hailuo AI) Video 01 T2V & I2V (720p)",
  description:
    "Minimax Video 01 creates 6s, 720p videos from text or images at 25fps, supporting subject references through the S2V-01 model.",
};

export default function Page() {
  return (
    <Layout
      title={<>MiniMax Video 01 T2V & I2V</>}
      metadata={metadata}
      desc="Experience MiniMax Video 01 now to transform your text or image into smooth 720P videos."
      docUrl={DOCS_URL.MINIMAX_VIDEO_01}
      getStartedUrl={DOCS_URL.MINIMAX_VIDEO_01}
      pricingUrl={NOVITA_URL.PRICING}
    >
      <Case />
    </Layout>
  );
}
