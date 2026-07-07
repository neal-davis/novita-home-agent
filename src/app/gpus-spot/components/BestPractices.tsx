"use client";

import styles from "./BestPractices.module.scss";
import { useI18nSubscription } from "@/i18n/provider";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getList() {
  return [
    {
      index: "01",
      title: "Enable Checkpointing",
      desc: "Save training state regularly to persistent storage",
    },
    {
      index: "02",
      title: "Design Retryable Workloads",
      desc: "Break jobs into smaller units with resume/retry",
    },
    {
      index: "03",
      title: "Adopt Mixed Strategies",
      desc: "Run critical workloads on on-demand, offload flexible ones to Spot",
    },
    {
      index: "04",
      title: "Respond Quickly",
      desc: "Use termination notifications to trigger backup or shutdown logic",
    },
  ];
}

export default function BestPractices() {
  useI18nSubscription();
  const list = getList();
  return (
    <div className="!py-[80px] flex flex-col items-center max_width_container">
      <div className="font-h3 text-[var(--dark-1)] text-center mb-[48px]">
        Best Practices
      </div>
      <div className={`flex flex-row w-full flex-wrap ${styles.list}`}>
        {list.map((item, index) => (
          <div key={index} className={styles.item}>
            <div className="flex flex-row items-center gap-[12px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="9"
                viewBox="0 0 12 9"
                fill="none"
              >
                <path d="M6 0L11.1962 9H0.803848L6 0Z" fill="#23D57C" />
              </svg>
              <span className={styles.index}>{item.index}</span>
            </div>
            <div className="flex flex-col gap-[18px]">
              <div className="font-h5 text-[var(--dark-1)]">{item.title}</div>
              <div className="font-subtle text-[var(--dark-1)]">
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className="px-[24px] py-[20px] bg-[#FEEBEB] mt-[24px] w-full"
        style={{
          backdropFilter: "blur(25px)",
        }}
      >
        <div className="font-body text-[#F23030]">
          Notice: Spot is best for flexible workloads. Use on-demand or reserved
          for mission-critical applications.
        </div>
      </div>
    </div>
  );
}
