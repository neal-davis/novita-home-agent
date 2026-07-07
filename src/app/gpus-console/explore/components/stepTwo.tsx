"use client";
import styles from "./stepTwo.module.scss";
import {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { message } from "@/components/ui/standard/notify";
import { reqGetStorage } from "@/api/gpu-instance/storage";
import { checkPorts, dealParamsText } from "@/lib/utils/utils";
import {
  reqGetOfficialTemplates,
  reqGetTemplateById,
  reqGetTemplates,
} from "@/api/gpu-instance/templates";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import Cookies from "js-cookie";
import { reqGetMarketNode } from "@/api/gpu-instance/explore";
import { useAppSelector } from "@/store";
import StepTwoConfiguration from "./StepTwoConfiguration";
import StepTwoModals from "./StepTwoModals";
import StepTwoPodTemplate from "./StepTwoPodTemplate";
const initInvalidDiskMarks: any = {
  containerDisk: "",
  volumeDisk: "",
  volumeMountPath: "",
  networkMountPath: "",
};
const initInvalidConfigMarks: any = {
  image: "",
  httpPorts: "",
  tcpPorts: "",
  key: "",
  value: "",
};
const commonTips = {
  success: "success",
  paginationPreTxt: "Rows per page",
  balanceNotEnough: "Balance is not enough.",
  portLimit: "Please enter valid port, split with [,] port can be 1 to 65535",
  port2000: "Port can not be 2222, 2223, 2224",
  portSame: "Exposed ports cannot be same.",
  httpTcpPortSame: "Exposed http ports and tcp ports cannot be same.",
  httpTcpPortLimit: "Exposed http ports and tcp ports cannot be more than 25.",
  emptyKeyValue: "Key can not be empty",
  loginFailure: "Login failure, please log in again",
  itemIsRequired: "This field is required",
  loginFirst: "Please log in first",
  instanceStatus: {
    Creating: "Creating",
    Created: "Created",
    Starting: "Starting",
    Running: "Running",
    Stopping: "Stopping",
    Exited: "Exited",
    Terminating: "Terminating",
    Terminated: "Terminated",
    creating: "creating",
    toCreate: "toCreate",
    pulling: "pulling",
    running: "running",
    toStart: "toStart",
    starting: "starting",
    migrating: "migrating",
    toStop: "toStop",
    stopping: "stopping",
    exited: "exited",
    toRemove: "toRemove",
    removing: "removing",
    removed: "removed",
    resetting: "resetting",
    toRestart: "toRestart",
    restarting: "restarting",
    other: "other",
  },
  noData: "No Data",
  copyFailed: "Copy failed",
  copySuccess: "Copy success",
  clickCopy: "Click to copy",
  maxHttp10: "The max number of http ports is 10",
  newVoucherTitle: "New Voucher",
  newVoucherTip: "Received a new voucher!",
  newVoucherView: "view",
  invalidImagePath: "The container image is not valid",
  gpuPriceDot: 2,
  storagePriceDot: 3,
};
const StepTwo = (createInstanceInfoOut: any, ref: any) => {
  const [createInstanceInfo, setCreateInstanceInfo] = useState(
    createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo || {},
  );
  const emitDataFun = createInstanceInfoOut?.createInstanceInfoOut?.emitDataFun;
  const userInfo = useAppSelector((state) => state.user);
  const email = useAppSelector((state) => state.user.email);
  const [toolList, setToolList] = useState([]);
  const [tools, setTools] = useState<any>({});
  const [myStorages, setMyStorages] = useState<any>([]);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [networkVolumeSelectOpen, setNetworkVolumeSelectOpen] = useState(false);
  const onLocalVolumeChange = useMemo(
    () => createInstanceInfoOut?.onLocalVolumeChange || (() => {}),
    [createInstanceInfoOut?.onLocalVolumeChange],
  );
  useEffect(() => {
    let createInstanceInfoOutTmp = { ...createInstanceInfo };
    if (createInstanceInfo?.createInstanceInfoOut) {
      createInstanceInfoOutTmp = {
        ...createInstanceInfo.createInstanceInfoOut,
      };
      setCreateInstanceInfo(createInstanceInfoOutTmp);
    }
    onLocalVolumeChange(
      (createInstanceInfoOutTmp?.imageObj?.volumes || []).filter(
        (item: any) => item.type === "local",
      ).length > 0,
    );
    initToollist(createInstanceInfoOutTmp);
    reqGetStorage({}).then((res: any) => {
      setMyStorages(res.data || []);
    });
    reqGetOfficialTemplates({
      channels: ["official"],
      isMyCommunity: true,
    }).then((res: any) => {
      const tmp: any = res?.template || [];
      setTemplateListOfficial(tmp);
      const templates: any = {};
      tmp.forEach((item: any) => {
        if (item.Id === createInstanceInfoOutTmp?.imageID) {
          templates[item?.Id || ""] = true;
        } else {
          templates[item?.Id || ""] = false;
        }
      });
      setOfficialTemplates(templates);
    });
    reqGetTemplates({
      channels: ["private"],
      isMyCommunity: true,
    }).then((res: any) => {
      setTemplateListPrivate(res?.template || []);
    });
  }, [createInstanceInfo, onLocalVolumeChange]);
  useEffect(() => {
    let createInstanceInfoOutTmp =
      createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo || {};
    if (createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo) {
      createInstanceInfoOutTmp = {
        ...createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo,
      };
      setCreateInstanceInfo(createInstanceInfoOutTmp);
    }
    onLocalVolumeChange(
      (createInstanceInfoOutTmp?.imageObj?.volumes || []).filter(
        (item: any) => item.type === "local",
      ).length > 0,
    );
    initToollist(createInstanceInfoOutTmp);
    reqGetStorage({}).then((res: any) => {
      setMyStorages(res.data || []);
    });
    reqGetOfficialTemplates({
      channels: ["official"],
      isMyCommunity: true,
    }).then((res: any) => {
      const tmp: any = res?.template || [];
      setTemplateListOfficial(tmp);
      const templates: any = {};
      tmp.forEach((item: any) => {
        if (item.Id === createInstanceInfoOutTmp?.imageID) {
          templates[item?.Id || ""] = true;
        } else {
          templates[item?.Id || ""] = false;
        }
      });
      setOfficialTemplates(templates);
    });
    reqGetTemplates({
      channels: ["private"],
      isMyCommunity: true,
    }).then((res: any) => {
      setTemplateListPrivate(res?.template || []);
    });
  }, [
    createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo,
    onLocalVolumeChange,
  ]);
  function initToollist(createInstanceInfoOutTmp: any) {
    const toolsOrigin = createInstanceInfoOutTmp?.tools || [];
    const toolList = createInstanceInfoOutTmp?.imageObj?.tools || [];
    setToolList(toolList);
    const tools: any = {};
    for (let mark = 0; mark < toolList.length; mark++) {
      const item: any = toolList[mark];
      if (toolsOrigin.length <= 0) {
        if (localStorage.getItem(item?.name) === "1") {
          tools[item?.name || ""] = true;
        } else {
          tools[item?.name || ""] = false;
        }
      } else {
        if (toolsOrigin.find((ele: any) => ele.name === (item?.name || ""))) {
          tools[item?.name || ""] = true;
        } else {
          tools[item?.name || ""] = false;
        }
      }
    }
    setTools(tools);
  }
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  useImperativeHandle(ref, () => ({
    getCreateParameter: () => {
      const val: any = { ...createInstanceInfo };
      const tmpArr = [];
      const localItem = createInstanceInfo?.volumeMounts?.find(
        (item: any) => item.type === "local",
      );
      if (localItem?.size || localItem?.size === "0" || localItem?.size === 0) {
        tmpArr.push({ ...localItem, mountPath: localItem.mountPath.trim() });
      }
      if (createInstanceInfo.clusterId) {
        const networkItem = createInstanceInfo?.volumeMounts?.find(
          (item: any) => item.type === "network",
        );
        if (networkItem && networkItem.id) {
          const storage: any = myStorages.find(
            (item: any) => item.storageId === networkItem.id,
          );
          if (storage) {
            tmpArr.push({
              ...networkItem,
              size: storage.storageSize,
              mountPath: networkItem.mountPath.trim(),
            });
          } else {
            tmpArr.push({
              ...networkItem,
              mountPath: networkItem.mountPath.trim(),
            });
          }
        }
      }
      const toolsTmp = tools || {};
      const keys = Object.keys(toolsTmp) || [];
      const toolsRet = keys.filter((item: any) => toolsTmp[item]) || [];
      const toolsTmpArr: any = [];
      toolsRet.forEach((item: any) => {
        const eleItem: any = toolList.find((ele: any) => ele.name === item);
        if (eleItem) {
          toolsTmpArr.push({
            name: eleItem.name,
            port: eleItem.port,
            type: eleItem.type,
          });
        }
      });
      return {
        ...val,
        volumeMounts: tmpArr,
        tools: toolsTmpArr,
        imageUrl: val.imageUrl?.trim() || "",
      };
    },
    showInvalidTips: () => {
      return () => setShowInvalidModal(true);
    },
  }));
  function changeCreateInstanceVolumeInfo(item: any, subItem: any, value: any) {
    if (item === "local" && subItem === "size") {
      if (!/^[1-9]\d*$/.test(value) && value !== "0" && value !== "") {
        return;
      }
    }
    const createInstanceInfoTmp = { ...createInstanceInfo };
    const itemTmp = createInstanceInfoTmp?.volumeMounts?.find(
      (ele: any) => ele.type === item,
    ) || { type: item, size: "", id: "", mountPath: "" };
    itemTmp[subItem] = value;
    const itemOuts =
      createInstanceInfoTmp?.volumeMounts.filter(
        (ele: any) => ele.type !== item,
      ) || [];
    const resultArr = [...itemOuts, itemTmp];
    createInstanceInfoTmp.volumeMounts = resultArr;
    setCreateInstanceInfo(createInstanceInfoTmp);
  }
  function changeCreateInstanceInfo(item: any, value: any) {
    if (item === "rootfsSize") {
      if (/^\d+$/.test(value) || value === "") {
        const createInstanceInfoTmp = { ...createInstanceInfo };
        createInstanceInfoTmp[item] = value;
        setCreateInstanceInfo(createInstanceInfoTmp);
        emitDataFun(createInstanceInfoTmp, false);
      }
    } else {
      const createInstanceInfoTmp = { ...createInstanceInfo };
      createInstanceInfoTmp[item] = value;
      setCreateInstanceInfo(createInstanceInfoTmp);
      emitDataFun(createInstanceInfoTmp, false);
    }
  }
  function changeToolItemChecked(item: any, checked: any) {
    localStorage.setItem(item, checked ? "1" : "0");
    setTools({ ...tools, [item]: checked });
  }
  function inputEnvInfo(index: number, item: string, e: any) {
    const envs = [...createInstanceInfo.envs];
    envs[index][item] = e.target.value;
    setCreateInstanceInfo({ ...createInstanceInfo, envs });
  }
  function removeEnv(index: number) {
    const envs = [...createInstanceInfo.envs];
    envs.splice(index, 1);
    setCreateInstanceInfo({ ...createInstanceInfo, envs });
    const envsTmp: any = envs || [];
    for (let mark = 0; mark < envsTmp.length; mark++) {
      if (!envsTmp[mark].key || envsTmp[mark].key.trim() === "") {
        setInvalidConfigMarks({
          ...invalidConfigMarks,
          key: `${"Environment variables key can not be empty."}`,
        });
        return;
      }
      // if (!envsTmp[mark].value || envsTmp[mark].value.trim() === "") {
      //   setInvalidConfigMarks({
      //     ...invalidConfigMarks,
      //     value: `${legacyCopy.envVarValueEmpty}`,
      //   });
      //   return;
      // }
    }
    setInvalidConfigMarks({ ...invalidConfigMarks, value: "", key: "" });
  }
  function addEnvs() {
    const envs = [...createInstanceInfo.envs];
    envs.push({ key: "", value: "" });
    setCreateInstanceInfo({ ...createInstanceInfo, envs });
    setInvalidConfigMarks({
      ...invalidConfigMarks,
      key: `${"Environment variables key can not be empty."}`,
      // value: `${legacyCopy.envVarValueEmpty}`,
    });
  }
  const finishOper = (operMark: any, info: any) => {
    if (info) {
      setMyStorages([...myStorages, { ...info }]);
      const createInstanceInfoTmp = { ...createInstanceInfo };
      const itemTmp = createInstanceInfoTmp?.volumeMounts?.find(
        (ele: any) => ele.type === "network",
      ) || { type: "network", size: "", id: "", mountPath: "" };
      itemTmp["id"] = info.storageId;
      const itemOuts =
        createInstanceInfoTmp?.volumeMounts.filter(
          (ele: any) => ele.type !== "network",
        ) || [];
      const resultArr = [...itemOuts, itemTmp];
      createInstanceInfoTmp.volumeMounts = resultArr;
      setCreateInstanceInfo(createInstanceInfoTmp);
    }
    setShowVolumeModal(false);
  };
  const [invalidDiskMarks, setInvalidDiskMarks] =
    useState<any>(initInvalidDiskMarks);
  function judgeContainerDisk() {
    let tips: any = "";
    if (!createInstanceInfo?.rootfsSize) {
      tips = "Please input valid container disk size";
    } else {
      if (
        Number(createInstanceInfo?.rootfsSize || 0) <
        Number(createInstanceInfo?.currProduct?.minRootFS || 0)
      ) {
        tips = `${dealParamsText("Container disk must be at least ${0} GB", {
          0: createInstanceInfo?.currProduct?.minRootFS || 0,
        })}`;
      } else if (
        Number(createInstanceInfo?.rootfsSize || 0) >
        Number(createInstanceInfo?.currProduct?.maxRootFS || 0)
      ) {
        tips = `${dealParamsText(
          "Container disk can not be greater than ${0} GB",
          {
            0: createInstanceInfo?.currProduct?.maxRootFS || 0,
          },
        )}`;
      }
    }
    setInvalidDiskMarks({ ...invalidDiskMarks, containerDisk: tips });
    return tips;
  }
  function judgeVolumeMountPath(outControl = false) {
    let tips: any = "";
    if (createInstanceInfo.mountLocal || outControl) {
      tips = getInvalidVolumeMountPath();
    }
    setInvalidDiskMarks({ ...invalidDiskMarks, volumeMountPath: tips });
    return tips;
  }
  function getInvalidVolumeMountPath() {
    let tips = "";
    const localVol: any = createInstanceInfo?.volumeMounts?.find(
      (item: any) => item.type === "local",
    );
    if (localVol) {
      if (
        !localVol.mountPath ||
        localVol.mountPath.trim() === "/" ||
        localVol.mountPath[0] !== "/" ||
        localVol.mountPath.indexOf(" ") >= 0
      ) {
        tips = `${"Please enter valid volume mount path."}`;
      }
    }
    return tips;
  }
  function judgeNetworkMountPath() {
    let tips: any = "";
    const netVol: any = createInstanceInfo?.volumeMounts?.find(
      (item: any) => item.type === "network",
    );
    if (netVol) {
      if (
        !netVol.mountPath ||
        netVol.mountPath.trim() === "/" ||
        netVol.mountPath[0] !== "/" ||
        netVol.mountPath.indexOf(" ") >= 0
      ) {
        tips = `${"Please enter valid network mount path."}`;
      }
    }
    setInvalidDiskMarks({ ...invalidDiskMarks, networkMountPath: tips });
    return tips;
  }
  function judgeSumDisk() {
    const tips: any = "";
    // const localVol: any = createInstanceInfo?.volumeMounts?.find((item: any) => item.type === "local");
    // if (Number(createInstanceInfo?.rootfsSize || 0) + Number(localVol?.size || 0) > Number(createInstanceInfo?.currProduct?.expansion || 0)) {
    //   tips = `The sum disk size can not be greater than ${Number(createInstanceInfo?.currProduct?.expansion || 0)} GB.`;
    // }
    // if (item === "volumeDisk") {
    //   const containerTips: any = judgeContainerDisk();
    //   setInvalidDiskMarks({...invalidDiskMarks, volumeDisk: tips, containerDisk: tips || containerTips});
    // } else if (item === "containerDisk") {
    //   const volumeTips: any = judgeVolumeDisk();
    //   setInvalidDiskMarks({...invalidDiskMarks, volumeDisk: tips || volumeTips, containerDisk: tips});
    // }
    return tips;
  }
  const [invalidConfigMarks, setInvalidConfigMarks] = useState<any>(
    initInvalidConfigMarks,
  );
  function judgeImage() {
    let tips: any = "";
    if (
      !createInstanceInfo?.imageUrl ||
      createInstanceInfo?.imageUrl.trim() === "" ||
      createInstanceInfo?.imageUrl.trim().length > 500
    ) {
      tips = `${"Please enter valid image,max length 500"}`;
    }
    setInvalidConfigMarks({ ...invalidConfigMarks, image: tips });
    return tips;
  }
  function judgeEntrypoint() {
    let tips: any = "";
    if (createInstanceInfo?.entrypoint.trim()?.length > 2047) {
      tips = `Entrypoint length cannot exceed 2047 characters`;
    }
    setInvalidConfigMarks({ ...invalidConfigMarks, entrypoint: tips });
    return tips;
  }
  function judgeHttpPorts() {
    let tips: any = "";
    if (createInstanceInfo.httpPorts) {
      const httpPortsInfo: any = checkPorts(
        createInstanceInfo.httpPorts?.split(",") || [],
      );
      if (httpPortsInfo?.length) {
        if (httpPortsInfo[0]) {
          tips = httpPortsInfo[0];
        } else {
          if (httpPortsInfo[1] && httpPortsInfo[1]?.length > 10) {
            tips = `${"HttpPort field must have less than or equal to 10 items."}`;
          }
        }
      }
    }
    setInvalidConfigMarks({ ...invalidConfigMarks, httpPorts: tips });
    return tips;
  }
  function judgeTcpPorts() {
    let tips: any = "";
    if (createInstanceInfo.tcpPorts) {
      const tcpPortsInfo: any = checkPorts(
        createInstanceInfo.tcpPorts?.split(",") || [],
      );
      if (tcpPortsInfo?.length) {
        if (tcpPortsInfo[0]) {
          tips = tcpPortsInfo[0];
        }
      }
    }
    setInvalidConfigMarks({ ...invalidConfigMarks, tcpPorts: tips });
    return tips;
  }
  function judgeKey() {
    let tips: any = "";
    if (createInstanceInfo.envs && createInstanceInfo.envs.length > 0) {
      const envs: any = createInstanceInfo.envs || [];
      const retItem: any = envs.find(
        (item: any) => !item.key || item.key.trim() === "",
      );
      if (retItem) {
        tips = `${"Environment variables key can not be empty."}`;
      }
    }
    setInvalidConfigMarks({ ...invalidConfigMarks, key: tips });
    return tips;
  }
  // function judgeValue() {
  //   let tips: any = "";
  //   if (createInstanceInfo.envs && createInstanceInfo.envs.length > 0) {
  //     const envs: any = createInstanceInfo.envs || [];
  //     const retItem: any = envs.find(
  //       (item: any) => !item.value || item.value.trim() === "",
  //     );
  //     if (retItem) {
  //       tips = `${legacyCopy.envVarValueEmpty}`;
  //     }
  //   }
  //   setInvalidConfigMarks({ ...invalidConfigMarks, value: tips });
  //   return tips;
  // }
  function getDiskInvalidTips() {
    if (invalidDiskMarks) {
      const objs: any = Object.keys(invalidDiskMarks);
      if (objs && objs.length > 0) {
        for (let mark = 0; mark < objs.length; mark++) {
          if (invalidDiskMarks[objs[mark]]) {
            return invalidDiskMarks[objs[mark]];
          }
        }
      }
    }
    return "";
  }
  function getConfigInvalidTips() {
    if (invalidConfigMarks) {
      const objs: any = Object.keys(invalidConfigMarks);
      if (objs && objs.length > 0) {
        for (let mark = 0; mark < objs.length; mark++) {
          if (invalidConfigMarks[objs[mark]]) {
            return invalidConfigMarks[objs[mark]];
          }
        }
      }
    }
    return "";
  }
  const [templateListOfficial, setTemplateListOfficial] = useState([]);
  const [templateListPrivate, setTemplateListPrivate] = useState([]);
  const [officialTemplates, setOfficialTemplates] = useState<any>({});
  function changeImageTemplate(templateType: string, value: any) {
    const createInstanceInfoTmp = { ...createInstanceInfo };
    switch (templateType) {
      case "official":
        createInstanceInfoTmp.templateType = "official";
        createInstanceInfoTmp.templateId = value;
        createInstanceInfoTmp.imageObj =
          templateListOfficial.find((item: any) => item.Id === value) || {};
        break;
      case "private":
        createInstanceInfoTmp.templateType = "private";
        createInstanceInfoTmp.templateId = value;
        createInstanceInfoTmp.imageObj =
          templateListPrivate.find((item: any) => item.Id === value) || {};
        break;
    }
    localStorage.setItem("templateId", value);
    createInstanceInfoTmp.rootfsSize =
      createInstanceInfoTmp.imageObj?.rootfsSize || 0;
    const networkVomumes: any =
      createInstanceInfoTmp.volumeMounts?.filter(
        (item: any) => item.type !== "local",
      ) || [];
    const newLocalVolume: any =
      createInstanceInfoTmp.imageObj?.volumes?.filter(
        (item: any) => item.type === "local",
      ) || [];
    onLocalVolumeChange(newLocalVolume.length > 0);
    const newLocalVolumes: any =
      newLocalVolume.length > 0 ? newLocalVolume : [{ type: "local" }];
    createInstanceInfoTmp.mountLocal = newLocalVolume.length > 0 && false;
    createInstanceInfoTmp.volumeMounts = networkVomumes.concat(newLocalVolumes);
    createInstanceInfoTmp.imageUrl =
      createInstanceInfoTmp.imageObj?.image || "";
    createInstanceInfoTmp.command =
      createInstanceInfoTmp.imageObj?.startCommand || "";
    createInstanceInfoTmp.entrypoint =
      createInstanceInfoTmp.imageObj?.entrypoint || "";
    createInstanceInfoTmp.httpPorts = (
      createInstanceInfoTmp.imageObj?.ports?.find(
        (item: any) => item.type === "http",
      ) || { ports: [] }
    ).ports.join(",");
    createInstanceInfoTmp.tcpPorts = (
      createInstanceInfoTmp.imageObj?.ports?.find(
        (item: any) => item.type === "tcp",
      ) || { ports: [] }
    ).ports.join(",");
    createInstanceInfoTmp.envs = createInstanceInfoTmp.imageObj?.envs || [];
    // todo
    setCreateInstanceInfo(createInstanceInfoTmp);
    initToollist(createInstanceInfoTmp);
  }
  function changeOfficialTemplateCheck(id: any, checked: boolean) {
    const officialTemplatesTmp = { ...officialTemplates };
    const keys: any = Object.keys(officialTemplates);
    if (keys) {
      keys.forEach((item: any) => {
        if (item === id) {
          officialTemplatesTmp[item] = checked;
        } else {
          officialTemplatesTmp[item] = false;
        }
      });
    }
    setOfficialTemplates(officialTemplatesTmp);
    if (checked) {
      changeImageTemplate("official", id);
    } else {
      setCreateInstanceInfo({
        ...createInstanceInfo,
        templateType: "",
        templateId: "",
        imageObj: null,
      });
      // getListData(params);
    }
  }
  function changePrivateTemplate(e: any) {
    const officialTemplatesTmp = { ...officialTemplates };
    const keys: any = Object.keys(officialTemplates);
    if (keys) {
      keys.forEach((item: any) => {
        officialTemplatesTmp[item] = false;
      });
    }
    setOfficialTemplates(officialTemplatesTmp);
    if (e.target.value !== "-1") {
      changeImageTemplate("private", e.target.value);
    } else {
      setCreateInstanceInfo({
        ...createInstanceInfo,
        templateType: "",
        templateId: "",
        imageObj: null,
      });
      // getListData(params);
    }
  }
  const [openChangeTemplate, setOpenChangeTemplate] = useState({
    open: false,
  });
  const [operateInfo, setOperateInfo] = useState<{
    mode: "Create" | "Edit";
    addOpen: boolean;
    templateObj: object;
  }>({ mode: "Edit", addOpen: false, templateObj: {} });
  function finishTemplateOper(mark: boolean) {
    if (mark) {
      message.success("success");
    }
    setOperateInfo((prev: any) => ({
      ...prev,
      addOpen: false,
      templateObj: {},
    }));
  }
  const updateList = (templateId: any) => {
    reqGetTemplates({
      channels: ["private"],
      isMyCommunity: true,
    }).then((res: any) => {
      setOperateInfo((prev: any) => ({
        ...prev,
        addOpen: false,
        templateObj: {},
      }));
      setTemplateListPrivate(res?.template || []);
      const createInstanceInfoTmp = { ...createInstanceInfo };
      const officialTemplatesTmp = { ...officialTemplates };
      const keys: any = Object.keys(officialTemplates);
      if (keys) {
        keys.forEach((item: any) => {
          officialTemplatesTmp[item] = false;
        });
      }
      setOfficialTemplates(officialTemplatesTmp);
      createInstanceInfoTmp.templateType = "private";
      createInstanceInfoTmp.templateId = templateId;
      createInstanceInfoTmp.imageObj =
        (res?.template || []).find((item: any) => item.Id === templateId) || {};
      createInstanceInfoTmp.rootfsSize =
        createInstanceInfoTmp.imageObj?.rootfsSize || 0;
      const networkVomumes: any =
        createInstanceInfoTmp.volumeMounts?.filter(
          (item: any) => item.type !== "local",
        ) || [];
      const newLocalVolume: any =
        createInstanceInfoTmp.imageObj?.volumes?.filter(
          (item: any) => item.type === "local",
        ) || [];
      onLocalVolumeChange(newLocalVolume.length > 0);
      const newLocalVolumes: any =
        newLocalVolume.length > 0 ? newLocalVolume : [{ type: "local" }];
      createInstanceInfoTmp.mountLocal = newLocalVolume.length > 0 && false;
      createInstanceInfoTmp.volumeMounts =
        networkVomumes.concat(newLocalVolumes);
      createInstanceInfoTmp.imageUrl =
        createInstanceInfoTmp.imageObj?.image || "";
      createInstanceInfoTmp.command =
        createInstanceInfoTmp.imageObj?.startCommand || "";
      createInstanceInfoTmp.entrypoint =
        createInstanceInfoTmp.imageObj?.entrypoint || "";
      createInstanceInfoTmp.httpPorts = (
        createInstanceInfoTmp.imageObj?.ports?.find(
          (item: any) => item.type === "http",
        ) || { ports: [] }
      ).ports.join(",");
      createInstanceInfoTmp.tcpPorts = (
        createInstanceInfoTmp.imageObj?.ports?.find(
          (item: any) => item.type === "tcp",
        ) || { ports: [] }
      ).ports.join(",");
      createInstanceInfoTmp.envs = createInstanceInfoTmp.imageObj?.envs || [];
      setCreateInstanceInfo(createInstanceInfoTmp);
    });
  };
  function finishInvalidModal(mark: boolean) {
    setShowInvalidModal(false);
    if (mark) {
      reqGetTemplateById(createInstanceInfo?.imageObj?.Id).then((res: any) => {
        const templateTmp = res?.template || {
          Id: "",
        };
        if (templateTmp.Id) {
          setOperateInfo({
            mode: "Edit",
            addOpen: true,
            templateObj: templateTmp,
          });
        }
      });
    }
  }
  return (
    <div className={`${styles.detailContainer} flex flex-col gap-[20px]`}>
      <div>
        <div className="font-body-medium mb-[8px]">
          <span className="text-[var(--dark-3)]">{"Deploy an Instance >"}</span>{" "}
          <span className="text-[var(--dark-1)]">{"Customize Deployment"}</span>
        </div>
        <div className="h-[1px] bg-[var(--gray-2)] w-full"></div>
      </div>
      {/* <div className="min-w-[324px] py-4 px-3 rounded-md bg-[var(--gray-3)] relative">
            <div className="font-subtle-medium mb-[12px]">
              <span className="text-[var(--dark-1)]">GPUs / Instance : </span>
              <span className="text-[var(--brand-1)]">
                {createInstanceInfo?.gpuNum || 0}
              </span>
              <span className="text-[var(--black)]"> X </span>
              <span className="text-[var(--black)]">
                {createInstanceInfo?.currProduct?.productName || "/"}
              </span>
            </div>
            <div className="px-[6px]">
              <Slider
                className={styles.slider}
                min={1}
                max={createInstanceInfo?.currProduct?.maxGpuNumber || 1}
                value={Number(createInstanceInfo?.gpuNum || 0)}
                onChange={(value: any) => {
                  changeCreateInstanceInfo("gpuNum", value);
                }}
                style={{
                  width: "100%",
                  height: "32px",
                }}
                styles={{
                  track: {
                    backgroundColor: "var(--brand-0)",
                  },
                  rail: {
                    backgroundColor: "#D9D9D9",
                  },
                  handle: {
                    backgroundColor: "var(--brand-0)",
                    color: "var(--brand-0)",
                  },
                }}
                marks={{
                  ...(createInstanceInfo?.GpuNumOptions || [1]).reduce(
                    (acc: any, item: number) => {
                      acc[item] = {
                        style: {
                          color: "var(--dark-2)",
                        },
                        label: (
                          <span className="text-common-dark-4 text-[12px]">
                            {item}
                          </span>
                        ),
                      };
                      return acc;
                    },
                    {},
                  ),
                }}
                step={1}
              />
            </div>
          </div> */}

      <StepTwoPodTemplate
        state={{
          createInstanceInfo,
          invalidDiskMarks,
          myStorages,
          networkVolumeSelectOpen,
        }}
        actions={{
          changeCreateInstanceInfo,
          changeCreateInstanceVolumeInfo,
          setNetworkVolumeSelectOpen,
          setShowVolumeModal,
          setOperateInfo,
        }}
        validators={{
          judgeContainerDisk,
          judgeSumDisk,
          judgeNetworkMountPath,
        }}
        storagePriceDot={commonTips.storagePriceDot}
      />
      <StepTwoConfiguration
        state={{
          createInstanceInfo,
          invalidConfigMarks,
          inputEnvInfo,
        }}
        actions={{
          changeCreateInstanceInfo,
          removeEnv,
          AddEnvs: addEnvs,
        }}
        validators={{
          getConfigInvalidTips,
          judgeImage,
          judgeEntrypoint,
          judgeHttpPorts,
          judgeTcpPorts,
          judgeKey,
        }}
      />

      <div>
        {toolList?.map((item: any) => (
          <div key={item?.name || item?.id} style={{ marginLeft: "3px" }}>
            <label className="inline-flex items-center gap-2">
              <Checkbox
                checked={tools[item?.name || ""]}
                onCheckedChange={(checked) =>
                  changeToolItemChecked(item?.name || "", checked === true)
                }
              />
              <span className={styles.toolList}>
                {item?.describe || ""}&nbsp;({item?.type}: {item?.port})
              </span>
            </label>
          </div>
        ))}
      </div>

      {getDiskInvalidTips() ? (
        <div className={styles.errorTip}>{getDiskInvalidTips()}</div>
      ) : (
        ""
      )}

      <StepTwoModals
        state={{
          showVolumeModal,
          openChangeTemplate,
          createInstanceInfo,
          templateListPrivate,
          operateInfo,
          showInvalidModal,
        }}
        actions={{
          finishOper,
          setOpenChangeTemplate,
          changeImageTemplate,
          changeOfficialTemplateCheck,
          finishTemplateOper,
          updateList,
          setShowInvalidModal,
          finishInvalidModal,
        }}
      />
    </div>
  );
};
export default forwardRef(StepTwo);
