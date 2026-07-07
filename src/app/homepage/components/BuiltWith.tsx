"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
import CarouselNavButton from "./CarouselNavButton";
import { useI18nSubscription } from "@/i18n/provider";

interface UseCase {
  title?: string;
  subtitle?: string;
  href?: string;
  bgImage?: string;
  icon?: string;
}

function CardImage({ title, subtitle, href, bgImage, icon }: UseCase) {
  return (
    <a
      href={href || ""}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-[370px] w-[322px] shrink-0 overflow-hidden border border-[var(--border-subtle)] text-left no-underline"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgImage}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full scale-[1.2] object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover:scale-150 motion-reduce:scale-100 motion-reduce:transition-none"
        />
      </div>
      <div className="absolute top-[52px] left-[22px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={icon || ""}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-[106px] w-auto"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end gap-space-24 p-space-24">
        <div className="relative flex shrink-0 flex-col gap-space-16">
          <p className="min-h-[var(--heading-h5-line-height)] shrink-0 truncate font-heading-h5 text-text-1">
            {title || ""}
          </p>
          <p className="line-clamp-2 min-h-[calc(2*var(--paragraph-20-line-height))] shrink-0 font-paragraph-18 text-text-3">
            {subtitle || ""}
          </p>
        </div>
        <span className="relative flex size-[var(--space-24)] items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/build-with/arrow-up-right.png"
            alt=""
            aria-hidden="true"
            className="size-[var(--space-24)]"
          />
        </span>
      </div>
    </a>
  );
}

const CARD_WIDTH = 354;

/** Links/buttons inside the scroller must not participate in drag-to-scroll (pointer capture + click suppression). */
const INTERACTIVE_DRAG_SKIP_SELECTOR =
  "a, button, input, select, textarea, [role='link'], [role='button']";

function isInteractivePointerTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest(INTERACTIVE_DRAG_SKIP_SELECTOR))
  );
}

export default function BuiltWith({
  buildWithConfig,
}: {
  buildWithConfig: UseCase[];
}) {
  useI18nSubscription();

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [userCases, setUserCases] = useState<UseCase[]>([]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 1);
    setCanScrollNext(el.scrollLeft < maxScrollLeft - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    const userCasesTmp = [];
    for (let i = 0; i < buildWithConfig.length; i++) {
      userCasesTmp.push({
        title: buildWithConfig[i]?.title || "",
        subtitle: buildWithConfig[i]?.subtitle || "",
        href: buildWithConfig[i]?.href || "",
        bgImage:
          buildWithConfig[i]?.bgImage ||
          `/home/build-with/bg0${(i % 6) + 1}.png`,
        icon: buildWithConfig[i]?.icon || "",
      });
    }
    setUserCases(userCasesTmp);
  }, [buildWithConfig]);

  useEffect(() => {
    // Cards are rendered from async config after the first scroll-state measure.
    // Re-measure on the next frame so the nav disabled state uses the real scroll width.
    const frameId = window.requestAnimationFrame(updateScrollState);
    return () => window.cancelAnimationFrame(frameId);
  }, [updateScrollState, userCases.length]);

  function scrollPrev() {
    scrollRef.current?.scrollBy({ left: -CARD_WIDTH, behavior: "smooth" });
  }

  function scrollNext() {
    scrollRef.current?.scrollBy({ left: CARD_WIDTH, behavior: "smooth" });
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      el.scrollLeft += event.deltaX;
      updateScrollState();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [updateScrollState]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    if (isInteractivePointerTarget(event.target)) return;

    const el = scrollRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = el.scrollLeft;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;

    const el = scrollRef.current;
    if (!el) return;

    const deltaX = event.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 4) hasDraggedRef.current = true;
    el.scrollLeft = dragStartScrollLeftRef.current - deltaX;
    updateScrollState();
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    isDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!hasDraggedRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    hasDraggedRef.current = false;
  }

  return (
    <section className="w-full bg-bg-default py-[80px]">
      <div className="mx-auto max-w-[1440px] px-[48px]">
        <div className="flex flex-col gap-[24px]">
          <SectionEyebrow label="Built with Novita AI" />
          <div className="flex items-center justify-between">
            <CarouselNavButton
              direction="previous"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              label="Previous"
            />
            <CarouselNavButton
              direction="next"
              onClick={scrollNext}
              disabled={!canScrollNext}
              label="Next"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-[24px] w-full max-w-[1440px] px-[48px]">
        <div
          ref={scrollRef}
          className="cursor-grab overflow-x-auto active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          onScroll={updateScrollState}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={handleClickCapture}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex">
            {userCases.map((item: UseCase, i: number) => (
              <div
                key={i}
                className="flex-none w-[354px] flex flex-col px-[16px] py-[16px]"
              >
                <CardImage {...item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
