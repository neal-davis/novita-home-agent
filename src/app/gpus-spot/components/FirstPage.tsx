import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./FirstPage.module.scss";

export default async function FirstPage() {
  return (
    <div className={styles.gridBackground}>
      <div className={`max_width_container ${styles.firstPage}`}>
        {/* <FirstPageAnimation>
        <div className={styles.bg}></div>
      </FirstPageAnimation> */}
        <main className={`${styles.mainInfo} mx-web flex flex-col lg:flex-row`}>
          <div className="max-w-[600px] flex flex-col items-start relative z-2">
            <h1 className="font-h1 !text-[var(--dark-1)] max-w-[500px] mb-[24px]">
              {"Spot GPU Instances"}
            </h1>
            <h3 className="font-h3 !text-[var(--dark-1)] max-w-[550px] mb-[20px]">
              {"Up to 50% off – RTX 4090 from only $0.18/hour"}
            </h3>
            <div className="font-p text-[#4F4E4A] mb-[32px] max-w-[594px]">
              {
                "Default 1-hour protection, 1-hour advance termination notice, fully compatible with traditional Spot workflows. Best suited for workloads tolerant to interruptions"
              }
            </div>
            <div className="relative mb-[32px] flex gap-[20px] flex-wrap" style={{ zIndex: 1 }}>
              <Button size="lg" asChild>
                <Link
                  href={`${NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE}?spot=1`}
                >
                  Deploy Spot Instance
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`${NOVITA_URL.PRICING}?gpu=1`}>View Pricing</Link>
              </Button>
            </div>
            <div className="flex gap-[12px] items-center">
              <span className={`font-body text-[var(--black)] ${styles.gpuTypeText}`}>
                GPU Types Available:
              </span>
              <span className={styles.gpuType}>4090</span>
              <span className={styles.gpuType}>A100</span>
              <span className={styles.gpuType}>H100</span>
            </div>
          </div>
          <div className="flex-shrink-0 lg:w-[516px] flex items-center justify-end -mr-[40px] -mt-[40px]">
            <div className="w-[480px] h-[480px] bg-[url('/gpus-spot/header-bg.png')] bg-contain bg-no-repeat bg-center"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
