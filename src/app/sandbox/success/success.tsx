"use client";

import styles from "./page.module.scss";

export default function Success() {
  return (
    <div className={`${styles.success_page} max_width_container`}>
      <div
        className={`${styles.success_page_content} flex flex-col items-center max-w-[820px] ml-auto mr-auto px-web`}
      >
        <h1 className="font-h3 mb-[32px] text-center text-[var(--dark-1)]">
          Operation Success
        </h1>
        <p className="font-p text-center mb-[32px] text-[var(--dark-2)]">
          Your operation has been completed successfully.
        </p>
      </div>
    </div>
  );
}
