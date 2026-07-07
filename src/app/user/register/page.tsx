import { Suspense } from "react";
import { headers } from "next/headers";
import { SignupForm } from "./components/SignupForm";
import { PageWithBg } from "../components/common-background";

export default function Page() {
  const headersList = headers();
  const searchStr = headersList.get("x-search") ?? "";
  const searchParams = searchStr
    ? Object.fromEntries(new URLSearchParams(searchStr).entries())
    : {};

  return (
    <PageWithBg searchParams={searchParams} rootPage="signup">
      <Suspense fallback={null}>
        <SignupForm searchParams={searchParams} />
      </Suspense>
    </PageWithBg>
  );
}
