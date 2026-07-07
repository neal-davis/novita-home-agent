"use client";
import styles from "./upgradeInstance.module.scss";
import outStyles from "./section.module.scss";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { message } from "@/components/ui/standard/notify";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { reqSaveImageInstance } from "@/api/gpu-instance/instances";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { CurrModal } from "../../image/components/addImagePrewarmJob";
import ImageAuth from "../../settings/components/imageAuth";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";
import { SelectFilter } from "@/components/ui/standard/selectFilter";
const ADD_CREDENTIALS_OPTION_VALUE = "__add_credentials__";
export default function SaveImage({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo] = useState({
    ...instanceInfoObj,
  });
  const [params, setParams] = useState({
    image: "",
    registryAuthId: "",
  });
  const [imageInit, setImageInit] = useState(false);
  const [imageAuthInit, setImageAuthInit] = useState(false);
  function inputParamsInfo(item: string, value: any) {
    setParams({ ...params, [item]: value });
  }
  const [myAuths, setMyAuths] = useState([]);
  useEffect(() => {
    reqGetImageAuths({}).then((res: any) => {
      setMyAuths(res?.data || []);
    });
  }, []);
  const [loading, setLoading] = useState(false);
  function saveImageInstanceFun() {
    if (
      !params.image ||
      params.image.trim() === "" ||
      params.image.length !== params.image.trim().replace(" ", "").length
    ) {
      setImageInit(true);
      setImageError(
        `The image path can not be empty, and can not contain whitespace characters`,
      );
      message.error(
        `The image path can not be empty, and can not contain whitespace characters`,
      );
      return;
    }
    const ret = isValidDockerImageAddress(params.image.trim() || "");
    if (ret) {
      setImageError(ret);
      message.error(ret);
      return;
    }
    if (!params.registryAuthId || params.registryAuthId === "-1") {
      setImageAuthInit(true);
      setImageAuthError(`The container registry credentials can not be empty`);
      message.error(`The container registry credentials can not be empty`);
      return;
    }
    setLoading(true);
    reqSaveImageInstance({
      instanceId: instanceInfo.id,
      image: params.image.trim(),
      registryAuthId: params.registryAuthId,
    })
      .then((res: any) => {
        message.success("success");
        finishForm(true, { ...instanceInfo, jobId: res?.jobId });
      })
      .finally(() => {
        setLoading(false);
      });
  }
  // function toOtherPage() {
  //   window.location.href = window.location.origin + "/gpus-console/settings";
  // }
  const [imageError, setImageError] = useState("");
  const checkImageError = useCallback(() => {
    if (
      !params.image ||
      params.image.trim() === "" ||
      params.image.length !== params.image.trim().replace(" ", "").length
    ) {
      return `${"The image path and container registry credentials can not be empty, and the image path can not contain whitespace characters"}`;
    }
    const ret = isValidDockerImageAddress(params.image.trim() || "");
    if (ret) {
      return ret;
    }
    return "";
  }, [params.image]);
  useEffect(() => {
    const error = checkImageError();
    setImageError(error);
  }, [checkImageError, params.image]);

  const [imageAuthError, setImageAuthError] = useState("");
  const checkImageAuthError = useCallback(() => {
    if (!params.registryAuthId || params.registryAuthId === "-1") {
      return `The container registry credentials can not be empty`;
    }
    return "";
  }, [params.registryAuthId]);
  useEffect(() => {
    const error = checkImageAuthError();
    setImageAuthError(error);
  }, [params.registryAuthId, params.image, checkImageAuthError]);

  const [showAddImageAuth, setShowAddImageAuth] = useState({
    showModal: false,
  });
  function addAuthValue(mark?: boolean, id?: string) {
    setShowAddImageAuth({ ...showAddImageAuth, showModal: false });
    if (mark && id) {
      setParams({ ...params, registryAuthId: id });
    }
    reqGetImageAuths({}).then((res: any) => {
      setMyAuths(res?.data || []);
    });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Save Image"}</h1>
        <div>
          <div className={styles.subTitle}></div>
          <div
            style={{
              marginTop: "48px",
              marginBottom: "var(--spacing-console-24)",
            }}
          >
            <div className={styles.inputContainer}>
              <div className="font-subtle text-[var(--dark-3)] mb-1">
                {
                  "After adjusting the instance, you can save the updated instance as an image, and then create new templates and instances based on the latest image!"
                }
              </div>
              <div className="font-subtle text-[var(--dark-2)] mb-2">
                {
                  "Please enter a path consisting of lowercase letters and numbers, with each segment optionally containing ., _ or -, and supporting multiple levels separated by /."
                }
              </div>
              <div className={styles.imgPathTxt}>
                <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                  *
                </span>
                {"Image Path"}
              </div>
              <Input
                className={`${styles.imgPathInput} ${imageInit && imageError ? "error-input" : ""}`}
                value={params.image}
                onChange={(e: any) => {
                  setImageInit(true);
                  inputParamsInfo("image", e.target.value);
                }}
                placeholder={"Please input your Image address"}
              />
              {imageInit && imageError && (
                <div className={"ant-form-item-explain-error"}>
                  {imageError}
                </div>
              )}
            </div>
            <div
              style={{
                width: "100%",
                display: "inline-block",
                marginTop: "var(--spacing-console-16)",
              }}
            >
              <div className={styles.containerRefCredTxt}>
                <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                  *
                </span>
                {"Container Registry Credentials"}
              </div>
              <SelectFilter
                {...{
                  value: params?.registryAuthId || "",
                  options: [
                    {
                      id: ADD_CREDENTIALS_OPTION_VALUE,
                      name: "+ Add Credentials",
                    },
                    ...myAuths,
                  ],
                  onValueChange: (value) => {
                    if (value === ADD_CREDENTIALS_OPTION_VALUE) {
                      setShowAddImageAuth({
                        ...showAddImageAuth,
                        showModal: true,
                      });
                      return;
                    }
                    setImageAuthInit(true);
                    inputParamsInfo("registryAuthId", value);
                  },
                  onClear: () => inputParamsInfo("registryAuthId", ""),
                  allowClear: !!params?.registryAuthId,
                  // i18n-disable-next-line
                  clearAriaLabel: "Clear container registry credentials",
                  getOptionValue: (item: any) => item.id,
                  getOptionLabel: (item: any) => item.name,
                  renderTrigger: (item: any) => (
                    <span className="truncate text-[var(--black)]">
                      {item?.name || "Please Select Credentials"}
                    </span>
                  ),
                  renderOption: (item: any) => item.name,
                  // i18n-disable-next-line
                  placeholder: "Please Select Credentials",
                  triggerClassName: `${styles.containerRefCredSelect} ${imageAuthInit && imageAuthError ? "error-select" : ""}`,
                  // i18n-disable-next-line
                  contentClassName: "max-h-[450px]",
                  itemClassName: outStyles.menuItem,
                  showSearch: false,
                }}
              />
              {imageAuthInit && imageAuthError && (
                <div className={"ant-form-item-explain-error"}>
                  {imageAuthError}
                </div>
              )}
            </div>
          </div>

          <div>
            <Button
              id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SAVE_IMAGE}
              className={styles.upgradeBtn}
              onClick={() => saveImageInstanceFun()}
              variant="default"
              disabled={loading}
            >
              <span className={styles.upgradeBtnTxt}>{"Save"}</span>
            </Button>
            <Button
              onClick={() => finishForm()}
              className={styles.cancelBtn}
              variant="default"
            >
              <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
            </Button>
          </div>
        </div>
      </div>
      {showAddImageAuth.showModal ? (
        <CurrModal
          footer={null}
          open={showAddImageAuth.showModal}
          title={"Add Credential"}
          onCancel={() =>
            setShowAddImageAuth({ ...showAddImageAuth, showModal: false })
          }
        >
          <ImageAuth addModelValue={addAuthValue} />
        </CurrModal>
      ) : (
        ""
      )}
    </div>
  );
}
