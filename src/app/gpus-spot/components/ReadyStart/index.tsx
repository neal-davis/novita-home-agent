import { Button } from "@/components/ui/button";
import styles from "./index.module.scss";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import ReadyStartAnimation from "./lottie-animation";

export default function ReadyStart() {
  return (
    <div className={`${styles.outContainer} max_width_container`}>
      <div className={styles.container}>
        <div className={styles.subMobileBg}>
          <ReadyStartAnimation />
        </div>
        <div className={styles.subBg}>
          <ReadyStartAnimation />
        </div>
        <div className={`${styles.cards}`}>
          <div className={styles.left}>{"Start at Half the Cost"}</div>
          <div className={styles.right}>
            <div className={`${styles.top} pl-[8px]`}>
              <div className={styles.dot}>Up to 50% lower cost</div>
              <div className={styles.dot}>1-hour guaranteed runtime</div>
              <div className={styles.dot}>1-hour advance notice</div>
            </div>
            <div className={styles.bottom}>
              <Button
                size="lg"
                asChild
                id={CLICK_BTN_IDs.FOOTER_READY_BANNER_BTNS.STARTED}
              >
                <Link
                  href={`${NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE}?spot=1`}
                >
                  Deploy Spot Instance
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
