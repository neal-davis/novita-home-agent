"use client";

import styles from "./index.module.scss";
import { ConsoleCampaignBanner } from "@/app/components/campaigns";
import CodingPlanPartners from "./Partners";

export default function FirstPage() {
  return (
    <>
      <div className="pb-[80px]">
        <div className={styles.container}>
          <main
            className={`${styles.main} max_width_container pt-20 flex flex-row justify-center w-full`}
          >
            <div className={`${styles.content} mx-web w-full`}>
              <h2 className="font-h2 !text-[var(--dark-1)] mb-1">
                {"Novita Coding"}
              </h2>
              <h2 className={`${styles.subTitle} mb-8`}>
                {`More tokens with lower cost`}
                {/* {`lower cost`} */}
              </h2>
              <div className="pb-8 flex justify-center items-center gap-x-4 gap-y-2 flex-wrap">
                <div className="flex items-center gap-x-1">
                  <div className="w-4 h-4 border-[1px] border-[var(--dark-2)] rounded-full flex items-center justify-center">
                    <img
                      src="/coding-plan/checked.svg"
                      alt="checked"
                      width={11}
                      height={11}
                    />
                  </div>
                  <span className="font-p !text-[var(--dark-2)]">
                    {"Flexible monthly billing."}
                  </span>
                </div>
                <div className="flex items-center gap-x-1">
                  <div className="w-4 h-4 border-[1px] border-[var(--dark-2)] rounded-full flex items-center justify-center">
                    <img
                      src="/coding-plan/checked.svg"
                      alt="checked"
                      width={11}
                      height={11}
                    />
                  </div>
                  <span className="font-p !text-[var(--dark-2)]">
                    {"Cancel anytime."}
                  </span>
                </div>
                <div className="flex items-center gap-x-1">
                  <div className="w-4 h-4 border-[1px] border-[var(--dark-2)] rounded-full flex items-center justify-center">
                    <img
                      src="/coding-plan/checked.svg"
                      alt="checked"
                      width={11}
                      height={11}
                    />
                  </div>
                  <span className="font-p !text-[var(--dark-2)]">
                    {"No surprises."}
                  </span>
                </div>
              </div>
              <div
                onClick={() => {
                  const plansElement = document.getElementById("plans");
                  if (plansElement) {
                    window.scrollTo({
                      top: plansElement.offsetTop - 80,
                      behavior: "smooth",
                    });
                  }
                }}
                className="cursor-pointer p-3 inline-flex justify-center items-center flex-col gap-3">
                <img
                  src="/coding-plan/double-down.svg"
                  alt="double down"
                  width={24}
                  height={24}
                />
                <div className="font-p-button !text-[var(--brand-1)]">
                  {"View all plans"}
                </div>
              </div>
              <div className={`mt-[120px] flex justify-center items-center gap-6 ${styles.partnersContainer}`}>
                <div className="font-small-button text-[var(--dark-2)] min-w-[100px]">
                  {"TRUSTED BY"}
                </div>
                <div className="w-[calc(100%-100px)] text-[var(--dark-2)]">
                  <CodingPlanPartners />
                </div>
              </div>
            </div>
          </main>
        </div>
        <div className="max_width_container pt-[48px]">
          <div className="mx-web">
            <ConsoleCampaignBanner />
          </div>
        </div>
      </div>
    </>
  );
}
