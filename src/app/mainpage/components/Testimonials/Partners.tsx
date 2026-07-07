"use client";

import Image from "next/image";
import styles from "./Partners.module.scss";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { useCallback, useRef, useState, useEffect } from "react";
import { useI18nSubscription } from "@/i18n/provider";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getListOrigin() {
  return [
    {
      no: "ALEX, CTO",
      description: `"Novita has been instrumental in optimizing our AI workflows at <span class="text-[var(--brand-0)] cursor-pointer hover:text-[var(--brand-1)]" onclick="window.open('https://www.bebee.com', '_blank')">beBee.com</span>, powering over 90% of our token usage with exceptional performance and competitive pricing. Their support is unparalleled—truly 11 out of 10—and far exceeds that of other providers we've worked with. We're excited to continue scaling with Novita."`,
      subDesc: "Javier Cámara-Rica, Co-Founder and CEO",
      link: "Go to Case Study",
      link_url: "https://blogs.novita.ai/case-study-bebee",
      id: `${CLICK_BTN_IDs.INDEX_BTNS.TRUSTED_BY}__bebee`,
    },
    {
      no: "ALEX, CTO",
      description: `"Novita has been a huge help for us at Fish Audio. Their reliable GPU infrastructure allows us focus on developing and improving our text-to-speech models instead of dealing with hardware headaches. Their support and performance have made it much easier to push our work forward."`,
      subDesc: "Shijia Liao, Founder and CEO",
    },
    {
      no: "ALEX, CTO",
      description: `"Novita's Model API was super simple to integrate, and it's been great in powering our AI-driven flashcards and quizzes. The platform takes care of the heavy lifting, so we can focus on building better learning tools for our users without worrying about infrastructure or scaling issues."`,
      subDesc: "Petros Christodoulou, Co-Founder and CEO",
    },
    {
      no: "ALEX, CTO",
      description: `"Working with Novita has completely simplified how we deploy, scale, and host our AI models. Their platform is reliable and efficient, making it easy to manage even complex deployments. They've quickly proven to be a dependable partner we can trust to support our needs!"`,
      subDesc: "Wei Zhu, Solution Architect",
    },
  ];
}

// Create infinite loop data using visual trick
const createInfiniteList = (originalList: any[]) => {
  // Add cloned data before and after original data
  // Structure: [cloned last, original data, cloned first]

  return [
    // Clone last items at the beginning
    ...originalList.map((item, index) => ({
      ...item,
      _isClone: true,
      _originalIndex: index,
      _cloneType: "tail",
    })),
    // Original data
    ...originalList.map((item, index) => ({
      ...item,
      _isClone: false,
      _originalIndex: index,
    })),
    // Clone first items at the end
    ...originalList.map((item, index) => ({
      ...item,
      _isClone: true,
      _originalIndex: index,
      _cloneType: "head",
    })),
  ];
};

