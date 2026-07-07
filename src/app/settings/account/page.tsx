import type { Metadata } from "next";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";
import Account from "./Account";

const metadata: Metadata = {
  title: "Account Settings | Novita AI",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...metadata,
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.SETTINGS),
  };
}

export default async function AccountPage() {
  return <Account />;
}
