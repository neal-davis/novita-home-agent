"use client";
import styles from "./section.module.scss";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import StepOne from "./stepOne";
import StepTwo from "./stepTwo";
import StepThree from "./stepThree";
import { reqCreateGpuInstance } from "@/api/gpu-instance/explore";
import CustomerInfo from "./customerInfo";
import { reqUserInfo } from "@/api/gpu-instance/userInfo";
import { reqBalanceTotal } from "@/api/gpu-instance/billing";
import { message } from "@/components/ui/standard/notify";
import {
  checkHttpTcpPortSame,
  checkPorts,
  dealParamsText,
  getUserCollect,
} from "@/lib/utils/utils";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { useAppDispatch } from "@/store";
import { NOVITA_URL } from "@/constants/urls";
// import clsx from "clsx";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { showPermissionMessage } from "@/lib/utils/permission";
import { getUrlParams } from "./dealUrlParams";
import { dealErrorByObj } from "@/lib/utils/dealError";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import ExploreModals from "./ExploreModals";
import ExploreDeployButton from "./ExploreDeployButton";

export { MyModal } from "./ExploreModals";

export default function Section() {
  const hasPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.instance,
    resource: PERMISSION.RESOURCE.instance,
    action: PERMISSION.ACTION.create,
  });
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const [path, setPath] = useState("");
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(pathname + encodeURIComponent(window.location.search));
    }
  }, [pathname]);
  const spotUrlParams = getUrlParams("spot");
  const [createInstanceInfo, setCreateInstanceInfo] = useState<any>({
    productId: "",
    gpuNum: 1,
    envs: [],
    command: "",
    entrypoint: "",
    imageUrl: "",
    imageAuth: "",
    clusterId: "",
    cudaVersion: "",
    ports: [],
    authId: "",
    priceInfos: {},
    imageType: "instance",
    initPg: 0,
    rootfsSize: 10,
    currProduct: null,
    mountLocal: false,
    volumeMounts: [{ type: "local", id: "", size: 0, mountPath: "" }],
    savingPlanTemplateId: "",
    templateType: "",
    templateId: "",
    imageObj: { tools: [] },
    billingMode: spotUrlParams === "1" ? "spot" : "onDemand",
    billingMethods: spotUrlParams === "1" ? ["spot"] : ["onDemand"],
    month: 1,
    autoRenew: false,
    autoRenewMonth: "1",
    GpuNumOptions: [1],
  });
  // const steps = [`${legacyCopy.stepOne}`, `${legacyCopy.stepTwo}`, `${legacyCopy.stepThree}`];
  const [showConfirmCreate, setShowConfirmCreate] = useState({
    showModal: false,
    sumFee: "",
    createInstanceInfo: {},
  });
  function confirmFinish(mark: any, createInstanceInfo: any) {
    if (!mark) {
      setShowConfirmCreate({
        ...showConfirmCreate,
        showModal: false,
      });
    } else {
      createInstanceFinal(createInstanceInfo);
    }
  }
  const [showConnectInfo, setShowConnectInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  const closeConnectInstanceInfo = useCallback(() => {
    setShowConnectInfo((prev) => ({ ...prev, showModal: false }));
  }, []);
  const showParams = useMemo(
    () => ({ showModal: false, instanceInfo: {} }),
    [],
  );
  function validStepTwo() {
    const createInstanceInfoParams = (
      stepTwoRef.current as any
    ).getCreateParameter();
    // if (
    //   !createInstanceInfoParams?.imageObj ||
    //   !createInstanceInfoParams?.imageObj?.Id
    // ) {
    //   message.error(`${legacyCopy.mustSelectTemplate}`);
    //   return;
    // }
    if (
      !createInstanceInfoParams?.imageUrl ||
      createInstanceInfoParams?.imageUrl.trim() === ""
    ) {
      message.error("Please enter valid image");
      return;
    }
    const ret = isValidDockerImageAddress(
      createInstanceInfoParams?.imageUrl.trim() || "",
    );
    if (ret) {
      message.error(ret);
      return;
    }
    if (createInstanceInfoParams?.entrypoint.trim()?.length > 2047) {
      message.error(`Entrypoint length cannot exceed 2047 characters`);
      return;
    }
    if (
      Number(createInstanceInfoParams?.rootfsSize || 0) <
      Number(createInstanceInfoParams?.currProduct?.minRootFS || 0)
    ) {
      message.error(
        `${dealParamsText("Container disk must be at least ${0} GB", {
          0: createInstanceInfoParams?.currProduct?.minRootFS || 0,
        })}`,
      );
      return;
    } else if (
      Number(createInstanceInfoParams?.rootfsSize || 0) >
      Number(createInstanceInfoParams?.currProduct?.maxRootFS || 0)
    ) {
      message.error(
        `${dealParamsText("Container disk can not be greater than ${0} GB", {
          0: createInstanceInfoParams?.currProduct?.maxRootFS || 0,
        })}`,
      );
      return;
    }
    const localVol: any = createInstanceInfoParams?.volumeMounts?.find(
      (item: any) => item.type === "local",
    );
    const netVol: any = createInstanceInfoParams?.volumeMounts?.find(
      (item: any) => item.type === "network",
    );
    if (createInstanceInfoParams.imageObj) {
      createInstanceInfoParams.imageAuth =
        createInstanceInfoParams.imageObj.imageAuth;
    }
    if (createInstanceInfoParams.mountLocal) {
      if (localVol) {
        if (
          Number(localVol.size || 0) <
          Number(createInstanceInfoParams?.currProduct?.minLocalStorage || 0)
        ) {
          message.error(
            `${dealParamsText("Volume disk must be at least ${0} GB", {
              0: createInstanceInfoParams?.currProduct?.minLocalStorage || 0,
            })}`,
          );
          return;
        } else if (
          Number(localVol.size || 0) >
          Number(createInstanceInfoParams?.currProduct?.maxLocalStorage || 0)
        ) {
          message.error(
            `${dealParamsText("Volume disk can not be greater than ${0} GB", {
              0: createInstanceInfoParams?.currProduct?.maxLocalStorage || 0,
            })}`,
          );
          return;
        }
        if (
          !localVol.mountPath ||
          localVol.mountPath.trim() === "/" ||
          localVol.mountPath[0] !== "/" ||
          localVol.mountPath.indexOf(" ") >= 0
        ) {
          message.error("Please enter valid volume mount path.");
          return;
        }
      } else {
        message.error("Please input valid volume disk size");
        return;
      }
      if (localVol && netVol) {
        if (
          localVol.mountPath &&
          netVol.mountPath &&
          localVol.mountPath === netVol.mountPath
        ) {
          message.error(
            "The volume mount path and network mount path can not be the same.",
          );
          return;
        }
      }
    }
    if (netVol && netVol.id) {
      if (
        !netVol.mountPath ||
        netVol.mountPath.trim() === "/" ||
        netVol.mountPath[0] !== "/" ||
        netVol.mountPath.indexOf(" ") >= 0
      ) {
        message.error("Please enter valid network mount path.");
        return;
      }
    }
    let ports: any = [];
    let allHttpPorts: any = [];
    const toolHttpPorts: any =
      createInstanceInfoParams?.tools?.filter(
        (item: any) => item.type === "http",
      ) || [];
    if (createInstanceInfoParams.httpPorts || toolHttpPorts.length > 0) {
      const firstArr: any =
        createInstanceInfoParams.httpPorts?.split(",") || [];
      const secondArr: any =
        toolHttpPorts.map((item: any) => item.port + "") || [];
      const httpPortsInfo: any = checkPorts(firstArr.concat(secondArr));
      if (httpPortsInfo?.length) {
        if (httpPortsInfo[0]) {
          message.error(httpPortsInfo[0]);
          return;
        } else {
          if (httpPortsInfo[1] && httpPortsInfo[1]?.length > 10) {
            message.error(
              "HttpPort field must have less than or equal to 10 items.",
            );
            return;
          }
          const httpPortsInfoSingle: any = checkPorts(firstArr);
          allHttpPorts = firstArr.concat(secondArr);
          if (httpPortsInfoSingle && httpPortsInfoSingle.length > 1) {
            const portsTmp: any =
              httpPortsInfoSingle[1].map((item: any) => ({
                port: item,
                type: "http",
              })) || [];
            ports = [...portsTmp];
          }
        }
      }
    }
    let allTcpPorts: any = [];
    const toolTcpPorts: any =
      createInstanceInfoParams?.tools?.filter(
        (item: any) => item.type === "tcp",
      ) || [];
    if (createInstanceInfoParams.tcpPorts || toolTcpPorts.length > 0) {
      const firstArr: any = createInstanceInfoParams.tcpPorts?.split(",") || [];
      const secondArr: any =
        toolTcpPorts.map((item: any) => item.port + "") || [];
      const tcpPortsInfo: any = checkPorts(firstArr.concat(secondArr));
      if (tcpPortsInfo?.length) {
        if (tcpPortsInfo[0]) {
          message.error(tcpPortsInfo[0]);
          return;
        } else {
          const tcpPortsInfoSingle: any = checkPorts(firstArr);
          allTcpPorts = firstArr.concat(secondArr);
          if (tcpPortsInfoSingle && tcpPortsInfoSingle.length > 1) {
            const portsTmp: any =
              tcpPortsInfoSingle[1].map((item: any) => ({
                port: item,
                type: "tcp",
              })) || [];
            ports = [...ports, ...portsTmp];
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
      return;
    }
    const envs: any = createInstanceInfoParams?.envs || [];
    if (envs.length > 0) {
      for (let mark = 0; mark < envs.length; mark++) {
        if (!envs[mark]?.key || envs[mark].key.trim() === "") {
          message.error("Environment variables key can not be empty.");
          return;
        }
      }
    }
    createInstanceInfoParams.ports = ports;
    return createInstanceInfoParams;
  }
  const stepTwoRef = useRef();
  const stepThreeRef = useRef();
  const [deployLoading, setDeployLoading] = useState(false);
  function stepForward(createInstanceInfoInner?: any) {
    if (deployLoading) {
      return;
    }
    const stepTmp = createInstanceInfoInner ? 0 : 2;
    switch (stepTmp) {
      case 0:
        if (!userInfo || !userInfo.uuid) {
          const token: any = Cookies.get("token");
          if (typeof window !== "undefined") {
            if (token) {
              message.error("Login failure, please log in again");
            } else {
              message.error("Please log in first");
            }
          }
          dispatch(setUserState(UserState.logout) as any);
          router.push(
            getLocalizedPath(
              `${NOVITA_URL.USER_LOGIN}?redirect=${path}`,
              locale,
            ),
          );
          return;
        }
        if (!hasPermission) {
          showPermissionMessage();
          return;
        }
        if (
          Number(balanceTotal.credit || 0) +
            Number(balanceTotal.userBalance || 0) +
            Number(balanceTotal.voucherBalance || 0) <=
          0
        ) {
          if (typeof window !== "undefined") {
            message.error("Balance is not enough.");
          }
          return;
        }
        if (
          Number(createInstanceInfoInner?.filterRootFSSize || 0) <
          Number(createInstanceInfoInner?.currProduct?.minRootFS || 0)
        ) {
          if (typeof window !== "undefined") {
            message.error(
              `Container disk must be at least ${createInstanceInfoInner?.currProduct?.minRootFS || ""}GB`,
            );
          }
          return;
        }
        if (createInstanceInfoInner) {
          const createInstanceInfoParams = createInstanceInfoInner;
          if (!createInstanceInfoParams.imageID) {
            message.error(`${"A template must be selected or created first"}`);
            return;
          }
          if (!createInstanceInfoParams.productId) {
            message.error(`${"Please choose a product"}`);
            return;
          }
          if (createInstanceInfoParams?.currProduct) {
            const productItem = createInstanceInfoParams.currProduct;
            if (!productItem?.usableNode) {
              message.error(`${"GPU stock is insufficient"}`);
              return;
            }
          }
          if (createInstanceInfoParams.imageObj) {
            createInstanceInfoParams.rootfsSize =
              createInstanceInfoParams.filterRootFSSize ||
              createInstanceInfoParams.imageObj?.rootfsSize ||
              0;
            createInstanceInfoParams.imageUrl =
              createInstanceInfoParams.imageObj.image;
            createInstanceInfoParams.imageAuth =
              createInstanceInfoParams.imageObj.imageAuth;
            createInstanceInfoParams.httpPorts = (
              createInstanceInfoParams.imageObj?.ports?.find(
                (item: any) => item.type === "http",
              ) || { ports: [] }
            ).ports.join(",");
            createInstanceInfoParams.tcpPorts = (
              createInstanceInfoParams.imageObj?.ports?.find(
                (item: any) => item.type === "tcp",
              ) || { ports: [] }
            ).ports.join(",");
            createInstanceInfoParams.ports =
              createInstanceInfoParams.imageObj.ports;
            createInstanceInfoParams.command =
              createInstanceInfoParams.imageObj?.startCommand || "";
            createInstanceInfoParams.entrypoint =
              createInstanceInfoParams.imageObj?.entrypoint || "";
            createInstanceInfoParams.envs =
              createInstanceInfoParams.imageObj.envs;
            const localDisk: any =
              createInstanceInfoParams.imageObj.volumes?.find(
                (item: any) => item.type === "local",
              );
            const netDisk: any =
              createInstanceInfoParams.imageObj.volumes?.find(
                (item: any) => item.type === "network",
              );
            createInstanceInfoParams.volumeMounts = [];
            if (localDisk) {
              createInstanceInfoParams.mountLocal = false;
              createInstanceInfoParams.volumeMounts =
                createInstanceInfoParams.volumeMounts.concat([
                  {
                    type: "local",
                    size: localDisk.size || 0,
                    mountPath: localDisk.mountPath || "/workspace",
                  },
                ]);
            } else {
              createInstanceInfoParams.mountLocal = false;
              createInstanceInfoParams.volumeMounts =
                createInstanceInfoParams.volumeMounts.concat([
                  {
                    type: "local",
                    size:
                      createInstanceInfoParams.currProduct?.freeLocalStorage ||
                      0,
                    mountPath: "/workspace",
                  },
                ]);
            }
            if (!netDisk) {
              createInstanceInfoParams.volumeMounts =
                createInstanceInfoParams.volumeMounts.concat([
                  {
                    type: "network",
                    id: createInstanceInfoParams.storageId,
                    storageName: createInstanceInfoParams.storageName,
                    size: 0,
                    mountPath: netDisk?.mountPath || "/network",
                  },
                ]);
            } else {
              createInstanceInfoParams.volumeMounts =
                createInstanceInfoParams.volumeMounts.concat([
                  {
                    type: "network",
                    id: netDisk?.storageId,
                    storageName: netDisk?.storageName,
                    size: 0,
                    mountPath: netDisk?.mountPath || "/network",
                  },
                ]);
            }
          } else {
            createInstanceInfoParams.rootfsSize =
              createInstanceInfoParams.filterRootFSSize ||
              createInstanceInfoParams.currProduct?.freeRootFS ||
              0;
            createInstanceInfoParams.volumeMounts = [
              {
                type: "local",
                size:
                  createInstanceInfoParams.currProduct?.freeLocalStorage || 0,
                mountPath: "/workspace",
              },
              {
                type: "network",
                id: createInstanceInfoParams.storageId,
                storageName: createInstanceInfoParams.storageName,
                size: 0,
                mountPath: "",
              },
            ];
          }
          createInstanceInfoParams.envs = createInstanceInfoParams.envs || [];
          if (createInstanceInfoParams.currProduct) {
            // createInstanceInfoParams.GpuNumOptions =
            //   createInstanceInfoParams.currProduct?.GpuNumOptions || [1];
            createInstanceInfoParams.productName =
              createInstanceInfoParams.currProduct.productName;
            createInstanceInfoParams.freeStorage =
              createInstanceInfoParams.currProduct.freeStorage;
            createInstanceInfoParams.memory =
              createInstanceInfoParams.currProduct.memory;
            createInstanceInfoParams.cpuNum =
              createInstanceInfoParams.currProduct.cpuNum;
          }
          createInstanceInfoParams.clusterId =
            createInstanceInfoParams.clusterId === "-1"
              ? ""
              : createInstanceInfoParams.clusterId;
          if (createInstanceInfoParams.cudaVersion === "-1") {
            delete createInstanceInfoParams.cudaVersion;
          }
          createInstanceInfoParams.initPg = 1;
          setCreateInstanceInfo(createInstanceInfoParams);
        }
        break;
      // case 1:
      //   if (stepTwoRef?.current) {
      //     if (mountLocal) {
      //       const showInvalidTips = (
      //         stepTwoRef.current as any
      //       ).showInvalidTips();
      //       if (showInvalidTips) {
      //         showInvalidTips();
      //         return;
      //       }
      //     }
      //     const createInstanceInfoParams = (
      //       stepTwoRef.current as any
      //     ).getCreateParameter();
      //     if (
      //       !createInstanceInfoParams?.imageObj ||
      //       !createInstanceInfoParams?.imageObj?.Id
      //     ) {
      //       message.error(`${legacyCopy.mustSelectTemplate}`);
      //       return;
      //     }
      //     if (
      //       !createInstanceInfoParams?.imageUrl ||
      //       createInstanceInfoParams?.imageUrl.trim() === ""
      //     ) {
      //       message.error(legacyCopy.needValidImageTip);
      //       return;
      //     }
      //     const ret = isValidDockerImageAddress(
      //       createInstanceInfoParams?.imageUrl.trim() || "",
      //     );
      //     if (ret) {
      //       message.error(ret);
      //       return;
      //     }
      //     if (
      //       Number(createInstanceInfoParams?.rootfsSize || 0) <
      //       Number(createInstanceInfoParams?.currProduct?.minRootFS || 0)
      //     ) {
      //       message.error(
      //         `${dealParamsText(legacyCopy.containerDiskMinSize, {
      //           0: createInstanceInfoParams?.currProduct?.minRootFS || 0,
      //         })}`,
      //       );
      //       return;
      //     } else if (
      //       Number(createInstanceInfoParams?.rootfsSize || 0) >
      //       Number(createInstanceInfoParams?.currProduct?.maxRootFS || 0)
      //     ) {
      //       message.error(
      //         `${dealParamsText(legacyCopy.containerDiskMaxSize, {
      //           0: createInstanceInfoParams?.currProduct?.maxRootFS || 0,
      //         })}`,
      //       );
      //       return;
      //     }
      //     const localVol: any = createInstanceInfoParams?.volumeMounts?.find(
      //       (item: any) => item.type === "local",
      //     );
      //     const netVol: any = createInstanceInfoParams?.volumeMounts?.find(
      //       (item: any) => item.type === "network",
      //     );
      //     if (createInstanceInfoParams.imageObj) {
      //       createInstanceInfoParams.imageAuth =
      //         createInstanceInfoParams.imageObj.imageAuth;
      //     }
      //     if (createInstanceInfoParams.mountLocal) {
      //       if (localVol) {
      //         if (
      //           Number(localVol.size || 0) <
      //           Number(
      //             createInstanceInfoParams?.currProduct?.minLocalStorage || 0,
      //           )
      //         ) {
      //           message.error(
      //             `${dealParamsText(legacyCopy.volumeDiskMinSize, {
      //               0:
      //                 createInstanceInfoParams?.currProduct?.minLocalStorage ||
      //                 0,
      //             })}`,
      //           );
      //           return;
      //         } else if (
      //           Number(localVol.size || 0) >
      //           Number(
      //             createInstanceInfoParams?.currProduct?.maxLocalStorage || 0,
      //           )
      //         ) {
      //           message.error(
      //             `${dealParamsText(legacyCopy.volumnDiskMaxSize, {
      //               0:
      //                 createInstanceInfoParams?.currProduct?.maxLocalStorage ||
      //                 0,
      //             })}`,
      //           );
      //           return;
      //         }
      //         if (
      //           !localVol.mountPath ||
      //           localVol.mountPath.trim() === "/" ||
      //           localVol.mountPath[0] !== "/" ||
      //           localVol.mountPath.indexOf(" ") >= 0
      //         ) {
      //           message.error(legacyCopy.needValidVolumeMountPath);
      //           return;
      //         }
      //       } else {
      //         message.error(legacyCopy.validVolDiskSize);
      //         return;
      //       }
      //       if (localVol && netVol) {
      //         if (
      //           localVol.mountPath &&
      //           netVol.mountPath &&
      //           localVol.mountPath === netVol.mountPath
      //         ) {
      //           message.error(
      //             "The volume mount path and network mount path can not be the same.",
      //           );
      //           return;
      //         }
      //       }
      //     }
      //     if (netVol && netVol.id) {
      //       if (
      //         !netVol.mountPath ||
      //         netVol.mountPath.trim() === "/" ||
      //         netVol.mountPath[0] !== "/" ||
      //         netVol.mountPath.indexOf(" ") >= 0
      //       ) {
      //         message.error(legacyCopy.needValidNetworkMountPath);
      //         return;
      //       }
      //     }
      //     let ports: any = [];
      //     let allHttpPorts: any = [];
      //     const toolHttpPorts: any =
      //       createInstanceInfoParams?.tools?.filter(
      //         (item: any) => item.type === "http",
      //       ) || [];
      //     if (createInstanceInfoParams.httpPorts || toolHttpPorts.length > 0) {
      //       const firstArr: any =
      //         createInstanceInfoParams.httpPorts?.split(",") || [];
      //       const secondArr: any =
      //         toolHttpPorts.map((item: any) => item.port + "") || [];
      //       const httpPortsInfo: any = checkPorts(firstArr.concat(secondArr));
      //       if (httpPortsInfo?.length) {
      //         if (httpPortsInfo[0]) {
      //           message.error(httpPortsInfo[0]);
      //           return;
      //         } else {
      //           if (httpPortsInfo[1] && httpPortsInfo[1]?.length > 10) {
      //             message.error(legacyCopy.httpsMax10Items);
      //             return;
      //           }
      //           const httpPortsInfoSingle: any = checkPorts(firstArr);
      //           allHttpPorts = firstArr.concat(secondArr);
      //           if (httpPortsInfoSingle && httpPortsInfoSingle.length > 1) {
      //             const portsTmp: any =
      //               httpPortsInfoSingle[1].map((item: any) => ({
      //                 port: item,
      //                 type: "http",
      //               })) || [];
      //             ports = [...portsTmp];
      //           }
      //         }
      //       }
      //     }
      //     let allTcpPorts: any = [];
      //     const toolTcpPorts: any =
      //       createInstanceInfoParams?.tools?.filter(
      //         (item: any) => item.type === "tcp",
      //       ) || [];
      //     if (createInstanceInfoParams.tcpPorts || toolTcpPorts.length > 0) {
      //       const firstArr: any =
      //         createInstanceInfoParams.tcpPorts?.split(",") || [];
      //       const secondArr: any =
      //         toolTcpPorts.map((item: any) => item.port + "") || [];
      //       const tcpPortsInfo: any = checkPorts(firstArr.concat(secondArr));
      //       if (tcpPortsInfo?.length) {
      //         if (tcpPortsInfo[0]) {
      //           message.error(tcpPortsInfo[0]);
      //           return;
      //         } else {
      //           const tcpPortsInfoSingle: any = checkPorts(firstArr);
      //           allTcpPorts = firstArr.concat(secondArr);
      //           if (tcpPortsInfoSingle && tcpPortsInfoSingle.length > 1) {
      //             const portsTmp: any =
      //               tcpPortsInfoSingle[1].map((item: any) => ({
      //                 port: item,
      //                 type: "tcp",
      //               })) || [];
      //             ports = [...ports, ...portsTmp];
      //           }
      //         }
      //       }
      //     }
      //     const samePorts = checkHttpTcpPortSame(
      //       allHttpPorts.filter((el: any) => el && el.trim()),
      //       allTcpPorts.filter((el: any) => el && el.trim()),
      //     );
      //     if (samePorts) {
      //       message.error(samePorts);
      //       return;
      //     }
      //     const envs: any = createInstanceInfoParams?.envs || [];
      //     if (envs.length > 0) {
      //       for (let mark = 0; mark < envs.length; mark++) {
      //         if (!envs[mark]?.key || envs[mark].key.trim() === "") {
      //           message.error(legacyCopy.envVarKeyEmpty);
      //           return;
      //         }
      //       }
      //     }
      //     createInstanceInfoParams.ports = ports;
      //     setCreateInstanceInfo(createInstanceInfoParams);
      //   }
      //   break;
      case 2:
        if (stepThreeRef?.current) {
          const createInstanceInfoParams = (
            stepThreeRef.current as any
          ).getCreateParameter();
          if (createInstanceInfoParams.billingMode === "monthly") {
            const sumFee = (stepThreeRef.current as any).getMonthluSumFee();
            setShowConfirmCreate({
              showModal: true,
              sumFee,
              createInstanceInfo: createInstanceInfoParams,
            });
          } else {
            createInstanceFinal(createInstanceInfoParams);
          }
        }
        break;
    }
    if (step < 2) {
      setStep((prevStep) => prevStep + 1);
    } else {
      setStep(step);
    }
  }
  function createInstanceFinal(createInstanceInfoParams: any) {
    if (deployLoading) {
      return;
    }
    const { source, medium, campaignName } = getUserCollect();
    // referrer path starting with /templates/ marks users deploying instances from operation templates
    // just to let the server continue using this field for statistics without modification, this referrer is not document.referrer
    let referrer = "";
    if (
      source === "templates" &&
      medium === "page" &&
      campaignName === createInstanceInfoParams.templateId
    ) {
      referrer =
        typeof window !== "undefined"
          ? `${window.location.origin}/templates/${createInstanceInfoParams.templateId}`
          : `/templates/${createInstanceInfoParams.templateId}`;
    }
    const createInstanceInfoStepTwoParams = validStepTwo();
    if (!createInstanceInfoStepTwoParams) {
      return;
    }
    // debugger;
    const volumeMounts = createInstanceInfoParams.mountLocal
      ? (createInstanceInfoParams?.volumeMounts || []).filter(
          (ele: any) => !(ele.type === "network" && !ele.id),
        )
      : (createInstanceInfoParams?.volumeMounts || [])
          .filter((ele: any) => ele.type !== "local")
          .filter((item: any) => !(item.type === "network" && !item.id));
    const createRequestParams = { ...createInstanceInfoParams };
    if (createRequestParams.cudaVersion === "-1") {
      delete createRequestParams.cudaVersion;
    }
    setCreateInstanceInfo(createInstanceInfoParams);
    setDeployLoading(true);
    reqCreateGpuInstance({
      ...createRequestParams,
      ...createInstanceInfoStepTwoParams,
      nodeId: createInstanceInfo?.currProduct?.nodeID || "",
      imageAuthId: createInstanceInfoParams.imageAuth,
      imageAuth: undefined,
      name: createInstanceInfoParams?.imageObj?.name || "",
      referrer,
      volumeMounts,
      month:
        createInstanceInfoParams.billingMode === "monthly"
          ? createInstanceInfoParams.month
          : undefined,
      sharer: getUrlParams("sharer") || undefined,
      billingMode: createInstanceInfoParams.billingMode,
      billingMethod: createInstanceInfoParams.billingMode,
      autoRenew: createInstanceInfoParams.autoRenew,
      autoRenewMonth: Number(createInstanceInfoParams.autoRenewMonth),
    })
      .then(() => {
        message.success("success");
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "templateId",
            createInstanceInfoParams.templateId,
          );
        }
        setShowConnectInfo({
          showModal: true,
          instanceInfo: {},
        });
        setShowConfirmCreate({
          ...showConfirmCreate,
          showModal: false,
        });
      })
      .catch((err: any) => {
        if (err?.reason === "INSUFFICIENT_RESOURCE") {
          if (createInstanceInfoParams.billingMode === "spot") {
            message.error(
              "No available Spot instances in this region. Try On-Demand instead.",
            );
          } else {
            message.error("Insufficient resources");
          }
        }
        if (err?.reason === "CUDA_VERSION_INCOMPATIBLE") {
          message.error("CUDA version is incompatible");
        }
        if (err?.reason === "CREATE_GPU_NUM_LIMIT") {
          message.error(dealErrorByObj(err));
        }
      })
      .finally(() => {
        setDeployLoading(false);
      });
  }
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});
  const [balanceTotal, setBalanceTotal] = useState<{
    credit: any;
    userBalance: any;
    voucherBalance: any;
    totalBalance: any;
  }>({
    credit: 0,
    userBalance: 0,
    voucherBalance: 0,
    totalBalance: 0,
  });
  useEffect(() => {
    reqUserInfo({}).then((res: any) => {
      setUserInfo(res || {});
      if (typeof window !== "undefined") {
        const loginMark: any = localStorage.getItem("fromLogin");
        setShowCustomerInfo(
          res?.completeInfoTmpTmp === false && loginMark === "1",
        );
      }
    });
    reqBalanceTotal({ businessType: "gpu_instance" })
      .then((response: any) => {
        setBalanceTotal({
          credit: Number(response.credit),
          totalBalance: Number(response.totalBalance),
          userBalance: Number(response.userBalance),
          voucherBalance: Number(response.voucherBalance),
        });
      })
      .catch(() => {
        setBalanceTotal({
          credit: 0,
          totalBalance: 0,
          userBalance: 0,
          voucherBalance: 0,
        });
      });
  }, []);
  function closeUserCompanyInfo() {
    if (typeof window !== "undefined") {
      localStorage.setItem("fromLogin", "2");
    }
    setShowCustomerInfo(false);
  }
  function emitDataFun(createInstanceInfoInner: any, refresh: boolean = true) {
    if (createInstanceInfoInner) {
      setCreateInstanceInfo(createInstanceInfoInner);
      if (refresh) {
        stepForward(createInstanceInfoInner);
      }
    }
  }
  const [mountLocal, setMountLocal] = useState(false);
  const onLocalVolumeChange = useCallback((mark: boolean) => {
    setMountLocal(mark);
  }, []);
  return (
    <div className={styles.subContainer}>
      <div className={`${styles.section} w-full`}>
        <StepOne
          emitDataFun={emitDataFun}
          createInstanceInfoOut={createInstanceInfo}
        />
        {createInstanceInfo.currProduct && (
          <StepTwo
            onLocalVolumeChange={onLocalVolumeChange}
            ref={stepTwoRef}
            createInstanceInfoOut={{ createInstanceInfo, emitDataFun }}
          />
        )}
        {createInstanceInfo.currProduct && (
          <StepThree
            ref={stepThreeRef}
            createInstanceInfoOut={{ createInstanceInfo }}
          />
        )}
        {createInstanceInfo.currProduct && (
          <div className={styles.btnContainer}>
            <ExploreDeployButton
              step={step}
              usableNode={Boolean(createInstanceInfo?.currProduct?.usableNode)}
              onDeploy={() => {
                stepForward();
              }}
            />
          </div>
        )}
      </div>
      <ExploreModals
        state={{
          showCustomerInfo,
          showConnectInfo,
          showConfirmCreate,
          showParams,
        }}
        actions={{
          closeUserCompanyInfo,
          closeConnectInstanceInfo,
          setShowConnectInfo,
          setShowConfirmCreate,
          confirmFinish,
        }}
      />
    </div>
  );
}
