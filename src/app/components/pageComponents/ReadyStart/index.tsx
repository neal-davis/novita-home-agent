import { Button } from "@/components/ui/button";
import styles from "./index.module.scss";
import LinkWithAuthority from "@/app/components/LinkWithAuthority";
import { NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import ReadyStartAnimation from "./lottie-animation";
import { BookDemo } from "@/app/mainpage/components/BookDemo";

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
          <div className={styles.left}>
            {"Ready to build smarter? Start today."}
          </div>
          <div className={styles.right}>
            <div className={styles.top}>
              {
                "Get started with Novita AI and unlock the power of affordable, reliable, and scalable AI inference for your applications."
              }
            </div>
            <div className={styles.bottom}>
              <Button
                size="lg"
                asChild
                id={CLICK_BTN_IDs.FOOTER_READY_BANNER_BTNS.STARTED}
              >
                <LinkWithAuthority href={NOVITA_URL.CONSOLE}>
                  Get Started
                </LinkWithAuthority>
              </Button>
              <BookDemo outClassName="!ml-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
