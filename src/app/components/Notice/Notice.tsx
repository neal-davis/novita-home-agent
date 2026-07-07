"use client";
import Link from "next/link";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { closeNotice, closeNoticeForever } from "@/store/slice/configSlice";
import { mobileCheck } from "@/lib/utils/utils";
import { useLayoutEffect, useRef, useState } from "react";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { cn } from "@/lib/utils";
import { getCustomNoticeHeight } from "@/hooks/useHeaderHeight";
/** 右侧斜切白底模块 — 与历史 clip-path 一致（左下斜入黑区） */
const DISMISS_CLIP =
  "polygon(var(--dismiss-clip) 0, 100% 0, 100% 100%, 0 100%)" as const;
const processContent = (text: string, keyPrefix: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const innerText = part.slice(2, -2);
      return (
        <span key={`${keyPrefix}-${index}`} className="font-bold">
          {innerText}
        </span>
      );
    }
    return <span key={`${keyPrefix}-${index}`}>{part}</span>;
  });
};
/** 有 url 时：整段主文案可点（与原 Notice 一致），不再单独做 Learn More */
function NoticeClickableBody({
  href,
  noticeName,
  className,
  children,
}: {
  href: string;
  noticeName: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className={cn(
        "text-[var(--brand-0)] no-underline transition-opacity hover:underline hover:opacity-90",
        className,
      )}
      onClick={() => {
        analytics.trackClick(CLICK_BTN_IDs.NOTICE_BAR_ID, {
          notice_name: noticeName,
        });
      }}
    >
      {children}
    </Link>
  );
}
export default function Notice({
  height,
  page: _page,
  position,
  content,
  url,
}: {
  height?: number;
  page?: "playground" | "console";
  position?: "relative";
  content?: string;
  url?: string;
}) {
  const dispatch = useAppDispatch();
  const noticeConfig = useAppSelector((state) => state.config.notice);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dismissRef = useRef<HTMLDivElement>(null);
  const [dismissWidth, setDismissWidth] = useState(0);
  const customNoticeHeight = getCustomNoticeHeight(height, noticeConfig.height);
  const rawContent = content ?? noticeConfig.content;
  const urlFinal = url || noticeConfig.url;
  const segments = rawContent
    .split("|||")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const primary = segments[0] ?? "";
  const secondary = segments[1];
  useLayoutEffect(() => {
    const el = dismissRef.current;
    if (!el) return;
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const measure = () =>
      setDismissWidth(mobileQuery.matches ? 0 : el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    mobileQuery.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mobileQuery.removeEventListener("change", measure);
    };
  }, []);
  const handleCloseClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (mobileCheck()) {
      dispatch(closeNoticeForever());
      return;
    }
    dispatch(closeNotice());
  };
  const handleForeverClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    dispatch(closeNoticeForever());
  };
  const noticeHeightStyle = customNoticeHeight
    ? ({
        ["--notice-height" as string]: `${customNoticeHeight}px`,
      } as CSSProperties)
    : undefined;
  const isFixed = position !== "relative";
  return (
    <div
      ref={wrapperRef}
      className={cn("w-full", isFixed ? "h-[var(--notice-height)]" : "")}
      style={noticeHeightStyle}
    >
      {isFixed ? (
        <div aria-hidden="true" className="h-[var(--notice-height)] w-full" />
      ) : null}
      <div
        className={cn(
          "isolate left-0 top-0 z-[1000] flex h-[var(--notice-height)] w-full items-stretch overflow-hidden",
          "bg-black",
          isFixed ? "fixed" : "relative",
        )}
      >
        <div
          className="relative z-[1] flex h-[var(--notice-height)] min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden px-1.5 py-0 text-center sm:px-2 md:px-6 md:py-2"
          style={dismissWidth ? { paddingRight: dismissWidth } : undefined}
        >
          {secondary ? (
            <>
              <div className="hidden w-full min-h-0 flex-col items-center justify-center gap-1 md:flex md:gap-1.5">
                {urlFinal ? (
                  <NoticeClickableBody
                    href={urlFinal}
                    noticeName={noticeConfig.name}
                    className="flex min-h-0 flex-col items-center justify-center gap-1 md:gap-1.5"
                  >
                    <div className="font-mono-14 font-normal uppercase leading-5 tracking-[0.6px]">
                      {processContent(primary, "d0")}
                    </div>
                    <div className="font-mono-14 font-normal uppercase leading-5 tracking-[0.6px] text-[var(--brand-0)]/85">
                      {processContent(secondary, "d1")}
                    </div>
                  </NoticeClickableBody>
                ) : (
                  <>
                    <div className="font-mono-14 font-normal uppercase leading-5 tracking-[0.6px] text-[var(--brand-0)]">
                      {processContent(primary, "d0")}
                    </div>
                    <div className="font-mono-14 font-normal uppercase leading-5 tracking-[0.6px] text-[var(--brand-0)]/85">
                      {processContent(secondary, "d1")}
                    </div>
                  </>
                )}
              </div>
              <div className="flex w-full min-h-0 flex-col items-center justify-center gap-1 md:hidden">
                {urlFinal ? (
                  <NoticeClickableBody
                    href={urlFinal}
                    noticeName={noticeConfig.name}
                    className="block w-full min-w-0 max-w-full truncate text-balance text-center font-tt-mono text-[12px] font-normal uppercase leading-4 tracking-[0.45px]"
                  >
                    {processContent(primary, "m0")}
                  </NoticeClickableBody>
                ) : (
                  <p className="block w-full min-w-0 max-w-full truncate text-balance text-center font-tt-mono text-[12px] font-normal uppercase leading-4 tracking-[0.45px]">
                    {processContent(primary, "m0")}
                  </p>
                )}
              </div>
            </>
          ) : urlFinal ? (
            <NoticeClickableBody
              href={urlFinal}
              noticeName={noticeConfig.name}
              className="block w-full min-w-0 max-w-full truncate text-balance text-center font-tt-mono text-[12px] font-normal uppercase leading-4 tracking-[0.45px] md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-1.5 md:gap-y-1 md:text-[14px] md:leading-5 md:tracking-[0.6px]"
            >
              {processContent(primary, "s0")}
            </NoticeClickableBody>
          ) : (
            <div className="block w-full min-w-0 max-w-full truncate text-balance text-center font-tt-mono text-[12px] font-normal uppercase leading-4 tracking-[0.45px] md:text-[14px] md:leading-5 md:tracking-[0.6px]">
              {processContent(primary, "n0")}
            </div>
          )}
        </div>

        <div
          ref={dismissRef}
          className={cn(
            "relative z-[2] -my-px flex h-[calc(var(--notice-height)+2px)] shrink-0 items-center bg-white text-[var(--gray-950)] md:absolute md:-bottom-px md:-top-px md:right-0 md:my-0 md:h-auto",
            "[--dismiss-clip:18px] pl-5 pr-1 sm:pl-6 sm:pr-1.5 md:gap-4 md:pl-12 md:pr-4 md:[--dismiss-clip:36px]",
          )}
          style={{ clipPath: DISMISS_CLIP }}
        >
          <span
            role="button"
            tabIndex={0}
            title={"DON'T SHOW AGAIN"}
            className={cn(
              "hidden shrink-0 cursor-pointer select-none whitespace-nowrap font-mono-14 font-normal uppercase leading-5 tracking-[0.6px] text-[var(--gray-950)] underline-offset-2 hover:underline md:inline",
            )}
            onClick={handleForeverClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                dispatch(closeNoticeForever());
              }
            }}
          >
            {"DON'T SHOW AGAIN"}
          </span>
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded text-[var(--gray-950)] transition-colors hover:bg-[var(--gray-100)]"
            aria-label={"Close notice"}
            onClick={handleCloseClick}
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
