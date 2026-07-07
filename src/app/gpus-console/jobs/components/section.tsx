"use client";

import styles from "./section.module.scss";
import MainTable from "./mainTable";

export default function Section() {
  return (
    <div className={styles.subContainer}>
      <div className={styles.section}>
        <div>
          <MainTable />
        </div>
      </div>
    </div>
  );
}
