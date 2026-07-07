import { message } from "@/components/ui/standard/notify";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reqChangePassword } from "@/api/gpu-instance/settings";
import { checkUserPassword } from "@/lib/utils/password";
import styles from "./resetPassword.module.scss";

// const phoneRex = /^1[3456789]\d{9}$/;
// const usernameRex = /^[a-zA-Z0-9]{5,20}$/;
// const passwordRex = /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/;
// const emailRex = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;

export default function ResetPassword({
  updateModelValue,
  // email,
}: {
  updateModelValue: any;
  // email?: any;
}) {
  const [data, setData] = useState<any>({
    isShow: false,
    isLoading: false,
    oldPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  // const navigate = useNavigate();
  function confirm() {
    if (!checkUserPassword(data.newPassword)) {
      message.error("Check failed, please check format of new password!");
      return;
    }
    setData({ ...data, isLoading: true });
    reqChangePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    })
      .then(() => {
        setData({ ...data, isLoading: false });
        message.success("success");
        updateModelValue();
      })
      .catch(() => {
        setData({ ...data, isLoading: false });
      });
  }

  function inputFormPassword(item: string, e: any) {
    setData({ ...data, [item]: e.target.value });
  }

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);

  return (
    <>
      <div className={styles.field}>
        <div className={styles.label}>Old Password</div>

        <Input
          className={styles.passwordInput}
          placeholder="Enter old password..."
          value={data.oldPassword}
          onChange={(e: any) => inputFormPassword("oldPassword", e)}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          suffix={
            showPassword ? (
              <img
                src="/gpu-instance/login/icon-passwordClosed.svg"
                onClick={handleClickShowPassword}
                alt="svg"
              />
            ) : (
              <img
                src="/gpu-instance/login/icon-passwordOpen.svg"
                onClick={handleClickShowPassword}
                alt="svg"
              />
            )
          }
        />
      </div>
      <div className={styles.newPasswordField}>
        <div className={styles.label}>New Password</div>
        <Input
          autoComplete="off"
          className={styles.passwordInput}
          placeholder="Enter new password..."
          value={data.newPassword}
          onChange={(e: any) => inputFormPassword("newPassword", e)}
          type={showNewPassword ? "text" : "password"}
          suffix={
            showNewPassword ? (
              <img
                src="/gpu-instance/login/icon-passwordClosed.svg"
                onClick={handleClickShowNewPassword}
                alt="svg"
              />
            ) : (
              <img
                src="/gpu-instance/login/icon-passwordOpen.svg"
                onClick={handleClickShowNewPassword}
                alt="svg"
              />
            )
          }
        />
      </div>
      <div className={styles.passwordTip}>
        Make sure it is at least 8 characters in length and contains at least 3
        of the following 4 types of characters: lower-case letters (a-z),
        upper-case letters (A-Z), numbers (i.e. 0-9), and special characters
        (e.g !@#$%^&*).
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.updateBtn}
          variant="outline"
          disabled={data.isLoading}
          onClick={confirm}
        >
          <span className={`${styles.buttonText} ${styles.updateBtnText}`}>
            Update Password
          </span>
        </Button>
        <Button
          className={styles.cancelBtn}
          variant="outline"
          onClick={updateModelValue}
        >
          <span className={`${styles.buttonText} ${styles.cancelBtnText}`}>
            Cancel
          </span>
        </Button>
      </div>
    </>
  );
}
