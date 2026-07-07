"use client";

import { memo, type ReactNode, type Ref } from "react";
import { useCallback, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/app/components/button/Button";
import Cookies from "js-cookie";
import { ChevronRight } from "lucide-react";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
import { NOVITA_URL } from "@/constants/urls";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { GpuCloudBareMetalVisual } from "@/app/homepage/components/gpu-cloud/GpuCloudBareMetalVisual";
import { GpuCloudInstanceVisual } from "@/app/homepage/components/gpu-cloud/GpuCloudInstanceVisual";
import { GpuCloudServerlessVisual } from "@/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual";
import { useI18nSubscription } from "@/i18n/provider";

/** Figma `1:9320` Row：图 651、文案 346、gap 40px → 桌面列宽比 651fr : 346fr */
const GPU_CLOUD_ROW_GRID_VISUAL_FIRST =
  "lg:grid-cols-[minmax(0,651fr)_minmax(0,346fr)]";
const GPU_CLOUD_ROW_GRID_COPY_FIRST =
  "lg:grid-cols-[minmax(0,346fr)_minmax(0,651fr)]";

interface GpuCloudRowProps {
  index: number;
  kicker: string;
  title: string;
  description: string;
  imageOnLeft: boolean;
  visual: ReactNode;
  /** Logged-in (uuid or token cookie) — same semantics as `WebsiteNavbar` */
  showSessionChrome: boolean;
  onGetStarted: () => void;
}

function GpuCloudRow({
  index,
  kicker,
  title,
  description,
  imageOnLeft,
  visual,
  showSessionChrome,
  onGetStarted,
}: GpuCloudRowProps) {
  const visualCol = (
    <div className="min-w-0 w-full">
      <div className="relative w-full rounded-[6px] overflow-hidden">
        {visual}
      </div>
    </div>
  );

  const copy = (
    <div className="min-w-0 w-full flex flex-col gap-8 items-start">
      <div className="flex items-center gap-4">
        <div className="bg-dark-1 flex items-center justify-center rounded-sm size-5 shrink-0">
          <span className="font-mono-13 uppercase text-white">{index}</span>
        </div>
        <span className="font-mono-13 uppercase text-dark-2">{kicker}</span>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-heading-h5 font-miletus text-dark-1">{title}</h3>
        <p className="text-paragraph-16 font-miletus text-dark-3">
          {description}
        </p>
      </div>
      <Button
        type="secondary"
        height={44}
        renderTag={showSessionChrome ? "link" : "button"}
        link={NOVITA_URL.CONSOLE}
        onClick={showSessionChrome ? undefined : onGetStarted}
        className="gap-2 font-paragraph-15 font-miletus"
      >
        Get Started
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );

  return (
    <div
      className={[
        "flex flex-col gap-10 items-start",
        "lg:grid lg:gap-10 lg:items-end lg:w-full",
        imageOnLeft
          ? GPU_CLOUD_ROW_GRID_VISUAL_FIRST
          : GPU_CLOUD_ROW_GRID_COPY_FIRST,
      ].join(" ")}
    >
      {imageOnLeft ? (
        <>
          {visualCol}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {visualCol}
        </>
      )}
    </div>
  );
}

function ProductGpuCloudSection({
  sectionRef,
}: {
  sectionRef: Ref<HTMLDivElement>;
}) {
  useI18nSubscription();

  const pathname = usePathname();
  const router = useRouter();
  const { uuid } = useHeaderAuth();
  const [hasTokenCookie, setHasTokenCookie] = useState(false);
  useLayoutEffect(() => {
    setHasTokenCookie(Boolean(Cookies.get("token")));
  }, [pathname, uuid]);

  const showSessionChrome = Boolean(uuid) || hasTokenCookie;

  const handleGetStarted = useCallback(() => {
    if (showSessionChrome) {
      router.push(NOVITA_URL.CONSOLE);
      return;
    }
    localStorage.setItem("redirect", NOVITA_URL.CONSOLE);
    router.push(
      `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(NOVITA_URL.CONSOLE)}`,
    );
  }, [router, showSessionChrome]);

  return (
    <div
      ref={sectionRef}
      data-section-id="gpu-cloud"
      className="flex flex-col gap-[80px] mt-[80px]"
    >
      <SectionEyebrow label="GPU CLOUD" />
      <div className="flex flex-col gap-[80px]">
        <GpuCloudRow
          index={1}
          kicker="GPU Instances"
          title="Full-control GPU machines. Yours in seconds."
          description="Deploy models, run inference, train from scratch, on dedicated GPU instances you fully control. Predictable performance. No shared resources. No surprises."
          imageOnLeft
          visual={<GpuCloudInstanceVisual />}
          showSessionChrome={showSessionChrome}
          onGetStarted={handleGetStarted}
        />
        <GpuCloudRow
          index={2}
          kicker="Serverless GPU"
          title="Submit a job. We handle the rest."
          description="No instances to provision. No idle compute to pay for. Novita allocates GPU resources automatically, scales up under load, scales to zero when you're done. You pay for execution, nothing else."
          imageOnLeft={false}
          visual={<GpuCloudServerlessVisual />}
          showSessionChrome={showSessionChrome}
          onGetStarted={handleGetStarted}
        />
        <GpuCloudRow
          index={3}
          kicker="Bare Metal"
          title="Maximum performance. Zero abstraction overhead."
          description="Dedicated physical GPU clusters for large-scale inference, training runs, and enterprise deployments that can't compromise on throughput. When you need the hardware to yourself, this is it."
          imageOnLeft
          visual={<GpuCloudBareMetalVisual />}
          showSessionChrome={showSessionChrome}
          onGetStarted={handleGetStarted}
        />
      </div>
    </div>
  );
}

export default memo(ProductGpuCloudSection);
