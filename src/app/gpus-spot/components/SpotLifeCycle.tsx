"use client";

import styles from "./SpotLifeCycle.module.scss";
import { useI18nSubscription } from "@/i18n/provider";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getList() {
  return [
    {
      index: "01",
      title: "Launch",
      desc: "Instance enters running state",
    },
    {
      index: "02",
      title: "1-Hour Protection",
      desc: "No interruptions during this period",
    },
    {
      index: "03",
      title: "Interruption Window",
      desc: "After protection ends, instance may be reclaimed",
    },
    {
      index: "04",
      title: "Termination Notice",
      desc: "Sent 1 hour in advance",
    },
    {
      index: "05",
      title: "Forced Termination",
      desc: "Instance is stopped and released automatically",
    },
  ];
}

export default function SpotLifeCycle() {
  useI18nSubscription();
  const list = getList();
  return (
    <div className="bg-[var(--gray-3)]">
      <div className="py-[80px] max_width_container">
        <div className="font-h3 text-[var(--dark-1)] text-center mb-[8px]">
          Spot Instance Lifecycle
        </div>
        <div className="font-body text-[var(--dark-2)] max-w-[700px] mx-auto text-center mb-[48px]">
          1-hour guaranteed runtime, then interruptible with 1-hour notice
          before automatic reclaim Spot uses spare capacity—low cost,
          reclaimable anytime.
        </div>
        <div className={`flex flex-row gap-[-1px] flex-wrap ${styles.list}`}>
          {list.map((item, index) => (
            <div key={index} className={styles.item}>
              <div className="flex flex-row items-center gap-[12px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="9"
                  height="12"
                  viewBox="0 0 9 12"
                  fill="none"
                >
                  <path d="M9 6L0 11.1962L0 0.803848L9 6Z" fill="#23D57C" />
                </svg>
                <span className={styles.index}>{item.index}</span>
              </div>
              <div>
                <div className="font-h5 text-[var(--dark-1)] mb-[16px]">
                  {item.title}
                </div>
                <div className="font-subtle text-[var(--dark-1)]">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[32px] text-center mx-auto">
          <span className="inline font-body-medium text-[var(--dark-1)]">
            Note:
          </span>{" "}
          <span className="inline font-body text-[var(--dark-1)]">
            Workloads should be interruption-tolerant. Use checkpointing or
            backups to prevent data loss.
          </span>
        </div>
      </div>
    </div>
  );
}
