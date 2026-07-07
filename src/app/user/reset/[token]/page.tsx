import { Suspense } from "react";
import ResetForm from "./components/resetForm";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";
import { PageWithBg } from "../../components/common-background";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: getLocalizedMetadataAlternates(
      `${CANONICAL_URL.USER_RESET}/[token]`,
    ),
  };
}

export default function Page(props: { params: { token: string } }) {
  const token = props.params.token;
  if (!token) {
    redirect("/");
  }

  return (
    <PageWithBg rootPage="reset">
      <Suspense fallback={null}>
        <ResetForm token={token} />
      </Suspense>
    </PageWithBg>
  );
}
