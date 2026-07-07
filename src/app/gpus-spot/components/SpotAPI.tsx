"use client";

import { Button } from "@/components/ui/button";
import styles from "./SpotAPI.module.scss";
import Link from "next/link";
import { DOCS_URL } from "@/constants/urls";
import { useI18nSubscription } from "@/i18n/provider";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getList() {
  return [
    {
      title: "Get Pricing",
      desc: "Real-time Spot rates",
    },
    {
      title: "Check Availability",
      desc: "GPU capacity by model",
    },
    {
      title: "Launch Instances",
      desc: "Provision Spot with billing_type=spot",
    },
    {
      title: "Handle Interruptions",
      desc: "Subscribe to termination events via API, or email",
    },
  ];
}

export default function GPUPricing() {
  useI18nSubscription();
  const list = getList();
  return (
    <div className="!my-[80px] flex flex-col items-center max_width_container">
      <div className="font-h3 text-[var(--dark-1)] text-center mb-[8px]">
        APIs & Automation
      </div>
      <div className="font-body text-[var(--dark-2)] text-center mb-[48px]">
        Manage Spot instances programmatically with full API support
      </div>
      <div className={`flex flex-row gap-[-1px] flex-wrap ${styles.list}`}>
        {list.map((item, index) => (
          <div key={index} className={styles.item}>
            <img
              src={`/gpus-spot/api${index + 1}.svg`}
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
      <div className="mt-[32px]">
        <Button variant="default" asChild>
          <Link href={DOCS_URL.GPU_CREATE_INSTANCES} target="_blank">
            Explore API Docs
          </Link>
        </Button>
      </div>
    </div>
  );
}
