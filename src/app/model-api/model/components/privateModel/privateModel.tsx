"use client";
import styles from "./privateModel.module.css";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModelTable from "./ModelTable";
import UploadModal from "./UploadModal";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";
import Alert from "@/components/ui/standard/alert";
import Loading from "@/components/ui/standard/loading";
import { NOVITA_URL } from "@/constants/urls";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
function createCopyOut() {
  return {
    mainTitle: "Create with Novita AI",
    navTitle: "My Models",
    userInfo: {
      id: "ID",
      phone: "",
      idCopy: "User ID Copied",
      phoneCopy: "",
    },
    balanceInfo: {
      title: "Credit Balance",
      char: "$",
      topup: "Top Up",
    },
    playgroundInfo: {
      title: "Playground",
      desc1: "Test and debug your API",
      desc2: "requests in the Playground.",
      try: "Try it",
    },
    chartInfo: {
      chart1Preview: "Recent Outcome Review",
      chart1Title: "Top 10 AI API Works (Past 7 Days)",
      chart2Preview: "Cost Analysis",
      chart2Title: "Credit Usage",
      linkPre: "Go to the",
      totalTxt: "Total",
      chart3Preview: "Usage Proportion",
      chart3Title: "API Works (Past 7 Days)",
      labelColor: "#ffffff",
      arrColor: "#A69FFF",
    },
    modelInfo: {
      title: "Manage your private models",
      alertTitle: "Informational Notes",
      alert1Desc:
        "1.Currently, the Model Upload feature only supports LoRA models, with a limit of 5 uploads per user. We plan to gradually lift these restrictions in the future.",
      alert2Desc:
        "2.The Model Upload feature is temporarily available free of charge. However, we may introduce a fee for this service in the future. Please stay tuned for future announcements.",
      alert3Desc:
        "If you have any questions, please contact our customer service or technical team through the Discord Channel:",
      waitingTxt: "Please be patient while we check your permissions...",
      uploadTxt: "Upload Model",
      table: {
        id: "ID",
        name: "Name",
        modelName: "MODEL NAME In API",
        type: "Type",
        baseModel: "Base Model",
        baseModelType: "Base Model Type",
        status: "STATUS",
        operate: "OPERATE",
        delete: "Delete",
      },
      modelListTxt: "Model List",
      loginTips: "You need to login to access this page!",
      loginDesc1:
        "Log in and request private model permissions or if you want to",
      loginDesc2: "access our list of public models",
      needKeyTxt: "You must have at least one key to upload models!",
    },
    uploadInfo: {
      keyTips: "Please add your key first",
      modelTips: "Please upload your model first",
      submitSuccess: "Submit success",
      onlySupportLimit:
        "Model name can only contain letters, numbers, and underscores, and cannot exceed 100 characters",
      nameTips: "Please input your name!",
      nameHolder: "Enter Name",
      typenameTips: "Please select type!",
      selectHolder: "Please select",
      categoryTips: "Please select category!",
      baseModelTips: "Please select base model!",
      baseModelTypeTips: "Please select base model type!",
      switchTxt: "NSFW(Not Safe For Work)",
      submitTxt: "Submit",
      nameLabel: "Name",
      typeLabel: "Type",
      categoryLabel: "Category",
      baseModelLabel: "Base Model",
      baseModelTypeLabel: "Base Model Type",
      checkUploadFileFail: "File upload failed, please re-upload!",
    },
    modelLibrary: {
      title: "Model Library",
      subtitle: "Featured APIs",
    },
  };
}
enum Type {
  LOADING,
  NO_AUTH,
  NO_KEY,
  NO_PERMISSION,
  SHOW_MODEL,
}
export default function PrivateModel({
  copy = createCopyOut(),
}: {
  copy?: any;
}) {
  const keys = useSelectKeys();
  const [type, setType] = useState<Type>(Type.LOADING);
  const [visible, setVisible] = useState(false);
  const permission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.billing,
    resource: PERMISSION.RESOURCE.warning,
    action: PERMISSION.ACTION.all,
  });
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      const timer = setTimeout(() => {
        setType(Type.NO_AUTH);
      }, 500);
      return () => {
        clearTimeout(timer);
      };
    }
    if (!permission) {
      setType(Type.NO_PERMISSION);
    } else {
      setType(Type.SHOW_MODEL);
    }
  }, [keys, permission]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const token = Cookies.get("token");
      if (keys.length === 0 && token) {
        setType(Type.NO_KEY);
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [keys]);
  return (
    <div className={styles.private_container}>
      {type !== Type.NO_AUTH && type !== Type.LOADING && (
        <Alert
          title={"Informational Notes"}
          content={[
            "1.Currently, the Model Upload feature only supports LoRA models, with a limit of 5 uploads per user. We plan to gradually lift these restrictions in the future.",
            "2.The Model Upload feature is temporarily available free of charge. However, we may introduce a fee for this service in the future. Please stay tuned for future announcements.",
            <>
              If you have any questions, please contact our customer service or
              technical team through the Discord Channel:{" "}
              <Link
                className="hover:text-[var(--brand-0)] underline"
                href={
                  "https://discord.com/channels/1113789452079337522/1115192537104265257"
                }
                target="_blank"
              >
                https://discord.com/channels/1113789452079337522/1115192537104265257
              </Link>
            </>,
          ]}
        />
      )}
      {type == Type.LOADING && (
        <Loading>
          <div className={styles.text}>
            {"Please be patient while we check your permissions..."}
          </div>
        </Loading>
      )}
      {type == Type.NO_AUTH && (
        <div className={styles.wrap}>
          <div className={styles.text}>
            {"You need to login to access this page!"}
            <p className={styles.desc}>
              <span>
                {
                  "Log in and request private model permissions or if you want to"
                }{" "}
              </span>
              <Link
                href={NOVITA_URL.MODEL_LIBRARY_INDEX}
                id={CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_MGMT_NO_AUTH_MODELS}
              >
                <span
                  style={{
                    textDecoration: "underline",
                    color: "#6C17FF",
                  }}
                >
                  {"access our list of public models"}
                </span>
              </Link>
            </p>
          </div>
        </div>
      )}
      {type == Type.NO_PERMISSION && (
        <div className={styles.wrap}>
          <div className={styles.text}>
            <span>{`You don't have permission to upload models,`}</span>{" "}
            <Link
              href={
                "https://discord.com/channels/1113789452079337522/1115192537104265257"
              }
              id={CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_MGMT_NO_PERMISSION_DISCORD}
              style={{
                textDecoration: "underline",
                color: "#6C17FF",
              }}
            >
              join our discord to get it!
            </Link>
          </div>
        </div>
      )}
      {type == Type.NO_KEY && (
        <div className={styles.wrap}>
          <div className={styles.text}>
            {"You must have at least one key to upload models!"}
          </div>
        </div>
      )}
      {type == Type.SHOW_MODEL && (
        <div className={styles.model_wrap}>
          <div className="flex justify-between items-center">
            <Button
              size="sl"
              id={CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_MGMT_UPLOAD_MODEL}
              onClick={() => {
                setVisible(true);
              }}
            >
              {"Upload Model"}
            </Button>
            <Link
              href={NOVITA_URL.MODEL_LIBRARY_INDEX}
              target="_blank"
              className={`font-link-small !text-[var(--dark-1)] hover:!text-[var(--brand-0)] flex flex-row justify-between items-center !no-underline`}
              id={CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_MGMT_MODEL_LIST}
            >
              <span>{"Model List"}</span>
              &nbsp;
              <span
                className="iconfont icon-right-arrow"
                style={{ fontSize: 12 }}
              ></span>
            </Link>
          </div>
          <div>
            <ModelTable visible={visible} copy={copy} />
          </div>
        </div>
      )}
      {visible && (
        <UploadModal visible={visible} setVisible={setVisible} copy={copy} />
      )}
    </div>
  );
}
