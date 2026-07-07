"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./ResetForm.module.scss";
import { useAppDispatch } from "@/store";
import { useCallback, useEffect, useState } from "react";
import { sendResetPwdEmail } from "@/api/user";
import { logout } from "@/store/slice/userSlice";
import { NOVITA_URL } from "@/constants/urls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateConfig } from "../../components/utils";

export function ResetForm() {
  const router = useRouter();
  const path = usePathname();
  const search = useSearchParams();
  const routerEmail = search.get("email");
  const from = search.get("from");
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [validateResult, setValidateResult] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const fromConsole = from === "console";

  const validateForm = useCallback((email: string) => {
    const [, res] = validateConfig.email(email);
    setValidateResult((pre) => ({
      ...pre,
      email: res,
    }));
    return res;
  }, []);

  useEffect(() => {
    if (!email && routerEmail) {
      setEmail(routerEmail);
    }
  }, [routerEmail, email]);

  const submitForm = useCallback(() => {
    const errorRes = validateForm(email);
    if (errorRes) {
      return;
    }
    setLoading(true);
    sendResetPwdEmail(email)
      .then(() => {
        if (fromConsole) {
          dispatch(logout());
        }
        router.push(
          `${NOVITA_URL.USER_LOGIN}?notice_type=reset&email=${email}`,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [validateForm, email, fromConsole, router, dispatch]);

  return (
    <div className={styles.form_wrap}>
      <div className={styles.title}>Reset Password</div>
      <div className={styles.description}>
        We will email you instructions for resetting your password.
      </div>
      <div className={styles.form_container}>
        <Input
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            const nextEmail = e.target.value;
            setEmail(nextEmail);
            if (validateResult.email) {
              validateForm(nextEmail);
            }
          }}
          onBlur={() => {
            validateForm(email);
          }}
        />
      </div>
      {validateResult.email && (
        <div className="text-red-500 text-sm">{validateResult.email}</div>
      )}
      <div
        className="flex justify-between"
        style={{
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {!fromConsole && (
          <Button
            style={{
              width: fromConsole ? "100%" : "calc(50% - 10px)",
              fontFamily: "var(--font-family) !important",
            }}
            variant="outline"
            onClick={() => {
              router.back();
            }}
            page="console"
            className="!text-sm !h-[40px]"
          >
            Back
          </Button>
        )}
        <Button
          onClick={() => {
            submitForm();
          }}
          disabled={!email || loading}
          style={{
            width: fromConsole ? "100%" : "calc(50% - 10px)",
            fontFamily: "var(--font-family) !important",
          }}
          page="console"
          className="!text-sm !h-[40px]"
        >
          Confirm
        </Button>
      </div>
      {fromConsole ? (
        <div style={{ height: 48 }} className={styles.logoutTips}>
          Resetting your password will log you out of your current account
        </div>
      ) : (
        <div className={styles.form_footer}>
          Need to create an account?{" "}
          <span
            className="underline cursor-pointer hover:text-primary"
            onClick={() => {
              router.push(NOVITA_URL.USER_REGISTER);
            }}
          >
            Sign up
          </span>
        </div>
      )}
    </div>
  );
}
