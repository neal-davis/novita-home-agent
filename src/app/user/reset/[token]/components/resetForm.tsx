"use client";

import styles from "./resetForm.module.scss";
import { useCallback, useState } from "react";
import { resetPwd } from "@/api/user";
import { useSearchParams, useRouter } from "next/navigation";
import { message } from "@/components/ui/standard/notify";
import { LabelPassword } from "@/app/user/components/label-input";
import { validateConfig } from "@/app/user/components/utils";
import { Button } from "@/components/ui/button";

export default function ResetForm({ token }: { token: string }) {
  const query = useSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [validateResult, setValidateResult] = useState({
    password: "",
    confirmPassword: "",
  });

  const validate = useCallback(
    (
      key?: "password" | "confirmPassword",
      values?: {
        password?: string;
        confirmPassword?: string;
      },
    ) => {
      const pwdValidateFn = validateConfig.pwd;
      const nextPassword = values?.password ?? password;
      const nextConfirmPassword = values?.confirmPassword ?? confirmPassword;
      if (key) {
        const [isValid, msg] = pwdValidateFn(
          key === "password" ? nextPassword : nextConfirmPassword,
        );
        setValidateResult((pre) => ({
          ...pre,
          [key]: msg,
        }));
        return isValid;
      } else {
        const [isPasswordValid, passwordMsg] = pwdValidateFn(nextPassword);
        const [isConfirmPasswordValid, confirmPasswordMsg] =
          pwdValidateFn(nextConfirmPassword);
        if (nextPassword !== nextConfirmPassword) {
          setValidateResult({
            password: "Password does not match.",
            confirmPassword: "Password does not match.",
          });
          return false;
        }

        setValidateResult({
          password: passwordMsg,
          confirmPassword: confirmPasswordMsg,
        });
        return isPasswordValid && isConfirmPasswordValid;
      }
    },
    [password, confirmPassword],
  );

  const errors = [...new Set(Object.values(validateResult).filter(Boolean))];

  const [loading, setLoading] = useState(false);

  const submitForm = useCallback(() => {
    const res = validate();
    if (!res) {
      return;
    }
    const email = query.get("email") ?? "";
    const [isValid] = validateConfig.email(email);
    if (!isValid) {
      message.error("Invalid email address.");
      return;
    }
    if (!validate()) {
      return;
    }
    setLoading(true);
    resetPwd({
      token,
      password,
      confirmPassword,
      email: email,
    })
      .then(() => {
        message.success("Password reset successfully.");
        router.replace("/?login=true");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [confirmPassword, password, query, router, token, validate]);

  return (
    <div className={styles.form_wrap}>
      <div className={styles.title}>Reset Password</div>
      <LabelPassword
        name="password"
        label="Password"
        placeholder="Password"
        value={password}
        onChange={(v) => {
          const nextValues = { password: v, confirmPassword };
          setPassword(v);
          if (validateResult.password || validateResult.confirmPassword) {
            validate(undefined, nextValues);
          }
        }}
        onBlur={() => validate("password")}
        status={validateResult.password ? "error" : undefined}
      />
      <LabelPassword
        name="confirmPassword"
        label="Password Confirmation"
        placeholder="Password Confirmation"
        value={confirmPassword}
        onChange={(v) => {
          const nextValues = { password, confirmPassword: v };
          setConfirmPassword(v);
          if (validateResult.password || validateResult.confirmPassword) {
            validate(undefined, nextValues);
          }
        }}
        onBlur={() => validate("confirmPassword")}
        status={validateResult.confirmPassword ? "error" : undefined}
      />
      {errors.length > 0 && (
        <div className="text-red-500 text-sm mt-4">{errors[0]}</div>
      )}
      <div className="mt-4">
        <Button
          disabled={
            !password || !confirmPassword || loading || errors.length > 0
          }
          page="console"
          className="!text-sm !h-[40px] w-full"
          onClick={submitForm}
          style={{
            fontFamily: "var(--font-family) !important",
          }}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}
