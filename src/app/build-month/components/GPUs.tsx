"use client";

// import { useEffect, useState } from "react";
import outStyles from "./Products.module.scss";
import styles from "./GPUs.module.scss";
import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import Link from "next/link";
// import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { ToQuestions } from "./ToQuestions";

export default function GPUs({
  activeProducts = [],
}: {
  activeProducts: any[];
}) {
  return (
    <div>
      <div className={outStyles.badge_container}>
        <span className={outStyles.badge_primary}>UP TO 20% OFF</span>
        <span className={outStyles.badge_secondary}>
          <span>Novita Build Month 2025</span>
        </span>
      </div>
      <h3 className={outStyles.product_title}>
        Globally distributed GPUs with local speed
      </h3>
      <p className={outStyles.product_description}>
        <div>
          Take advantage of our high-performance GPU instances at up to 20% off!
        </div>
        <div>
          Launch in seconds across global regions, perfect for training and
          inferencing.
        </div>
      </p>
      <div className={styles.product_cards_container}>
        {activeProducts.map((product: any) => (
          <div className={styles.product_card} key={product.productId}>
            <div className="font-h5 text-[var(--dark-1)]">
              {product.productName}
            </div>
            <div className="font-subtle-button text-[var(--dark-1)]">{`${product.gpuMemory} GB VRAM`}</div>
            <div className="w-full h-[1px] bg-[var(--gray-2)] my-[-8px]"></div>
            <div className="flex items-center justify-between w-full">
              <span className="text-[var(--dark-1)] font-subtle-button">
                {"On-demand"}
              </span>
              <span className="font-subtle-button flex items-center gap-[2px]">
                <span>
                  <span className="text-[var(--brand-1)]">
                    $
                    {Math.round(
                      (Number(product?.instancePrice?.discount || 0) / 100000) *
                        Math.pow(10, 2),
                    ) / Math.pow(10, 2)}{" "}
                    /hr/GPU
                  </span>
                </span>
                {product?.instancePrice?.discount !==
                  product?.instancePrice?.price && (
                  <span className="text-[var(--gray-1)] font-subtle-button line-through">
                    {`$${
                      Math.round(
                        (Number(product?.instancePrice?.price || 0) / 100000) *
                          Math.pow(10, 2),
                      ) / Math.pow(10, 2)
                    } /hr/GPU`}
                  </span>
                )}
              </span>
            </div>
            <div>
              <Button size="sl" asChild>
                <Link href={NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE}>
                  Start Now
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-right mt-6">
        <ToQuestions />
      </div>
    </div>
  );
}
