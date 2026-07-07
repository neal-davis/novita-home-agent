"use client";

// import Link from "next/link";
import styles from "./PricingBanner.module.scss";
import { NOVITA_URL } from "@/constants/urls";
import getCampaignConfig from "@/config/campaign";
import BuildMonthTag from "@/app/components/buildMonth";

export function PricingBanner({ type = "pc" }: { type?: "pc" | "mobile" }) {
  const campaign = getCampaignConfig();

  if (!campaign.enabled) {
    return null;
  }

  return (
    <span
      className={`${styles.black_friday_link} xl:mx-[120px]`}
      // href={NOVITA_URL.BLACK_FRIDAY}
      onClick={(e) => {
        e.stopPropagation();
        window && window.open(`${NOVITA_URL.BLACK_FRIDAY}`);
      }}
    >
      <BuildMonthTag
        type="common"
        text={"up to 20% OFF"}
        className="absolute top-0 left-0 !rounded-[8px_0px]"
      />
      <span className={styles.build_month_title}>
        Build Month Pricing Is Here!
      </span>
      <span className={styles.build_month_desc}>
        <span
          className={`font-subtle text-[var(--white)] ${type === "mobile" ? "text-center" : ""}`}
        >
          Enjoy limited-time discounts on Models, GPUs, and Sandbox throughout
          Build Month.
        </span>
        <span className={styles.link}>
          <span
            onClick={(e) => {
              e.stopPropagation();
              window && window.open(`${NOVITA_URL.BLACK_FRIDAY}#questions`);
            }}
            className="font-subtle-button cursor-pointer text-[var(--white)]"
          >
            {"See event terms →"}
          </span>
        </span>
      </span>
    </span>
  );
}
