import Section from "./components/section";
import type { Metadata } from "next";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

const metadata: Metadata = {
  title: "Novita AI GPU Instance savingsPlans",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...metadata,
    alternates: getLocalizedMetadataAlternates(
      CANONICAL_URL.GPU_INSTANCE_SAVINGS_PLANS,
    ),
  };
}

export default function Page() {
  return <Section />;
}
