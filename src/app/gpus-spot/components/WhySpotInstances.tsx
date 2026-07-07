"use client";

import styles from "./WhySpotInstances.module.scss";
import { useI18nSubscription } from "@/i18n/provider";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getList() {
  return [
    {
      title: "Save Up to 50%",
      desc: "Pay half the on-demand rate",
    },
    {
      title: "Built-in Protection",
      desc: "Guaranteed 1-hour initial runtime",
    },
    {
      title: "Advance Notice",
      desc: "1-hour termination alerts via API, email, or console",
    },
    {
      title: "Flexible Deployment",
      desc: "Combine with on-demand or reserved instances for the right balance of cost and stability",
    },
  ];
}

export default function GPUPricing() {
  useI18nSubscription();
  const list = getList();
  return (
    <div className="!my-[80px] flex flex-col items-center max_width_container">
      <div className="font-h3 text-[var(--dark-1)] text-center mb-[8px]">
        Why Spot Instances
      </div>
      <div className="font-body text-[var(--dark-2)] text-center mb-[48px]">
        Run workloads at a fraction of the cost—without sacrificing reliability
      </div>
      <div className={`flex flex-row gap-[-1px] flex-wrap ${styles.list}`}>
        {list.map((item, index) => (
          <div key={index} className={styles.item}>
            <img
              src={`/gpus-spot/why${index + 1}.svg`}
              alt={item.title}
              width={32}
              height={32}
            />
            <div className="font-h6 text-[var(--dark-1)] text-center">
              {item.title}
            </div>
            <div className="font-subtle text-[var(--dark-1)] text-center">
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