export default function Partners() {
  useI18nSubscription();
  const listOrigin = getListOrigin();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState(false);
  const [, setLeftScrollable] = useState(false);
  const [, setRightScrollable] = useState(true);
  const [, setContainerWidth] = useState(0);
  const [, setCalcWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Create infinite loop data
  const infiniteList = createInfiniteList(listOrigin);
  const originalLength = listOrigin.length;
  const cardWidth = 512; // Card width
  const cardGap = 24; // Card gap
  const totalCardWidth = cardWidth + cardGap;

  // Calculate container width and scroll distance
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateDimensions = () => {
        const screenWidth = window.screen.width;
        setContainerWidth(screenWidth);
        setCalcWidth(0);
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  // Check if can scroll left
  const judgeLeftScrollable = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const currentPosition = scrollContainer.scrollLeft;
      // Consider cloned nodes position
      const realPosition = currentPosition - originalLength * totalCardWidth;
      setLeftScrollable(realPosition > 0);
    } else {
      setLeftScrollable(false);
    }
  }, [originalLength, totalCardWidth]);

  // Check if can scroll right
  const judgeRightScrollable = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const currentPosition = scrollContainer.scrollLeft;
      const realPosition = currentPosition - originalLength * totalCardWidth;
      const maxScrollPosition = (originalLength - 1) * totalCardWidth;
      setRightScrollable(realPosition < maxScrollPosition);
    } else {
      setRightScrollable(false);
    }
  }, [originalLength, totalCardWidth]);

  // Initialize scroll state and position
  useEffect(() => {
    setTimeout(() => {
      // Initialize scroll to first real image position (no animation)
      if (scrollContainerRef.current) {
        // Temporarily disable all scroll animations
        scrollContainerRef.current.style.transition = "none";
        scrollContainerRef.current.style.scrollBehavior = "auto";
        scrollContainerRef.current.scrollLeft = originalLength * totalCardWidth;
        // Restore animations immediately
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.style.transition = "all 0.8s";
            scrollContainerRef.current.style.scrollBehavior = "smooth";
          }
        }, 10);
      }
      judgeLeftScrollable();
      judgeRightScrollable();
    }, 100);
  }, [
    judgeLeftScrollable,
    judgeRightScrollable,
    originalLength,
    totalCardWidth,
  ]);

  // Handle wheel event
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      setMark(true);

      if (Math.abs(e.deltaX) !== 0 && Math.abs(e.deltaY) !== 0) {
        return;
      }
      judgeLeftScrollable();
      judgeRightScrollable();
    },
    [judgeLeftScrollable, judgeRightScrollable],
  );

  // Handle scroll event - implement true infinite loop
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && !isTransitioning) {
      const scrollContainer = scrollContainerRef.current;
      const scrollLeft = scrollContainer.scrollLeft;

      // Calculate real position (subtract cloned nodes offset)
      const realPosition = scrollLeft - originalLength * totalCardWidth;

      // If scrolled to cloned last item (actual last original item)
      if (realPosition >= originalLength * totalCardWidth) {
        setIsTransitioning(true);
        // Instantly jump to first real item (no animation)
        scrollContainer.style.transition = "none";
        scrollContainer.style.scrollBehavior = "auto";
        scrollContainer.scrollLeft = originalLength * totalCardWidth;
        setTimeout(() => {
          scrollContainer.style.transition = "all 0.8s";
          scrollContainer.style.scrollBehavior = "smooth";
          setIsTransitioning(false);
        }, 10);
      }
      // If scrolled to cloned first item (actual first original item)
      else if (realPosition <= -totalCardWidth) {
        setIsTransitioning(true);
        scrollContainer.style.transition = "none";
        scrollContainer.style.scrollBehavior = "auto";
        const targetPosition = (originalLength * 2 - 1) * totalCardWidth;
        scrollContainer.scrollLeft = targetPosition;
        setTimeout(() => {
          scrollContainer.style.transition = "all 0.8s";
          scrollContainer.style.scrollBehavior = "smooth";
          setIsTransitioning(false);
        }, 10);
      }
    }

    // Update button status
    judgeLeftScrollable();
    judgeRightScrollable();
  }, [
    judgeLeftScrollable,
    judgeRightScrollable,
    originalLength,
    totalCardWidth,
    isTransitioning,
  ]);

  // Scroll to left
  const handlePrevClick = useCallback(() => {
    if (scrollContainerRef.current && !isTransitioning) {
      setMark(false);
      const scrollDistance = totalCardWidth;
      scrollContainerRef.current.scrollLeft -= scrollDistance;
      setTimeout(() => {
        judgeLeftScrollable();
        judgeRightScrollable();
      }, 500);
    }
  }, [
    judgeLeftScrollable,
    judgeRightScrollable,
    totalCardWidth,
    isTransitioning,
  ]);

  // Scroll to right
  const handleNextClick = useCallback(() => {
    if (scrollContainerRef.current && !isTransitioning) {
      setMark(false);
      const scrollDistance = totalCardWidth;
      scrollContainerRef.current.scrollLeft += scrollDistance;
      setTimeout(() => {
        judgeLeftScrollable();
        judgeRightScrollable();
      }, 500);
    }
  }, [
    judgeLeftScrollable,
    judgeRightScrollable,
    totalCardWidth,
    isTransitioning,
  ]);

  return (
    <>
      <div className={styles.swiper_wrap}>
        <div
          className={`swiper-button-prev scale-50 ${styles.swiper_button_prev}`}
          style={{ color: "var(--black)" }}
          onClick={handlePrevClick}
        >
          <span
            className={`iconfont icon-arrow-left ${styles.swiper_button_icon}`}
          ></span>
        </div>

        <div
          onWheel={handleWheel}
          onScroll={handleScroll}
          ref={scrollContainerRef}
          className={styles.swiper_container}
          style={{
            width: "100%",
            transition: !mark && !isTransitioning ? "all 0.8s" : "none",
          }}
        >
          {infiniteList.map((item: any, index: number) => (
            <span
              key={`${item._cloneType || "original"}-${
                item._originalIndex || index
              }`}
              style={{
                marginRight: index === infiniteList.length - 1 ? "0" : "0",
              }}
            >
              <div className={styles.card_container}>
                <Image
                  src="/homepage/testimonials/topBar.png"
                  alt="polygon"
                  className={styles.topBar}
                  width={100}
                  height={8}
                />
                <div className={styles.top}>
                  <div className={styles.top}>
                    <span className={styles.left}>
                      <Image
                        style={
                          (item._originalIndex + 1) % 4 === 1
                            ? { scale: "0.8", marginLeft: "-10px" }
                            : {}
                        }
                        src={
                          "/homepage/testimonials/" +
                          ((item._originalIndex + 1) % 4) +
                          ".png"
                        }
                        alt="logo"
                        width={148}
                        height={43}
                      />
                    </span>
                  </div>
                </div>
                <div className={styles.bottom}>
                  <div
                    className={styles.top}
                    style={{ height: "170px" }}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  ></div>
                  <div className={styles.person}>{item.subDesc}</div>
                  <div className={styles.bottomBtn}>
                    {item.link && (
                      <Button variant="outline">
                        <Link href={item.link_url} target="_blank" id={item.id}>
                          {item.link}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </span>
          ))}
        </div>

        <div
          className={`swiper-button-next scale-50 ${styles.swiper_button_next}`}
          style={{ color: "var(--black)" }}
          onClick={handleNextClick}
        >
          <span
            className={`iconfont icon-arrow-right ${styles.swiper_button_icon}`}
          ></span>
        </div>
      </div>

      <div className={styles.mobile_swiper_wrap}>
        {listOrigin.map((item: any, index: number) => (
          <div key={index} className={styles.card_container}>
            <Image
              src="/homepage/testimonials/topBar.png"
              alt="polygon"
              className={styles.topBar}
              width={100}
              height={8}
            />
            <div className={styles.top}>
              <div className={styles.top}>
                <span className={styles.left}>
                  <Image
                    style={
                      (index + 1) % 4 === 1
                        ? { scale: "0.8", marginLeft: "-10px" }
                        : {}
                    }
                    src={"/homepage/testimonials/" + ((index + 1) % 4) + ".png"}
                    alt="logo"
                    width={148}
                    height={43}
                  />
                </span>
              </div>
            </div>
            <div className={styles.bottom}>
              <div
                className={styles.top}
                dangerouslySetInnerHTML={{ __html: item.description }}
              ></div>
              <div className={styles.person}>{item.subDesc}</div>
              {item.link && (
                <div className={styles.bottomBtn}>
                  <Button variant="outline">
                    <Link href={item.link_url} target="_blank" id={item.id}>
                      {item.link}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
