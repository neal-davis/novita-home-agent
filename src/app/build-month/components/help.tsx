import { DISCORD_INVITE_LINK, SUPPORT_EMAIL_LINK } from "@/constants/urls";
import styles from "./help.module.scss";

export function Help() {
  return (
    <section className={styles.container}>
      <div className="max_width_container">
        <div className="px-web">
          <div className={styles.content}>
            <div className={styles.textContent}>
              <h3 className={styles.heading}>Still have questions?</h3>
              <h3 className={styles.heading}>Our team is here to help!</h3>
            </div>
            <div className={styles.links}>
              <a
                href={`mailto:${SUPPORT_EMAIL_LINK}`}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {SUPPORT_EMAIL_LINK}
              </a>
              <a
                href={DISCORD_INVITE_LINK}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join our Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
