"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import styles from "./Register.module.scss";
import {
  githubBinding,
  githubLogin,
  googleLogin,
  huggingfaceLogin,
  ThirdPartLoginButton,
} from "@/app/user/components/third-part-login-button";
import { useRouter } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";
import { inviteCodeVerify } from "@/api/user";
import { message } from "@/components/ui/standard/notify";
import StepDecorator from "./StepDecorator";
import { AFFILIATE_INVITE_URL_KEY } from "@/constants/constants";
import Cookies from "js-cookie";
interface RegisterProps {
  invitedCode: string;
  registered: boolean;
  isSubAccount: boolean;
}

const Register: React.FC<RegisterProps> = ({
  invitedCode,
  registered,
  isSubAccount,
}) => {
  const router = useRouter();

  const [inviteCode, setInviteCode] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [huggingfaceLoading, setHuggingfaceLoading] = useState(false);
  const handleClick = async (cb?: () => void) => {
    if (inviteCode) {
      try {
        const result = await inviteCodeVerify(inviteCode);
        if (result && result.isValid) {
          cb?.();
        } else {
          message.error("Invalid invitation code");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      cb?.();
    }
  };

  useEffect(() => {
    setInviteCode(invitedCode);
  }, [invitedCode]);

  return (
    <div className={styles.register}>
      <div className={styles.title_wrapper}>
        <div className="max_width_container">
          <div className="mx-web">
            <h3>How to earn</h3>
          </div>
        </div>
      </div>
      <main className={`${styles.main} max_width_container`}>
        <div className="mx-web">
          <div className={styles.step_wrapper}>
            <h4 className="flex items-center gap-2">
              <StepDecorator
                completed={registered}
                active={!inviteCode && !registered}
                step={1}
              />
              <span>Enter invite code</span>
            </h4>
            {!registered && (
              <Input
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.trim());
                }}
                placeholder="Enter invite code"
                className="w-[280px] mt-4"
                disabled={!!invitedCode}
              />
            )}
          </div>
          <div className={styles.step_wrapper}>
            <h4 className="flex items-center gap-2">
              <StepDecorator
                completed={registered}
                active={!!inviteCode}
                step={2}
              />
              <span>Create an account</span>
              {registered && (
                <span>
                  <img
                    src={"/affiliate/circle-check.svg"}
                    alt="finish"
                    width={24}
                    height={24}
                    style={{
                      marginTop: "7px",
                    }}
                  />
                </span>
              )}
            </h4>
            {!registered && (
              <div className={styles.operation_wrapper}>
                <ThirdPartLoginButton
                  className="w-[218px]"
                  disabled={true}
                  onClick={() => {
                    handleClick(() => {
                      localStorage.setItem("redirect", NOVITA_URL.REFERRAL);
                      router.push(
                        `${NOVITA_URL.USER_REGISTER}?${AFFILIATE_INVITE_URL_KEY}=${inviteCode}`,
                      );
                    });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="/affiliate/mail.svg"
                      alt="email"
                      width={20}
                      height={20}
                    />
                    <span>Register via email</span>
                  </div>
                </ThirdPartLoginButton>
                <ThirdPartLoginButton
                  type="google"
                  className="w-[218px]"
                  disabled={true}
                  onClick={() => {
                    handleClick(() => {
                      Cookies.set(AFFILIATE_INVITE_URL_KEY, inviteCode);
                      Cookies.set("redirect", NOVITA_URL.REFERRAL);
                      setGoogleLoading(true);
                      googleLogin();
                    });
                  }}
                  loading={googleLoading}
                />
                <ThirdPartLoginButton
                  type="github"
                  className="w-[218px]"
                  loading={githubLoading}
                  disabled={true}
                  onClick={() => {
                    handleClick(() => {
                      Cookies.set(AFFILIATE_INVITE_URL_KEY, inviteCode);
                      Cookies.set("redirect", NOVITA_URL.REFERRAL);
                      setGithubLoading(true);
                      githubLogin();
                    });
                  }}
                />
                <ThirdPartLoginButton
                  type="huggingface"
                  loading={huggingfaceLoading}
                  className="w-[218px]"
                  disabled={true}
                  onClick={() => {
                    handleClick(() => {
                      Cookies.set(AFFILIATE_INVITE_URL_KEY, inviteCode);
                      Cookies.set("redirect", NOVITA_URL.REFERRAL);
                      setHuggingfaceLoading(true);
                      huggingfaceLogin();
                    });
                  }}
                />
              </div>
            )}
          </div>
          <div className={styles.step_wrapper}>
            <h4 className="flex items-center gap-2">
              <StepDecorator completed={false} active={registered} step={3} />
              <span>Verify your GitHub account</span>
            </h4>
            <p className={styles.description}>
              To start receiving vouchers, connect and verify your GitHub
              account
            </p>
            <div className={styles.operation_wrapper}>
              <ThirdPartLoginButton
                className={styles.bind_github_button}
                loading={githubLoading}
                disabled={true}
                onClick={() => {
                  Cookies.set("redirect", NOVITA_URL.REFERRAL);
                  setGithubLoading(true);
                  githubBinding();
                }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={"/logo/github.svg"}
                    alt="github"
                    width={22}
                    style={{
                      opacity: registered ? 1 : 0.5,
                    }}
                  />
                  <span>Connect GitHub</span>
                </div>
              </ThirdPartLoginButton>
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
      </main>
    </div>
  );
};

export default Register;
