"use client";

import { useCallback, useEffect, useRef } from "react";
import { GoogleLogin } from "@/api/user";
import { getUserCollect } from "@/lib/utils/utils";
import Cookies from "js-cookie";
import styles from "./GoogleLogin.module.css";

const CLIENT_ID =
  "1009719330755-jorps53l35j75md6f9cqpilicv16kq5l.apps.googleusercontent.com";

const GoogleAuth = ({
  width = 200,
  callback,
}: {
  width?: number;
  callback?: (res: any) => void;
}) => {
  const googleButton = useRef(null);

  const handleCredentialResponse = useCallback(
    (response: any) => {
      if (response.credential) {
        const collectInfo = getUserCollect();
        GoogleLogin({
          idToken: response.credential,
          ...collectInfo,
          sign_up_from: localStorage.getItem("sign_up_from"),
        })
          .then((res) => {
            if (callback) {
              callback(res);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    [callback],
  );

  useEffect(() => {
    setTimeout(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(googleButton.current, {
          theme: "outline",
          size: "large",
          width: width + "px",
        });
        console.log("google btn render");
        const token = Cookies.get("token");
        if (!token) {
          window.google.accounts.id.prompt();
        }
      }
    });
  }, [handleCredentialResponse, width]);

  return (
    <div className={styles.google_btn}>
      <div ref={googleButton}></div>
    </div>
  );
};

export default GoogleAuth;
