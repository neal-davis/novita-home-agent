"use client";

import { DISCORD_INVITE_LINK, SUPPORT_EMAIL_LINK } from "@/constants/urls";
import styles from "./index.module.scss";

export default function MoreQuestion() {
  return (
    <div className="max_width_container py-[80px]">
      <div className={`mx-web flex ${styles.moreQuestionContainer} gap-4`}>
        <div className="flex-[2]">
          <h3 className="font-h3 text-[var(--dark-1)] text-start">
            {"Still have questions?"}
          </h3>
          <h3 className="font-h3 text-[var(--dark-1)] text-start">
            {"Our team is here to help!"}
          </h3>
        </div>
        <div className={`flex-1 inline-flex flex-col items-start ${styles.moreLinksContent}`}>
          <a
            className="font-p text-[var(--dark-2)] hover:underline 
            hover:underline-offset-[4px] hover:decoration-[var(--dark-2)]"
            href={`mailto:${SUPPORT_EMAIL_LINK}`} target="_blank" rel="noopener noreferrer">
            {SUPPORT_EMAIL_LINK}
          </a>
          <a
            className="font-p text-[var(--dark-2)] hover:underline 
            hover:underline-offset-[4px] hover:decoration-[var(--dark-2)]"
            href={DISCORD_INVITE_LINK} target="_blank" rel="noopener noreferrer">
            Join our Discord
          </a>
        </div>
      </div>
    </div>)
}