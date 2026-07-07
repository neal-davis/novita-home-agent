"use client";
import styles from "./index.module.scss";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import {
  reqUpdateTemplate,
  reqAddTemplate,
  reqStorageLocalFree,
} from "@/api/gpu-instance/templates";
import "md-editor-rt/lib/style.css";
import React from "react";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { reqMarketQueryOptions } from "@/api/gpu-instance/explore";
import {
  checkPorts,
  checkEnvs,
  generateRandomString,
  checkHttpTcpPortSame,
} from "@/lib/utils/utils";
import { dealParamsText } from "@/lib/utils/utils";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import AddTemplateInPrewarmBody from "./AddTemplateInPrewarmBody";
import ImageAuth from "../../settings/components/imageAuth";
import Modal from "@/app/components/Modal/Modal";
const publicTips =
  "The template will be displayed in the Templates Library, and other users can use this template.";
const templateInitBase = {
  Id: "60",
  user: "user",
  readme: "",
  type: "type",
  channel: "private",
  startCommand: "",
  entrypoint: "",
  rootfsSize: "",
  localVolumeSize: "",
  localVolumeMount: "/workspace",
  tcpports: ",",
  httpports: ",",
  ports: [
    {
      type: "",
      ports: [0],
    },
  ],
  envs: [],
  tools: [],
  createTime: "",
  minCudaVersion: "",
};

