import { Suspense } from "react";
import { headers } from "next/headers";
import { LoginForm } from "./components/LoginForm";
import { PageWithBg } from "../components/common-background";

export default async function Page() {
  const headersList = headers();
  const searchStr = headersList.get("x-search") ?? "";
  const searchParams = searchStr
    ? Object.fromEntries(new URLSearchParams(searchStr).entries())
    : {};

  return (
    <PageWithBg searchParams={searchParams} rootPage="login">
      <Suspense fallback={null}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </PageWithBg>
  );
}
