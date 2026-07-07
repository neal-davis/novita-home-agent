"use client";

import { useMemo, useState } from "react";
import styles from "./imgDeComponent.module.scss";
import { Minus, Plus } from "lucide-react";
import { DEProduct } from "./imgDeComponent";
import BuyImageDeButton from "./buyImageDe";
import { cn } from "@/lib/utils";

export function PricingCalc({
  product,
  theme = "light",
}: {
  product: DEProduct;
  theme?: "dark" | "light";
}) {
  const [count, setCount] = useState(1);

  const priceCalc = useMemo(() => {
    return (count * Number(product.price)).toFixed(2);
  }, [product.price, count]);

  const isPro = product.name === "Pro";

  return (
    <div>
      <div className={styles.productPrice}>
        <div
          className={cn(
            styles.priceContainer,
            theme === "dark" && !isPro ? "text-white" : "text-black",
            isPro ? "text-[#000]" : undefined,
          )}
        >
          <span className={styles.price}>${priceCalc}</span>
          <span
            className={cn(
              styles.priceUnit,
              theme === "dark" && !isPro
                ? "text-white"
                : isPro
                  ? "text-[#000]"
                  : "text-common-dark-2",
            )}
          >
            {" "}
            Per month
          </span>
        </div>
      </div>
      <div className={styles.productActions}>
        <div
          className={cn(
            styles.quantitySelector,
            theme === "dark" ? "border-none" : undefined,
            "bg-white",
          )}
        >
          <button
            className={styles.quantityButton}
            onClick={() =>
              setCount((pre) => {
                if (pre === 1) return 1;
                return pre - 1;
              })
            }
          >
            <Minus
              className={cn("w-4 h-4", isPro ? "text-[#000]" : undefined)}
            />
          </button>
          <span
            className={cn(styles.quantity, isPro ? "text-[#000]" : undefined)}
          >
            {count}
          </span>
          <button
            className={styles.quantityButton}
            onClick={() => setCount(count + 1)}
          >
            <Plus
              className={cn("w-4 h-4", isPro ? "text-[#000]" : undefined)}
            />
          </button>
        </div>
        <BuyImageDeButton count={count} product={product} />
      </div>
    </div>
  );
}
