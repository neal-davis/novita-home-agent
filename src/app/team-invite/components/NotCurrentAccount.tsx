import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import { useAppDispatch } from "@/store";
import { logout } from "@/store/slice/userSlice";
import styles from "../page.module.scss";
export default function NotCurrentAccount({
  inviteToken,
}: {
  inviteToken: string;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const logoutFn = useCallback(() => {
    dispatch(logout());
    router.push(`${NOVITA_URL.USER_LOGIN}?invite_token=${inviteToken}`);
  }, [dispatch, router, inviteToken]);
  return (
    <>
      <h6 className={styles.title}>{"Unauthorized Account"}</h6>
      <div className={styles.tips}>
        {
          "Please log out and log in with the email that received the invitation. If unregistered, sign up with the invited email to continue."
        }
      </div>
      <div className={styles.button_wrap}>
        <Button style={{ width: 100 }} variant="secondary" onClick={logoutFn}>
          {"Log out"}
        </Button>
      </div>
    </>
  );
}
