import type { Metadata } from "next";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";
import BudgetsPage from "./index";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.BILLING),
  };
}

export default function Page() {
  return <BudgetsPage />;
}
