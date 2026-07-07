import Section from "./components/section";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Novita AI GPU Instance templates library",
};

export default async function Page() {
  return (
    <Suspense fallback={null}>
      <Section />
    </Suspense>
  );
}
