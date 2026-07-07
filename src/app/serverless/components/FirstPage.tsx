import ApplyPopover from "@/app/components/ApplyPopover";
import Image from "next/image";
import styles from "./FirstPage.module.scss";
export default function FirstPage({ copy }: { copy?: unknown }) {
  return (
    <div className={styles.wrap}>
      <div
        className={`flex flex-row flex-wrap max_width_container ${styles.content}`}
      >
        <div className={`flex-1 ${styles.info}`}>
          <h2 className={styles.slogan}>
            {"Serverless AI Deployment Made Simple"}
          </h2>
          <p className={styles.description}>
            {
              "Easily deploy AI applications with elastic scalability and automatic load balancing. Just upload your private models or images, and we'll handle the rest — no server management required."
            }
          </p>
          <ApplyPopover
            buttonText={"Try Now"}
            applyTips={
              "Discord and contact the salesperson, activate the trial qualification, get a large trial fee"
            }
          />
        </div>
        <div>
          <Image
            alt="serverless"
            quality={100}
            src="/serverless/main.png"
            width={459}
            height={466}
          />
        </div>
      </div>
    </div>
  );
}
