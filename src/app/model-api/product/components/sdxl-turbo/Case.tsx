"use client";

import { useEffect, useRef } from "react";
import styles from "./Case.module.css";
import { UserState } from "@/store/slice/userSlice";
import { useAppSelector } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const userState = useAppSelector((state) => state.user.state);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const iframeEl = iframeRef.current;
    const prvt = (e: WheelEvent) => {
      e.preventDefault();
    };
    iframeEl?.addEventListener("wheel", prvt, { passive: false });
    return () => {
      iframeEl?.removeEventListener("wheel", prvt);
    };
  }, []);

  return (
    <div
      className={`${styles.demo_wrapper} ${styles.demo_in_product} scrollBar_container`}
    >
      {userState === UserState.login && (
        <iframe
          ref={iframeRef}
          className={styles.iframe}
          src="https://realtime.nogpu-webui.com/"
        />
      )}
      {userState === UserState.logout && (
        <div className={styles.need_login}>
          <p>
            Please{" "}
            <a
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={() => {
                router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${pathname}`);
              }}
            >
              <strong>Log In</strong>
            </a>{" "}
            to try out the demo.
          </p>
        </div>
      )}
    </div>
  );
}
