import Image from "next/image";
import ApplyPopover from "@/app/components/ApplyPopover";
import styles from "./Deployment.module.scss";
export default function Deployment({ copy }: { copy?: unknown }) {
  return (
    <div className={styles.wrap}>
      <div className="max_width_container">
        <h2 className={styles.title}>{"Private Image, Quick Deployment"}</h2>
        <div className={styles.subContainer}>
          <p className={styles.description}>
            {
              "Support private image pulls from DockerHub or custom image uploads. Quickly deploy instances and scale them on-demand without affecting running services."
            }
          </p>
        </div>
        <div className="flex flex-row justify-center">
          <Image
            alt="serverless console demo"
            quality={100}
            src="/serverless/serverless-console-demo.png"
            width={1045}
            height={412}
          />
        </div>
      </div>

      <div className={styles.config}>
        <div className="flex flex-row items-center justify-between flex-wrap max_width_container">
          <Image
            alt="serverless config"
            quality={100}
            src="/serverless/config.png"
            width={558}
            height={387}
            className="mb-8"
          />
          <div className={styles.content}>
            <h3 className={`${styles.title} ${styles.sub_title}`}>
              {"Ready to Use, Easy Configuration"}
            </h3>
            <p className={`${styles.description} ${styles.sub_description}`}>
              {
                "Configure custom elastic scaling strategies through a simple interface. Adjust in real time, with support for template-based creation, no complex operations needed."
              }
            </p>
            <ApplyPopover
              buttonText={"Deploy Now"}
              applyTips={
                "Discord and contact the salesperson, activate the trial qualification, get a large trial fee"
              }
            />
          </div>
        </div>
      </div>

      <div className={styles.cold_start}>
        <div className="flex flex-row items-center flex-wrap justify-between max_width_container">
          <div className={styles.content}>
            <h3 className={`${styles.title} ${styles.sub_title}`}>
              {"Instant Cold Start"}
            </h3>
            <p className={`${styles.description} ${styles.sub_description}`}>
              {
                "Through optimized preloading, our platform minimizes cold start delays, ensuring your business operations are always responsive."
              }
            </p>
          </div>
          <Image
            alt="serverless cold start"
            quality={100}
            src="/serverless/cold-start.png"
            width={537}
            height={362}
          />
        </div>
      </div>

      <div className={styles.log}>
        <div className="flex flex-row items-center flex-wrap justify-between max_width_container">
          <Image
            alt="serverless log"
            quality={100}
            src="/serverless/log.png"
            width={671}
            height={401}
            className={`${styles.img_shadow} mb-8`}
          />
          <div className={styles.content}>
            <h3 className={`${styles.title} ${styles.sub_title}`}>
              {"Real-Time Logs, Monitoring"}
            </h3>
            <p className={`${styles.description} ${styles.sub_description}`}>
              {
                "Retain and review logs in real time. Monitor key metrics and task execution, giving you full visibility into your running instances and ensuring smooth operations."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
