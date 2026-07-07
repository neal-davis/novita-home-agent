"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { GreenNameSlot } from "@/app/homepage/components/model-viz/GreenNameTag";
import { VizBracket } from "@/lib/icons/VizAssets";
import { useElementActivity } from "@/hooks/useElementActivity";
import { GpuMicroTag } from "./GpuMicroTag";
import { gpuCloudVisualFrameClassName } from "./gpuCloudVisualFrame";

const BG = "/home/product/gpu-cloud01.png";

const ROTATING_NAMES = [
  "flagship",
  "inference",
  "performance",
  '"deepseek/r1"',
] as const;

const CYCLE_MS = 2500;
/** 括号比 Product 区更窄，贴近设计稿线条占比 */
const BRACKET = { height: 18, width: 2.35 } as const;

export function GpuCloudInstanceVisual() {
  const [i, setI] = useState(0);
  const { ref, isActive } = useElementActivity<HTMLDivElement>();
  const name = ROTATING_NAMES[i];

  useEffect(() => {
    if (!isActive) return;

    const t = setInterval(() => {
      setI((j) => (j + 1) % ROTATING_NAMES.length);
    }, CYCLE_MS);
    return () => clearInterval(t);
  }, [isActive]);

  return (
    <div ref={ref} className={gpuCloudVisualFrameClassName}>
      <div className="absolute inset-0 z-0">
        <Image
          src={BG}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain object-center"
          loading="lazy"
          priority={false}
          unoptimized
        />
      </div>
      {/* 距顶隙 = 卡片高 × 75/480（相对原先 90/480 再收 15px 当量），随模块等比缩放 */}
      <div
        className={[
          "absolute z-10 left-1/2 -translate-x-1/2 top-[15.625%]",
          "flex items-center justify-center gap-[12px] pointer-events-none",
          "max-w-[calc(100%-24px)]",
        ].join(" ")}
      >
        <GpuMicroTag label="GPU" />
        <div className="flex items-center gap-1 shrink-0 w-max min-w-0">
          <VizBracket
            className="shrink-0"
            style={{ height: BRACKET.height, width: BRACKET.width }}
          />
          <GreenNameSlot name={name} autoWidth />
          <VizBracket
            className="shrink-0"
            style={{
              height: BRACKET.height,
              width: BRACKET.width,
              transform: "scaleX(-1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
