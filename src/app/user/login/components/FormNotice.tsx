import { message } from "@/components/ui/standard/notify";
import styles from "./LoginForm.module.scss";
import { RegexEmail } from "@/lib/regex";
import { useSearchParams } from "next/navigation";
import { sendActiveEmail } from "@/api/user";
import { TimeInterval } from "../../components/time-interval";
import { dataLayerPushEvent, GA_ENVENT } from "@/lib/event";
import { useEffect } from "react";

export function FormNotice() {
  const search = useSearchParams();
  const noticeType = search.get("notice_type");
  const routerEmail = search.get("email");
  const verifyRes = search.get("verify_res");

  useEffect(() => {
    if (verifyRes === "success") {
      setTimeout(() => {
        dataLayerPushEvent({
          event: GA_ENVENT.SIGN_UP_SUCCESS,
        });
      });
    }
  }, [verifyRes]);

  if (!noticeType && !verifyRes) return null;

  if (verifyRes) {
    return (
      <div className={styles.notice}>
        {verifyRes === "success"
          ? "Email verified successfully"
          : "Email verification failed"}
      </div>
    );
  }

  return (
    noticeType && (
      <div className={styles.notice}>
        {noticeType === "active" && (
          <div>
            You will receive an email with instructions on how to activate your
            account in a few minutes.
          </div>
        )}
        {noticeType === "reset" && (
          <div>
            You will receive an email with instructions on how to reset your
            password in a few minutes.
          </div>
        )}
        {routerEmail && (
          <div className={styles.send_email}>
            {`Didn't get an email? `}
            <TimeInterval
              // max={5}
              immediate={true}
              onClick={() => {
                if (!RegexEmail(routerEmail)) {
                  message.error("Invalid email address.");
                  return;
                }
                if (noticeType == "active") {
                  sendActiveEmail(routerEmail).then(() => {
                    message.success("Email sent successfully.");
                  });
                  return;
                }
              }}
            >
              Resend it here
            </TimeInterval>
          </div>
        )}
      </div>
    )
  );
}
