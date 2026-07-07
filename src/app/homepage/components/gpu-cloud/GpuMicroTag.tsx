import Image from "next/image";

type GpuMicroTagProps = {
  label: string;
};

/** 白底 + 黑框 + 左侧 gpu-icon（Figma 与计划统一用 gpu-icon-menu.png） */
export function GpuMicroTag({ label }: GpuMicroTagProps) {
  return (
    <div className="bg-white border border-black border-solid flex gap-[6px] items-center pl-[3px] pr-[6px] py-[2px] rounded-[3px] shrink-0">
      <Image
        src="/home/product/gpu-icon-menu.png"
        alt=""
        width={20}
        height={20}
        loading="lazy"
        className="shrink-0 size-5"
        unoptimized
      />
      <span className="font-tt-mono text-[12px] leading-[1.2] tracking-[0.48px] uppercase text-element-high-em whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
