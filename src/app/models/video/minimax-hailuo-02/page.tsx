import Case from "./Case";
import { Metadata } from "next";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import Layout from "../../../model-api/product/components/Layout_new";

export const metadata: Metadata = {
  title: "MiniMax Hailuo 02 T2V & I2V",
  description:
    "Hailuo 02 is an AI video generator with native 1080p, advanced physics mastery, and SOTA instruction following. Create stunning 6–10 second clips.",
};

export default function Page() {
  return (
    <Layout
      title={<>MiniMax Hailuo 02 T2V & I2V</>}
      metadata={metadata}
      desc="Bring your ideas to life with MiniMax Hailuo 02 and its stunning 1080p video generation."
      docUrl={DOCS_URL.MINIMAX_HAILUO_02}
      getStartedUrl={DOCS_URL.MINIMAX_HAILUO_02}
      pricingUrl={NOVITA_URL.PRICING}
    >
      <Case />
    </Layout>
  );
}
