import { Suspense } from "react";
import { PageWithBg } from "../components/common-background";
import { Form } from "./Form";

export default function page() {
  return (
    <PageWithBg rootPage="validate-email">
      <Suspense fallback={<div>Loading...</div>}>
        <Form />
      </Suspense>
    </PageWithBg>
  );
}
