"use client";

import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";
import "swiper/css/autoplay";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import styles from "./Partners.module.scss";
import { cn } from "@/lib/utils";

const partners = [
  {
    id: "be-bee",
    src: "/mainpage/partners/be-bee.png",
    alt: "beBee",
    width: 90,
    height: 22,
    link: "https://www.bebee.com",
  },
  {
    id: "wiz-ai",
    src: "/mainpage/partners/wiz-ai.png",
    alt: "Wiz AI",
    width: 90,
    height: 22,
    link: "https://www.wiz.ai",
  },
  {
    id: "gizmo-ai",
    src: "/mainpage/partners/gizmo-ai.png",
    alt: "Gizmo AI",
    width: 90,
    height: 22,
    link: "https://gizmo.ai",
  },
  {
    id: "hygo",
    src: "/mainpage/partners/hygo.png",
    alt: "Hygo",
    width: 90,
    height: 22,
    link: "https://www.hygo.com",
  },
  {
    id: "tidb",
    src: "/mainpage/partners/tidb.png",
    alt: "TiDB",
    width: 90,
    height: 22,
    link: "https://cn.pingcap.com",
  },
  {
    id: "fish-audio",
    src: "/mainpage/partners/fish-audio.png",
    alt: "Fish Audio",
    width: 90,
    height: 22,
    link: "https://fish.audio",
  },
  {
    id: "monica",
    src: "/mainpage/partners/monica.png",
    alt: "Monica",
    width: 90,
    height: 22,
    link: "https://monica.im/en",
  },
  {
    id: "wavespeed",
    src: "/mainpage/partners/wavespeed.svg",
    alt: "Wavespeed",
    width: 138,
    height: 22,
    link: "https://www.wavespeed.ai",
  },
  {
    id: "quora",
    src: "/mainpage/partners/quora.svg",
    alt: "Quora",
    width: 72,
    height: 22,
    link: "https://www.quora.com",
  },
  {
    id: "hugging-face",
    src: "/mainpage/partners/huggingface.svg",
    alt: "Hugging Face",
    width: 113,
    height: 22,
    link: "https://huggingface.co",
  },
  {
    id: "openrouter",
    src: "/mainpage/partners/openrouter.svg",
    alt: "OpenRouter",
    width: 110,
    height: 22,
    link: "https://openrouter.ai",
  },
];

export default function CodingPlanPartners({
  containerClassName = undefined,
  customPartners = undefined,
}: {
  containerClassName?: string;
  customPartners?: typeof partners;
}) {
  const displayPartners = customPartners || partners;

  return (
    <div
      className={
        containerClassName
          ? cn(styles.container, containerClassName)
          : styles.container
      }
    >
      <Swiper
        modules={[Autoplay]}
        loop={true}
        autoplay={{
          delay: 0,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
          reverseDirection: false,
        }}
        speed={5000}
        spaceBetween={37}
        slidesPerView="auto"
        className={styles.swiper_wrap}
      >
        {displayPartners.concat(displayPartners).map((partner, index) => (
          <SwiperSlide key={`${partner.id}-${index}`} className={styles.slide}>
            <Link
              href={partner.link}
              target="_blank"
              className={styles.partner_item}
              id={`${CLICK_BTN_IDs.INDEX_BTNS.TRUSTED_BY}__${partner.id}`}
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                width={partner.width}
                height={partner.height}
                loading="lazy"
                style={{ objectFit: "contain" }}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
