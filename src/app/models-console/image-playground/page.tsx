"use client";

import { useAppSelector } from "@/store";
import Main from "@/app/models/image/components/Main/Main";
import CtxWrapper from "@/app/models/image/components/ContextWrapper";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import EnterprisePlanTips from "@/app/components/EnterprisePlanTips";
import { PERMISSION } from "@/constants/constants";
import "@/app/models/image/playground-global.scss";
import styles from "@/app/models/image/page.module.scss";

export default function ImagePlayground() {
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
          style={{ height: "100%" }}
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
