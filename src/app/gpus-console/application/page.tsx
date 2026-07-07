import Section from "./components/section";
import { Metadata } from "next";
import { Suspense } from "react";
import { getGPUBannerConfigInServerEnv } from "@/api/config";
import { mapGpuBannerRawToSlides } from "./components/gpuBannerMap";

export const metadata: Metadata = {
  title: "Novita AI GPU Application",
};

export default async function Page() {
  const gpuBannerRaw = await getGPUBannerConfigInServerEnv();
  const gpuBannerSlides = mapGpuBannerRawToSlides(gpuBannerRaw);

  return (
    <Suspense fallback={null}>
      <Section gpuBannerSlides={gpuBannerSlides} />
    </Suspense>
  );
}