export default function AddTemplate({
  mode = "Create",
  createPosition = "inner",
  templateObj = {},
  finishForm,
  updateList,
  title,
  imageUrl,
  authId,
}: {
  mode: "Create" | "Edit";
  createPosition?: any;
  templateObj?: any;
  finishForm: any;
  isTemplateLoading?: any;
  updateList?: any;
  title?: string;
  imageUrl?: string;
  authId?: string;
}) {
  const templateInit = {
    ...templateInitBase,
    name: generateRandomString(8),
    image: imageUrl || "",
    imageAuth: authId || "",
  };
  if (mode === "Edit") {
    const localObj = templateObj?.volumes?.find(
      (item: any) => item.type === "local",
    ) || { size: 0, mountPath: "" };
    templateObj.localVolumeSize = localObj.size;
    templateObj.localVolumeMount = localObj.mountPath;
    const httpPorts = templateObj?.ports?.find(
      (item: any) => item.type === "http",
    ) || { ports: [] };
    templateObj.httpports = httpPorts?.ports?.join(",") || "";
    const tcpPorts = templateObj?.ports?.find(
      (item: any) => item.type === "tcp",
    ) || { ports: [] };
    templateObj.tcpports = tcpPorts?.ports?.join(",") || "";
  }
  const [templateInfo, setTemplateInfo] = useState(
    mode === "Create" ? templateInit : templateObj,
  );
  const [alignment, setAlignment] = useState("left");
  const [isLoading, setIsLoading] = useState<any>(false);
  function addEnvs() {
    const envs = [...templateInfo.envs];
    envs.push({ key: "", value: "" });
    setTemplateInfo({ ...templateInfo, envs });
  }
  function changeItem(itemName: string, e?: any) {
    if (itemName === "rootfsSize") {
      if (/^[1-9]\d*$/.test(e.target.value) || e.target.value === "") {
        setTemplateInfo({ ...templateInfo, [itemName]: e.target.value });
        return;
      }
    } else if (itemName === "localVolumeSize") {
      if (
        /^[1-9]\d*$/.test(e.target.value) ||
        e.target.value === "0" ||
        e.target.value === ""
      ) {
        setTemplateInfo({ ...templateInfo, [itemName]: e.target.value });
        return;
      }
    } else {
      setTemplateInfo({ ...templateInfo, [itemName]: e ? e.target.value : "" });
    }
  }
  function saveTemplate() {
    if (isLoading) {
      return;
    }
    if (
      !templateInfo.name ||
      templateInfo.name.trim() === "" ||
      templateInfo.name.length < 2 ||
      templateInfo.name.length > 255
    ) {
      message.error(`${"Please input the template name, length 2-255"}`);
      return;
    }
    if (
      !templateInfo.image ||
      templateInfo.image.trim() === "" ||
      templateInfo.image.trim().length > 500
    ) {
      setImageInit(true);
      message.error(`${"Please input the template image, max length 500"}`);
      return;
    }
    const ret = isValidDockerImageAddress(templateInfo.image.trim());
    if (ret) {
      setImageInit(true);
      message.error(ret);
      return;
    }
    if (templateInfo?.entrypoint?.trim()?.length > 2047) {
      setEntrypointInit(true);
      message.error(`Entrypoint length cannot exceed 2047 characters`);
      return;
    }
    if (
      isNaN(templateInfo.rootfsSize) ||
      Number(templateInfo.rootfsSize) < Number(freeInfo.minRootFS || 0)
    ) {
      setRootfsSizeInit(true);
      message.error(
        `${dealParamsText(
          "Please enter an integer greater than or equal to ${0} GB for container disk size",
          {
            0: freeInfo.minRootFS,
          },
        )}`,
      );
      return;
    }
    if (
      isNaN(templateInfo.rootfsSize) ||
      Number(templateInfo.rootfsSize) > Number(freeInfo.maxRootFS || 0)
    ) {
      setRootfsSizeInit(true);
      message.error(
        `${dealParamsText(
          "The container disk size can not be greater than ${0} GB",
          {
            0: freeInfo.maxRootFS,
          },
        )}`,
      );
      return;
    }
    if (mountLocal) {
      if (
        isNaN(templateInfo.localVolumeSize) ||
        Number(templateInfo.localVolumeSize) <
          Number(freeInfo.minLocalStorage || 0)
      ) {
        message.error(
          `${dealParamsText(
            "Please enter an integer greater than or equal to ${0} GB for volume disk size",
            {
              0: freeInfo.minLocalStorage,
            },
          )}`,
        );
        return;
      }
      if (
        isNaN(templateInfo.localVolumeSize) ||
        Number(templateInfo.localVolumeSize) >
          Number(freeInfo.maxLocalStorage || 0)
      ) {
        message.error(
          `${dealParamsText(
            "The volume disk size can not be greater than ${0} GB",
            {
              0: freeInfo.maxLocalStorage,
            },
          )}`,
        );
        return;
      }
    }
    const envs = templateInfo.envs;
    const envRet: any = checkEnvs(envs || []);
    if (envRet) {
      message.error(envRet);
      return;
    }
    const template: any = {};
    template.name = templateInfo.name.trim();
    template.readme = templateInfo.readme;
    template.type = "instance";
    template.channel = templateInfo.channel;
    template.image = templateInfo.image.trim();
    template.imageAuth =
      !templateInfo.imageAuth || templateInfo.channel === "community"
        ? undefined
        : templateInfo.imageAuth;
    template.startCommand = templateInfo.startCommand;
    template.entrypoint = templateInfo.entrypoint?.trim() || "";
    template.rootfsSize = templateInfo.rootfsSize;
    template.minCudaVersion = templateInfo.minCudaVersion;
    template.localVolumeSize = mountLocal
      ? templateInfo.localVolumeSize
      : undefined;
    template.localVolumeMount = mountLocal
      ? templateInfo.localVolumeMount
      : undefined;
    let ports: any = [];
    setIsLoading(true);
    let allHttpPorts = [];
    if (templateInfo.httpports) {
      const httpPortsInfo: any = checkPorts(
        templateInfo.httpports?.split(",") || [],
      );
      allHttpPorts = templateInfo.httpports?.split(",") || [];
      if (httpPortsInfo?.length) {
        if (httpPortsInfo[0]) {
          message.error(httpPortsInfo[0]);
          setIsLoading(false);
          return;
        } else {
          if (httpPortsInfo[1]?.length) {
            if (httpPortsInfo[1].length > 10) {
              message.error("The max number of http ports is 10");
              setIsLoading(false);
              return;
            }
            ports = [
              {
                type: "http",
                ports: httpPortsInfo[1],
              },
            ];
          }
        }
      }
    }
    let allTcpPorts = [];
    if (templateInfo.tcpports) {
      const tcpPortsInfo: any = checkPorts(
        templateInfo.tcpports?.split(",") || [],
      );
      allTcpPorts = templateInfo.tcpports?.split(",") || [];
      if (tcpPortsInfo?.length) {
        if (tcpPortsInfo[0]) {
          message.error(tcpPortsInfo[0]);
          setIsLoading(false);
          return;
        } else {
          if (tcpPortsInfo[1]?.length) {
            ports = [
              ...ports,
              {
                type: "tcp",
                ports: tcpPortsInfo[1],
              },
            ];
          }
        }
      }
    }
    const samePorts = checkHttpTcpPortSame(
      allHttpPorts.filter((el: any) => el && el.trim()),
      allTcpPorts.filter((el: any) => el && el.trim()),
    );
    if (samePorts) {
      message.error(samePorts);
      setIsLoading(false);
      return;
    }
    template.ports = ports;
    template.volumes = mountLocal
      ? [
          {
            type: "local",
            size: templateInfo.localVolumeSize,
            mountPath: templateInfo.localVolumeMount,
          },
        ]
      : [];
    if (
      template.channel === "community" &&
      template.volumes.find((item: any) => item.type === "local")
    ) {
      message.error("Public templates cannot have local volumes.");
      setIsLoading(false);
      return;
    }
    if (envs) {
      for (let i = 0; i < envs.length; i++) {
        const item = envs[i];
        if (!item.key || item.key.trim() === "") {
          message.error("Key can not be empty");
          return;
        }
      }
    }
    template.envs = envs;
    if (createPosition === "out") {
      if (mode === "Create") {
        reqAddTemplate({ template })
          .then((response: any) => {
            message.success("success");
            updateList(response?.templateId);
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      } else {
        template.Id = templateInfo.Id;
        reqUpdateTemplate({ template })
          .then((response: any) => {
            message.success("success");
            updateList(response?.templateId);
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
    } else {
      if (mode === "Create") {
        reqAddTemplate({ template })
          .then(() => {
            setIsLoading(false);
            finishForm(true);
          })
          .catch(() => {
            setIsLoading(false);
          });
      } else {
        template.Id = templateInfo.Id;
        reqUpdateTemplate({ template })
          .then(() => {
            setIsLoading(false);
            finishForm(true);
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
    }
  }
  const httpError = (() => {
    let error = "";
    if (templateInfo.httpports) {
      const httpPortsInfo: any = checkPorts(templateInfo.httpports.split(","));
      if (httpPortsInfo?.length) {
        if (httpPortsInfo[0]) {
          error = httpPortsInfo[0];
        } else {
          if (httpPortsInfo[1]?.length) {
            if (httpPortsInfo[1].length > 10) {
              error = "The max number of http ports is 10";
            }
          }
        }
      }
    }
    return error;
  })();
  const tcpError = (() => {
    let error = "";
    if (templateInfo.tcpports) {
      const tcpPortsInfo: any = checkPorts(templateInfo.tcpports.split(","));
      if (tcpPortsInfo?.length) {
        if (tcpPortsInfo[0]) {
          error = tcpPortsInfo[0];
        }
      }
    }
    return error;
  })();
  function removeEnv(index: number) {
    const envs = [...templateInfo.envs];
    envs.splice(index, 1);
    setTemplateInfo({ ...templateInfo, envs });
  }
  function inputEnvInfo(index: number, item: string, e: any) {
    const envs = [...templateInfo.envs];
    envs[index][item] = e.target.value;
    setTemplateInfo({ ...templateInfo, envs });
  }
  const [myAuths, setMyAuths] = useState<any>([]);
  const [freeInfo, setFreeInfo] = useState<any>({
    freeRootFS: 30,
    freeLocalStorage: 60,
    minLocalStorage: 0,
    maxLocalStorage: 0,
    minRootFS: 0,
    maxRootFS: 0,
  });
  const [cudaVersions, setCudaVersions] = useState<any>([]);
  useEffect(() => {
    reqMarketQueryOptions({ auth: 1 }).then((res: any) => {
      setCudaVersions(res?.cudaVersions || []);
      // if (mode === "Create") {
      //   changeItem("minCudaVersion", {
      //     target: { value: res?.cudaVersions[0] },
      //   });
      // }
    });
    reqGetImageAuths({}).then((res: any) => {
      setMyAuths(res?.data || []);
    });
    reqStorageLocalFree().then((res: any) => {
      setFreeInfo(res || {});
    });
  }, []);
  const [mountLocal, setMountLocal] = useState(
    mode === "Create"
      ? false
      : !!templateObj?.volumes?.find((item: any) => item.type === "local"),
  );
  const [showLocal] = useState(
    mode === "Create"
      ? false
      : !!templateObj?.volumes?.find((item: any) => item.type === "local"),
  );
  const [imageInit, setImageInit] = useState(false);
  const imageError = (() => {
    let error = "";
    if (
      !templateInfo.image ||
      templateInfo.image.trim() === "" ||
      templateInfo.image.trim().length > 500
    ) {
      error = `${"Please input the template image, max length 500"}`;
    } else {
      error = isValidDockerImageAddress(templateInfo.image.trim());
    }
    return error;
  })();
  const [entrypointInit, setEntrypointInit] = useState(false);
  const entrypointError =
    templateInfo?.entrypoint?.trim()?.length > 2047
      ? "Entrypoint length cannot exceed 2047 characters"
      : "";
  const [rootfsSizeInit, setRootfsSizeInit] = useState(false);
  const rootfsSizeError = (() => {
    let error = "";
    if (
      isNaN(templateInfo.rootfsSize) ||
      Number(templateInfo.rootfsSize) < Number(freeInfo.minRootFS || 0)
    ) {
      error = `${dealParamsText(
        "Please enter an integer greater than or equal to ${0} GB for container disk size",
        {
          0: freeInfo.minRootFS,
        },
      )}`;
    } else if (
      isNaN(templateInfo.rootfsSize) ||
      Number(templateInfo.rootfsSize) > Number(freeInfo.maxRootFS || 0)
    ) {
      error = `${dealParamsText(
        "The container disk size can not be greater than ${0} GB",
        {
          0: freeInfo.maxRootFS,
        },
      )}`;
    }
    return error;
  })();
  const [showAddImageAuth, setShowAddImageAuth] = useState({
    showModal: false,
  });
  function addAuthValue(mark?: boolean, id?: string) {
    setShowAddImageAuth({ ...showAddImageAuth, showModal: false });
    if (mark && id) {
      changeItem("imageAuth", { target: { value: id } });
    }
    reqGetImageAuths({}).then((res: any) => {
      setMyAuths(res?.data || []);
    });
  }
  const bodyState = {
    alignment,
    templateInfo,
    showAddImageAuth,
    mode,
    imageInit,
    entrypointInit,
    rootfsSizeInit,
    showLocal,
    mountLocal,
    inputEnvInfo,
  };
  const bodyActions = {
    setAlignment,
    changeItem,
    setShowAddImageAuth,
    setImageInit,
    setEntrypointInit,
    setMountLocal,
    removeEnv,
    addEnvs,
  };
  const bodyOptions = {
    cudaVersions,
    myAuths,
    freeInfo,
  };
  const bodyErrors = {
    imageError,
    entrypointError,
    rootfsSizeError,
    httpError,
    tcpError,
  };
  return (
    <>
      <React.Fragment>
        <Modal
          width="870px"
          footer={null}
          open={true}
          title={null}
          onCancel={() => finishForm(false)}
          className={styles.templateModal}
          styles={{ content: { padding: 0 } }}
        >
          <div className={styles.content}>
            <h2
              id="customized-dialog-title"
              className=""
              style={{
                fontSize: "16px",
                lineHeight: "16px",
                fontWeight: "bold",
                color: "var(--black)",
              }}
            >
              {title ||
                (mode === "Create" ? "Create New Template" : "Edit Template")}
            </h2>
          </div>
          <div className={styles.modalBody}>
            <div>
              <AddTemplateInPrewarmBody
                state={bodyState}
                actions={bodyActions}
                options={bodyOptions}
                errors={bodyErrors}
              />
            </div>
            <div className={styles.modalFooter}>
              <Button
                className={styles.cancelBtn}
                onClick={() => finishForm(false)}
                variant="outline"
                id={
                  CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_CREATE_MY_TEMPLATE_CANCEL
                }
              >
                <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
              </Button>
              <Button
                className={styles.saveBtn}
                variant="outline"
                onClick={saveTemplate}
                id={
                  createPosition === "out"
                    ? CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_CREATE_MY_TEMPLATE_SAVE
                    : mode === "Create"
                      ? CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATES_CREATE_TEMPLATE
                      : CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATES_EDIT_TEMPLATE
                }
              >
                {!isLoading && (
                  <span className={styles.saveBtnTxt}>{"Save Template"}</span>
                )}
                {isLoading && (
                  <div className={styles.loadingWrap}>
                    <img alt="loading" src="/gpu-instance/loading.gif" />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </React.Fragment>
      {showAddImageAuth.showModal ? (
        <Modal
          width="520px"
          footer={null}
          open={true}
          title={null}
          onCancel={() =>
            setShowAddImageAuth({ ...showAddImageAuth, showModal: false })
          }
          className={styles.templateModal}
          styles={{ content: { padding: 0 } }}
        >
          <div className={styles.content}>
            <h2
              id="customized-dialog-title"
              className=""
              style={{
                fontSize: "16px",
                lineHeight: "16px",
                fontWeight: "bold",
                color: "var(--black)",
              }}
            >
              {"Add Credential"}
            </h2>
          </div>
          <div
            style={{
              backgroundColor: "var(--white)",
              color: "var(--black)",
              padding: 24,
            }}
          >
            <ImageAuth isDialog={true} addModelValue={addAuthValue} />
          </div>
        </Modal>
      ) : (
        ""
      )}
    </>
  );
}
