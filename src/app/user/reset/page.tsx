import { Suspense } from "react";
import { ResetForm } from "./components/ResetForm";
import { PageWithBg } from "../components/common-background";

export default function Page() {
  return (
    <PageWithBg rootPage="reset">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </PageWithBg>
  );
}
