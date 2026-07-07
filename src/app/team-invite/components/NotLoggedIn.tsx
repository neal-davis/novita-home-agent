import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import styles from "../page.module.scss";
export default function NotLoggedIn({
  teamName,
  inviteToken,
}: {
  teamName: string;
  inviteToken: string;
}) {
  return (
    <>
      <div className={styles.tips}>
        <span>
          {
            "This page is accessible only to invited members. Please log in with the email that received the invitation from"
          }
        </span>
        <span className={styles.confirm_message}> {teamName}</span>
        <span>
          {" "}
          {"team."}{" "}
          {
            "If you haven't registered, sign up using the invited email to proceed."
          }
        </span>
      </div>
      <div className={`flex flex-row items-center ${styles.button_wrap}`}>
        <Button style={{ width: 90 }} variant="secondary" asChild>
          <Link href={`${NOVITA_URL.USER_LOGIN}?invite_token=${inviteToken}`}>
            {"Log in"}
          </Link>
        </Button>
        <div className={styles.account_guide}>
          <span>{"Need to create an account?"}</span>
          <Link
            href={`${NOVITA_URL.USER_REGISTER}?invite_token=${inviteToken}`}
            className={styles.link_btn}
          >
            {" "}
            {"Sign up"}
          </Link>
        </div>
      </div>
    </>
  );
}
