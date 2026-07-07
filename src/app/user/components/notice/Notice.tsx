"use client";

import { useAppSelector } from "@/store";
import styles from "./notice.module.scss";

export function Notice({
  title = "新用户注册，立得 ¥5 免费额度",
  description = "约1600万 Qwen2-7B tokens",
}: {
  title?: string;
  description?: string;
}) {
  const inviteTeam = useAppSelector((state) => state.user.teamInvite.teamName);

  if (inviteTeam) {
    return (
      <div className={styles.team_invite_tips}>
        <span>您已被邀请加入 </span>
        <span className={styles.invite_team}>{inviteTeam}</span>
        <span> 的团队</span>
      </div>
    );
  }

  return (
    <div className={styles.notice_container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>
    </div>
  );
}
