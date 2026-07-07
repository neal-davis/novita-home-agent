import React from "react";
import Image from "next/image";
import styles from "./FirstPage.module.scss";

const FirstPage: React.FC<{
  isSubAccount: boolean;
  isRelatedGithub: boolean;
}> = ({ isSubAccount, isRelatedGithub }) => {
  return (
    <div className={`${styles.firstPage} max_width_container`}>
      <div className="mx-web">
        <main className={styles.mainInfo}>
          <div>
            <p className={`${styles.title} mb-4`}>Give $10,</p>
            <p className={styles.title}>Earn $10</p>
            <h4 className={styles.sub_title}>In LLM API credits</h4>
            <p className={styles.description}>
              Refer a friend to Novita and both earn $10 in LLM API credits—up
              to $500 total.
            </p>
          </div>
          <div>
            <Image
              src="/affiliate/referral-bg.png"
              alt="affiliate"
              width={405}
              height={348}
              priority
            />
          </div>
        </main>
        {isRelatedGithub && isSubAccount && (
          <p className={styles.sub_account_tip}>
            <span className="iconfont icon-badge-alert mr-2"></span>
            {
              "You're currently using a team account. Only team owners are eligible to participate in this referral program."
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default FirstPage;
