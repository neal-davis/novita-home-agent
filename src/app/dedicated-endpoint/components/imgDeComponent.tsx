import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import styles from "./imgDeComponent.module.scss";
import { PricingCalc } from "./pricingCalc";

export interface DEProduct {
  name: string;
  price: number;
  currency: string;
  period: number;
  unit: string;
  detail: Array<string>;
  id: string;
  origin_price: number;
  discount_price: number;
}

export default function ImgDeComponent({
  products,
  wrapperClassName,
  itemsClassName,
  themes,
  badgeStyle = true,
  badgeClassName,
}: {
  products: DEProduct[];
  wrapperClassName?: string;
  itemsClassName?: string[];
  themes?: Array<"dark" | "light">;
  badgeStyle?: boolean;
  badgeClassName?: string;
}) {
  return (
    <div className={cn(styles.container, wrapperClassName)}>
      {products.map((product, index) => (
        <div
          className={cn(styles.product, itemsClassName?.[index])}
          key={product.id}
        >
          <div className={styles.productHeader}>
            <div className={styles.productTitle}>
              <div
                className={cn(
                  badgeClassName,
                  badgeStyle && styles.productBadge,
                  themes?.[index] === "dark" && product.name !== "Pro"
                    ? "text-white"
                    : undefined,
                  product.name === "Pro" ? "text-[#000]" : undefined,
                )}
              >
                <span>{product.name}</span>
              </div>
              <h2
                className={
                  themes?.[index] === "dark" && product.name !== "Pro"
                    ? "text-white"
                    : product.name === "Pro"
                      ? "text-[#000]"
                      : undefined
                }
              >
                Get ridiculously fast inference sever with dedicated GPU
              </h2>
            </div>
          </div>

          <PricingCalc
            product={product}
            theme={product.name === "Pro" ? "light" : themes?.[index]}
          />

          <div className={styles.productFeatures}>
            <h3
              className={cn(
                "font-body-medium",
                themes?.[index] === "dark" && product.name !== "Pro"
                  ? "text-white"
                  : product.name === "Pro"
                    ? "text-[#000]"
                    : "text-common-dark-1",
              )}
            >{`What's included`}</h3>
            <ul>
              {product.detail.map((item, i) => (
                <li
                  key={i}
                  className={cn(
                    themes?.[index] === "dark" && product.name !== "Pro"
                      ? "!text-white"
                      : undefined,
                    product.name === "Pro" ? "!text-[#000]" : undefined,
                  )}
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-[var(--brand-0)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
