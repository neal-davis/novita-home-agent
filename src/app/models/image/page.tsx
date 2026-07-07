"use client";

import { useAppSelector } from "@/store";
import Main from "./components/Main/Main";
import CtxWrapper from "./components/ContextWrapper";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import EnterprisePlanTips from "@/app/components/EnterprisePlanTips";
import { PERMISSION } from "@/constants/constants";
import "./playground-global.scss";
import styles from "./page.module.scss";

export default function Home() {
  const noticeConfig = useAppSelector((state) => state.config.notice);

  return (
    <PermissionWrapper
      resourceGroup={PERMISSION.RESOURCE_GROUP.playground}
      resource={PERMISSION.RESOURCE.playground}
      action={PERMISSION.ACTION.all}
      loginRequired={false}
    >
      <CtxWrapper>
        <main
          className={`${styles.main} ${
            noticeConfig.show && styles.with_notice
          }`}
        >
          <div className={styles.divider}></div>
          <article
            className={`flex items-start justify-center`}
            style={{ height: "100%" }}
          >
            <Main />
          </article>
        </main>
        <EnterprisePlanTips />
      </CtxWrapper>
    </PermissionWrapper>
  );
}
