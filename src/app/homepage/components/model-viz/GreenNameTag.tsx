"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const greenTagSurface: React.CSSProperties = {
  background: `linear-gradient(90deg, var(--alpha-dark-10), var(--alpha-dark-10)), linear-gradient(90deg, var(--brand-0), var(--brand-0))`,
  borderColor: "color-mix(in srgb, var(--brand-0) 50%, var(--white))",
};

/** Figma 绿标（MODEL / cluster 等轮播用）— 与 Inference viz 一致，颜色走 design token */
export function GreenNameTag({ name }: { name: string }) {
  return (
    <div
      className="flex items-center justify-center pl-[8px] pr-[6px] py-[5px] rounded-4 border border-solid whitespace-nowrap"
      style={greenTagSurface}
    >
      <span className="font-tt-mono text-[13px] leading-[1.2] tracking-[0.52px] uppercase text-white">
        {name}
      </span>
    </div>
  );
}

type GreenNameSlotProps = {
  name: string;
  /**
   * 与最长文案匹配，保证滑入动效不裁切（Inference viz / BareMetal 等固定画板用）。
   * 当 `autoWidth` 为 true 时忽略。
   */
  slotWidth?: number;
  /**
   * 宽度随当前（及过渡中的下一条）绿标内容测量结果变化，避免固定像素裁切长文案。
   */
  autoWidth?: boolean;
};

/**
 * 纵向滑入换词（与 Product 区 Inference viz 的 VizNameSlot 行为一致）
 */
export function GreenNameSlot({
  name,
  slotWidth,
  autoWidth = false,
}: GreenNameSlotProps) {
  const [curr, setCurr] = useState(name);
  const [next, setNext] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const measureCurrRef = useRef<HTMLDivElement>(null);
  const measureNextRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  useEffect(() => {
    if (name === curr) return;

    setNext(name);
    setAnimating(false);

    let raf2: number | undefined;
    let tid: ReturnType<typeof setTimeout> | undefined;

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setAnimating(true);
        tid = setTimeout(() => {
          setCurr(name);
          setNext(null);
          setAnimating(false);
        }, 320);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== undefined) cancelAnimationFrame(raf2);
      if (tid !== undefined) clearTimeout(tid);
    };
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!autoWidth) {
      return;
    }
    const w1 = measureCurrRef.current?.getBoundingClientRect().width ?? 0;
    const w2 =
      next !== null
        ? (measureNextRef.current?.getBoundingClientRect().width ?? 0)
        : 0;
    setMeasuredWidth(Math.ceil(Math.max(w1, w2, 1)));
  }, [autoWidth, curr, next]);

  const transitionCls = animating
    ? "transition-transform duration-300 ease-in-out"
    : "";

  const resolvedWidth = autoWidth ? (measuredWidth ?? 112) : (slotWidth ?? 112);

  return (
    <div
      className="relative h-[40px] overflow-hidden shrink-0 transition-[width] duration-300 ease-in-out"
      style={{ width: resolvedWidth }}
    >
      {autoWidth && (
        <div
          className="pointer-events-none absolute left-0 top-full z-0 flex flex-col gap-0 opacity-0"
          aria-hidden
        >
          <div ref={measureCurrRef} className="w-fit shrink-0">
            <GreenNameTag name={curr} />
          </div>
          {next !== null && (
            <div ref={measureNextRef} className="w-fit shrink-0">
              <GreenNameTag name={next} />
            </div>
          )}
        </div>
      )}
      <div
        className={`absolute inset-x-0 z-10 h-full flex items-center justify-center ${transitionCls}`}
        style={{ transform: animating ? "translateY(-110%)" : "translateY(0)" }}
      >
        <GreenNameTag name={curr} />
      </div>
      {next !== null && (
        <div
          className={`absolute inset-x-0 z-10 h-full flex items-center justify-center ${transitionCls}`}
          style={{
            transform: animating ? "translateY(0)" : "translateY(110%)",
          }}
        >
          <GreenNameTag name={next} />
        </div>
      )}
    </div>
  );
}
