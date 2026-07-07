import Link from "next/link";
import styles from "./Pricing.module.scss";
import { dealMoney } from "@/lib/utils/money";
import { NOVITA_URL } from "@/constants/urls";
import {
  type GpuData,
  type GpuLandingPageContent,
} from "../gpuLandingPageData";

export default async function FirstPage({
  content,
  gpuData,
  productData,
}: {
  content: GpuLandingPageContent;
  gpuData: GpuData;
  productData: any;
}) {
  return (
    <div className={`max_width_container py-[90px]`}>
      <div className="px-web">
        <div className={`${styles.container}`}>
          <div className={styles.head}>
            <div>
              <h2 className="font-h4 mb-[6px]">
                {gpuData.model} {content.pricing.title}
              </h2>
              <p className="font-body text-[var(--dark-2)]">
                {content.pricing.coupon.text}
              </p>
            </div>
          </div>
          <div className={styles.content_wrapper}>
            <div className={styles.content}>
              <div className="font-small-console">
                {content.pricing.limited.label}
              </div>
              <h3 className="font-h5 mb-[12px]">
                {gpuData.model} {content.pricing.onDemand.label}
              </h3>
              <p className="font-subtle">{content.pricing.subjectPrice.text}</p>
              <div className="font-h5 text-[var(--brand-0)]">
                {productData.instancePrice.discount
                  ? `${"$"}${dealMoney(
                      +productData.instancePrice.discount,
                    )}/GPU/${content.pricing.hour.label}`
                  : "-"}
              </div>
            </div>
            {productData && (
              <div className={styles.go_link_wrapper}>
                <Link
                  className={styles.go_link}
                  href={NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE}
                >
                  <span className={styles.go_link_icon}></span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
