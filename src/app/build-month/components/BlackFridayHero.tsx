"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./BlackFridayHero.module.scss";

export const BlackFridayHero = () => {
  return (
    <div className={styles.hero}>
      {/* Decoration Images */}
      <Image
        src="/black-friday/decoration_top_right.png"
        alt=""
        width={357}
        height={256}
        className={styles.decoration_top_right}
        priority
      />
      <Image
        src="/black-friday/decoration_bottom_left.png"
        alt=""
        width={255}
        height={448}
        className={styles.decoration_bottom_left}
        priority
      />

      <div className={styles.content}>
        {/* Top label */}
        <p className={styles.top_label}>The Best Deals for Developers</p>

        {/* Label with badge and date */}
        <div className={styles.label}>
          <span className={styles.badge}>Novita Build Month 2025</span>
          <span className={styles.date}>
            Event Period: Nov 24 – Dec 31 (PST)
          </span>
        </div>

        {/* Main title */}
        <h1 className={styles.title}>Build More,Spend Less</h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          Ship AI models, agents, and workloads faster — now with{" "}
          <span className={styles.highlight}>up to 20% OFF</span> across all
          major products.
        </p>

        {/* CTA Buttons */}
        <div className={styles.buttons}>
          <div className={styles.button_with_label}>
            <Button size="lg" asChild>
              <Link href={NOVITA_URL.CONSOLE}>Start Building</Link>
            </Button>
            <p className={styles.limited_time_offer}>Limited Time Offer</p>
          </div>

          <Button size="lg" variant="outline" asChild>
            <Link href="#products">View all Models</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
