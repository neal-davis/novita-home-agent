"use client";
import { useContext } from "react";
import styles from "./page.module.scss";
import { Context } from "./ClientWrapper";

export function ClientConversions() {
  const { affiliate } = useContext(Context);
  return (
    <div className={styles.conversion_container}>
      <div className={styles.box}>
        <div className={styles.title1}>Commission Earned ($)</div>
        <div className={styles.desc1}>
          You earn 10% from all referred spending.
        </div>
        <div className={styles.value}>${affiliate?.balance}</div>
      </div>
      <div className={styles.box}>
        <div className={styles.title1}>Invites</div>
        <div className={styles.desc1}>Number of users you‘ve referred.</div>
        <div className={styles.value}>{affiliate?.invites}</div>
      </div>
    </div>
  );
}
