"use client";

import ConsoleHeaderWrapper from "@/app/components/header/ConsoleHeaderWrapper";
import styles from "./layout.module.scss";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleHeaderWrapper product="billing">
      <div className={styles.container}>{children}</div>
    </ConsoleHeaderWrapper>
  );
}
