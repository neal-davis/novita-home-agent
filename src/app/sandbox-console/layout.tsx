import { Metadata } from "next";
import ConsoleHeaderWrapper from "@/app/components/header/ConsoleHeaderWrapper";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Novita AI console",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleHeaderWrapper product="sandbox">
      <div className={styles.layout_container}>{children}</div>
    </ConsoleHeaderWrapper>
  );
}
