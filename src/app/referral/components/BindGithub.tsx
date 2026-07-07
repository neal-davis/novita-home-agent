"use client";

import React, { useState } from "react";
import {
  githubBinding,
  ThirdPartLoginButton,
} from "@/app/user/components/third-part-login-button";
import styles from "./BindGithub.module.scss";
import { AFFILIATE_INVITE_URL_KEY } from "@/constants/constants";
import Cookies from "js-cookie";
const BindGithub: React.FC<{
  invitedCode: string;
  isSubAccount: boolean;
}> = ({ invitedCode, isSubAccount }) => {
  const [loading, setLoading] = useState(false);
  return (
    <div className={styles.bind_github}>
      <div className="max_width_container relative">
        <div className={styles.bg}></div>
        <div className="mx-web flex flex-col items-end">
          <div className={styles.card}>
            <h3>Verify to start receiving vouchers</h3>
            <p className={styles.description}>
              To start receiving vouchers, connect and verify your GitHub
              account
            </p>
            <ThirdPartLoginButton
              type="github"
              text="Connect GitHub"
              className={styles.github_button}
              disabled={true}
              onClick={() => {
                Cookies.set(AFFILIATE_INVITE_URL_KEY, invitedCode);
                setLoading(true);
                githubBinding();
              }}
              loading={loading}
            />
            {isSubAccount && (
              <p className={styles.sub_account_tip}>
                <span className="iconfont icon-badge-alert mr-2"></span>
                {
                  "You're currently using a team account. Only team owners can verify the account."
                }
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BindGithub;
