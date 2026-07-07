import Image from "next/image";
import ApplyPopover from "@/app/components/ApplyPopover";
import styles from "./Features.module.scss";
export default function Features({ copy }: { copy?: unknown }) {
  return (
    <div className={`max_width_container ${styles.wrap}`}>
      <h2 className={styles.title}>
        <span>{"Focus on AI Building, We'll Handle the Rest"}</span>
        <span className={styles.subTitle}>
          {
            "Deliver flexible, scalable compute power to your AI workloads with ease."
          }
        </span>
      </h2>
      <div className={`flex flex-row flex-wrap ${styles.item_wrap}`}>
        <div className={styles.feature_item}>
          <Image
            alt="cost"
            quality={100}
            src="/serverless/cost.png"
            width={380}
            height={291}
          />
          <h3 className={styles.sub_title}>{"Pay as you go, save costs"}</h3>
          <p className={styles.description}>
            {
              "Only pay for the compute time you use, with auto-scaling to match demand. No upfront commitments, lowering operational expenses."
            }
          </p>
        </div>
        <div className={styles.feature_item}>
          <Image
            alt="icon"
            quality={100}
            src="/serverless/flex.png"
            width={380}
            height={291}
          />
          <h3 className={styles.sub_title}>
            {"Elastic scaling, high availability"}
          </h3>
          <p className={styles.description}>
            {
              "Handle unpredictable workloads effortlessly with our elastic scaling and industry-grade reliability. Your operations stay fast, secure, and highly available."
            }
          </p>
        </div>
        <div className={styles.feature_item}>
          <Image
            alt="serverless deploy"
            quality={100}
            src="/serverless/deploy.png"
            width={380}
            height={291}
          />
          <h3 className={styles.sub_title}>
            {"Private Images, Quick Deployment"}
          </h3>
          <p className={styles.description}>
            {
              "Easily pull or upload your private images from DockerHub. Spin up instances fast and get your AI applications running in no time, with minimal setup required."
            }
          </p>
        </div>
      </div>
      <div
        className={`flex flex-row justify-between items-center flex-wrap ${styles.banner}`}
      >
        <div className={`flex flex-col justify-center ${styles.left}`}>
          <h3 className={styles.banner_title}>{"Scale Based on Demand"}</h3>
          <p className={styles.banner_description}>
            {
              "Dynamically assign computing power to handle business-critical requests. Lower the complexity of scaling, ensuring uninterrupted operations."
            }
          </p>
          <ApplyPopover
            buttonText={"Deploy Now"}
            applyTips={
              "Discord and contact the salesperson, activate the trial qualification, get a large trial fee"
            }
            buttonType="boxWhite"
          />
        </div>
        <Image
          alt="serverless feature banner"
          quality={100}
          src="/serverless/feature-banner.png"
          width={712}
          height={330}
        />
      </div>
    </div>
  );
}
