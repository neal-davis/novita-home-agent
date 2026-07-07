import { message } from "@/components/ui/standard/notify";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reqAddImageAuth } from "@/api/gpu-instance/settings";
import styles from "./imageAuth.module.scss";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
const settingsDist = {
  sshPubKey: {
    title: "SSH Public Keys",
    desc: "Adding Public Keys to your account will allow access to instances using the basic terminal access option via the associated private key. You can add multiple public keys by separating them with a newline.",
    subTitle: "SSH Public Key",
    updateBtnTxt: "Update Public Key",
  },
  showImageCredential: false,
  imageCredential: {
    title: "",
    addressTxt: "",
    usernameTxt: "",
    passwordTxt: "",
    usedStorageTxt: "",
    allStorageTxt: "",
    copyBtnTxt: "",
  },
  repository: {
    title: "Container Registry Auth",
    desc: "You can register your container registry credentials here to pull private images from various container registries. Please be aware that we currently only support docker login type credentials. You can add your credentials to a template by registering the credential here and then selecting it from the dropdown when editing or creating your template.",
    addBtnTxt: "+ Add Credential",
    idColTxt: "ID",
    nameColTxt: "Name",
    actionColTxt: "Action",
  },
  addAuthModal: {
    title: "Add Credential",
    nameTxt: "Name",
    namePlaceholder: "Enter name, max length 255",
    usernameTxt: "Username",
    usernamePlaceholder: "Enter username, max length 511",
    passwordTxt: "Password",
    passwordPlaceholder: "Enter password, max length 8000",
    confirmPasswordTxt: "Confirm Password",
    confirmPasswordPlaceholder: "Enter password again, max length 8000",
    confirmBtnTxt: "Confirm",
    nameLengthWarning: "Length of name must 1-255",
    usernameLengthWarning: "Length of username must 1-511",
    passwordLengthWarning: "Length of password must 1-8000",
    notSamePassword: "Passwords is not same",
  },
  confirmDeleteTitle: "Delete Registry Auth",
  confirmDeleteContent: "Confirm delete auth ",
  confirmDeleteCancelBtnTxt: "Cancel",
  confirmDeleteConfirmBtnTxt: "Yes",
  confirmSingleNumaTitle: "Modify Single-Numa",
  confirmSingleNumaContent: "Confirm modify Single-Numa ?",
  confirmSingleNumaConfirmBtnTxt: "Confirm",
  confirmSingleNumaCancelBtnTxt: "Cancel",
  singleNuma: {
    title: "Single-Numa",
    checkTxt: "Prefer Single-Numa",
    desc: "This policy would allow resource allocation from different NUMA nodes only if there would never be any other way to satisfy that allocation request.",
  },
  automaticFaultMigration: {
    title: "Automatic Fault Migration",
    checkTxt: "Enable Automatic Fault Migration",
    desc: "When hardware failures such as node downtime or GPU exceptions occur on the node where the instance resides, the platform can automatically migrate the instance to a healthy node, ensuring that the instance ID, public IP, and data remain unchanged, and minimizing the impact on business operations to the greatest extent possible.",
  },
};
interface RegisterData {
  isShow: boolean;
  isLoading: boolean;
  isPhone: boolean;
  password: string;
  verifyCodeTime: number;
  form: any;
  companyForm: any;
}
export default function ImageAuth({
  addModelValue,
  authInfo = {},
  isDialog = false,
}: {
  addModelValue: any;
  authInfo?: any;
  isDialog?: boolean;
}) {
  const [data, setData] = useState<RegisterData>({
    isShow: false,
    isLoading: false,
    isPhone: false,
    password: "",
    verifyCodeTime: 0,
    form: { name: "", username: "", password: "" },
    companyForm: {},
  });
  const [confirmService, setConfirmService] = useState(false);
  function confirm() {
    if (!checkUserForm()) {
      return;
    }
    setConfirmService(true);
    reqAddImageAuth({ ...data.form })
      .then((res: any) => {
        message.success("success");
        setConfirmService(false);
        addModelValue(true, res?.id || "");
      })
      .catch(() => {
        setConfirmService(false);
      });
  }
  function checkUserForm(): boolean {
    if (
      data.form.name === "" ||
      data.form.name.trim() === "" ||
      data.form.name.length > 255
    ) {
      setNameInit(true);
      setNameError(`${"Length of name must 1-255"}`);
      message.error(`${"Length of name must 1-255"}`);
      return false;
    }
    if (
      data.form.username === "" ||
      data.form.username.trim() === "" ||
      data.form.username.length > 511
    ) {
      setUsernameInit(true);
      setUsernameError(`${"Length of username must 1-511"}`);
      message.error(`${"Length of username must 1-511"}`);
      return false;
    }
    if (data.form.username.indexOf(":") >= 0) {
      setUsernameInit(true);
      setUsernameError(`Username cannot contain ":" character`);
      message.error(`Username cannot contain ":" character`);
      return false;
    }
    if (
      data.form.password === "" ||
      data.form.password.trim() === "" ||
      data.form.password.length > 8000
    ) {
      setPasswordInit(true);
      setPasswordError(`${"Length of password must 1-8000"}`);
      message.error(`${"Length of password must 1-8000"}`);
      return false;
    }
    if (data.password != data.form.password) {
      setConfirmPasswordInit(true);
      setConfirmPasswordError(`${"Passwords is not same"}`);
      message.error(`${"Passwords is not same"}`);
      return false;
    }
    return true;
  }
  const [nameInit, setNameInit] = useState(false);
  const [nameError, setNameError] = useState("");
  const [usernameInit, setUsernameInit] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordInit, setPasswordInit] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordInit, setConfirmPasswordInit] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  useEffect(() => {
    if (
      data.form.name === "" ||
      data.form.name.trim() === "" ||
      data.form.name.length > 255
    ) {
      setNameError(`${"Length of name must 1-255"}`);
    } else {
      setNameError("");
    }
  }, [data.form.name]);
  useEffect(() => {
    if (
      data.form.username === "" ||
      data.form.username.trim() === "" ||
      data.form.username.length > 511
    ) {
      setUsernameError(`${"Length of username must 1-511"}`);
    } else if (data.form.username.indexOf(":") >= 0) {
      setUsernameError(`Username cannot contain ":" character`);
    } else {
      setUsernameError("");
    }
  }, [data.form.username]);
  useEffect(() => {
    if (
      data.form.password === "" ||
      data.form.password.trim() === "" ||
      data.form.password.length > 8000
    ) {
      setPasswordError(`${"Length of password must 1-8000"}`);
      return;
    } else {
      setPasswordError("");
    }
    if (data.password != data.form.password) {
      setConfirmPasswordError(`${"Passwords is not same"}`);
    } else {
      setConfirmPasswordError("");
    }
  }, [data.password, data.form.password]);
  // function closed() {
  //   addModelValue(false);
  // }
  function inputFormPassword(e: any) {
    const form = data.form;
    form.password = e.target.value;
    setData({ ...data, form });
  }
  function inputPassword(text: any) {
    const password = text.target.value;
    setData({ ...data, password });
  }
  function inputFormText(type: string, text: any) {
    const form = data.form;
    (form as any)[type] = text.target.value;
    setData({ ...data, form });
  }
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
  return (
    <>
      <div className={styles.line}></div>
      <div className={`${isDialog ? "" : styles.container}`}>
        <div className={styles.title}>
          <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
            *
          </span>
          {"Name"}
        </div>

        <Input
          className={`${styles.nameInput} ${nameInit && nameError ? "error-textarea" : ""}`}
          placeholder={"Enter name, max length 255"}
          value={data.form.name}
          onChange={(e: any) => {
            setNameInit(true);
            inputFormText("name", e);
          }}
          type="text"
        />
        {nameInit && nameError && (
          <div className={"ant-form-item-explain-error"}>{nameError}</div>
        )}
      </div>
      <div style={{ marginTop: "20px" }}>
        <div className={styles.usernameTxt}>
          <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
            *
          </span>
          {"Username"}
        </div>

        <Input
          className={`${styles.usernameInput} ${usernameInit && usernameError ? "error-textarea" : ""}`}
          placeholder={"Enter username, max length 511"}
          value={data.form.username}
          onChange={(e: any) => {
            setUsernameInit(true);
            inputFormText("username", e);
          }}
          type="text"
        />
        {usernameInit && usernameError && (
          <div className={"ant-form-item-explain-error"}>{usernameError}</div>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <div className={styles.usernameTxt}>
          <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
            *
          </span>
          {"Password"}
        </div>

        <Input
          className={`${styles.usernameInput} ${passwordInit && passwordError ? "error-textarea" : ""}`}
          placeholder={"Enter password, max length 8000"}
          value={data.form.password}
          onChange={(e: any) => {
            setPasswordInit(true);
            inputFormPassword(e);
          }}
          type={showPassword ? "text" : "password"}
          suffix={
            showPassword ? (
              <img
                alt="password-closed"
                src="/gpu-instance/login/icon-passwordClosed.svg"
                onClick={handleClickShowPassword}
              />
            ) : (
              <img
                alt="password-open"
                src="/gpu-instance/login/icon-passwordOpen.svg"
                onClick={handleClickShowPassword}
              />
            )
          }
        />
        {passwordInit && passwordError && (
          <div className={"ant-form-item-explain-error"}>{passwordError}</div>
        )}
      </div>
      <div style={{ marginTop: "20px" }}>
        <div className={styles.usernameTxt}>
          <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
            *
          </span>
          {"Confirm Password"}
        </div>
        <Input
          className={`${styles.usernameInput} ${confirmPasswordInit && confirmPasswordError ? "error-textarea" : ""}`}
          placeholder={"Enter password again, max length 8000"}
          value={data.password}
          onChange={(e: any) => {
            setConfirmPasswordInit(true);
            inputPassword(e);
          }}
          type={showNewPassword ? "text" : "password"}
          suffix={
            showNewPassword ? (
              <img
                alt="password-closed"
                src="/gpu-instance/login/icon-passwordClosed.svg"
                onClick={handleClickShowNewPassword}
              />
            ) : (
              <img
                alt="password-open"
                src="/gpu-instance/login/icon-passwordOpen.svg"
                onClick={handleClickShowNewPassword}
              />
            )
          }
        />
        {confirmPasswordInit && confirmPasswordError && (
          <div className={"ant-form-item-explain-error"}>
            {confirmPasswordError}
          </div>
        )}
      </div>
      <div style={{ marginTop: "32px" }}>
        <Button
          className={styles.confirmBtn}
          style={{
            backgroundColor: data.isLoading ? "" : "var(--dark-1)",
          }}
          disabled={confirmService}
          variant="default"
          id={CLICK_BTN_IDs.GPUS_CONSOLE.SETTINGS_ADD_CREDENTIAL}
          onClick={confirm}
        >
          {"Confirm"}
        </Button>
      </div>
    </>
  );
}
