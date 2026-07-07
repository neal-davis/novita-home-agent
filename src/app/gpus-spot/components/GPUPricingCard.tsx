"use client";

import styles from "./GPUPricingCard.module.scss";
import { NOVITA_URL } from "@/constants/urls";
import { useRouter } from "next/navigation";

export default function GPUPricingCard({ priceInfo }: { priceInfo: any }) {
  const router = useRouter();
  function getDiscount() {
    const discount = Math.round(
      ((Number(priceInfo.price) - Number(priceInfo.spotPrice)) /
        Number(priceInfo.price)) *
        100,
    );
    if (discount > 0) {
      return discount;
    } else {
      return "-";
    }
  }
  return (
    <div
      className={`${styles.box} cursor-pointer min-w-[250px]`}
      onClick={() => {
        router.push(`${NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE}?spot=1`);
      }}
    >
      <div className={styles.name}>
        <span className={styles.name1}>{priceInfo.title1}</span>{" "}
        <span className={styles.name2}>{priceInfo.title2}</span>
      </div>
      {priceInfo.spotPrice && (
        <div className={`flex items-center gap-2 mb-[8px]`}>
          <span className="font-body text-[var(--white)]">Spot:</span>
          <span>
            <span className="font-h6 text-[var(--brand-0)]">
              ${priceInfo.spotPrice}
            </span>
            <span className="font-subtle text-[var(--white)]">/hr/GPU</span>
          </span>
        </div>
      )}
      <div
        className={`font-subtle text-[var(--white)] flex items-center gap-2 mb-[12px] line-through`}
      >
        On-demand: ${priceInfo.price}
        /hr/GPU
      </div>
      <div className={styles.save}>
        <img src="/gpus-spot/wave.svg" className="w-4 h-4" alt="wave" />
        <span className="text-[var(--brand-0)]">Save {getDiscount()}%</span>
      </div>
    </div>
  );
}
