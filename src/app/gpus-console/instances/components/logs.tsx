"use client";
import styles from "./logs.module.scss";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { reqSingleGpuInstance } from "@/api/gpu-instance/instances";
import InstanceLog from "../../components/InstanceLog";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
const distOut = {
  addInstances: "+ GPU Instance",
  nameIdPlaceholderTxt: "Instance Name/ID Filter",
  gpuTypePlaceholderTxt: "GPU Type",
  statusTxt: "Status",
  rowsPerPage: "Rows per page:",
  defaultStatusTxt: "All Status",
  creatorTxt: "Creator",
  creatTimeTxt: "Create Time",
  statusList: [
    {
      value: 0,
      label: "All Status",
    },
    {
      value: "pulling",
      label: "Pulling",
    },
    {
      value: "running",
      label: "Running",
    },
    {
      value: "starting",
      label: "Starting",
    },
    {
      value: "restarting",
      label: "Restarting",
    },
    {
      value: "migrating",
      label: "Migrating",
    },
    {
      value: "stopping",
      label: "Stopping",
    },
    {
      value: "exited",
      label: "Exited",
    },
  ],
  billingModeList: [
    {
      value: 0,
      label: "All",
    },
    {
      value: "monthly",
      label: "Subscription",
    },
    {
      value: "onDemand",
      label: "On Demand",
    },
    {
      value: "spot",
      label: "Spot",
    },
  ],
  moneyChar: "$",
  savingsTxt: "",
  allTxt: "All",
  usingSavingsTxt: "Using Savings",
  notUsingSavingsTxt: "Not Using Savings",
  cpuramInfoTxt: "CPU/RAM: ${0} vCPU, ${1} GB RAM",
  templateTxt: "Template",
  billingMode: "Billing",
  onDemandTxt: "On-Demand-Secure Cloud",
  savingTxt: "Savings Plan",
  savingExpireTxt: "Saving Plan Expire Time",
  netVolTxt: "Network Volume",
  diskTxt: "Disk",
  netVolPath: "Network Volume Path",
  localVolPath: "Local Volume Path",
  dcTxt: "Data Center",
  hourUnit: "hr",
  upgradeTxt: "Upgrade",
  editTxt: "Edit",
  startTxt: "Start",
  restartTxt: "Restart",
  stopTxt: "Stop",
  terminateTxt: "Terminate",
  logsBtnTxt: "Logs",
  connectBtnTxt: "Connect",
  saveImageTxt: "Save Image",
  migrateTxt: "Migrate",
  moreOptionTxt: "More Operations",
  upgradeTips:
    "Upgrade Docker Image, Container Registry Credentials, Container Start Command and Environment Variables.",
  editTips: "Edit Container Disk, HTTP Ports and TCP Ports.",
  editNameModal: {
    instanceName: "Edit Instance Name",
    placeholderTxt: "Enter your instance name",
    cancelBtnTxt: "Cancel",
    confirmBtnTxt: "Confirm",
  },
  nameWarningTxt: "please input valid instance name",
  markedInstanceTips:
    "Reserved instances cannot be stopped or released before their expiration. If you need to stop or release them, please contact your account manager.",
  upgradeModal: {
    title: "Upgrade",
    funDesc: 'Choosing "Upgrade" will cause your running Instance to',
    resetTxt: "reset",
    latestChar: "!",
    dockerImageNameTxt: "Docker Image Name",
    containerRefCredTxt: "Container Registry Credentials",
    containerStartComm: "Container Start Command",
    addCredentialsTxt: "+ Add Credentials",
    startCommandTxt: "Container Start Command",
    startCommandPlaceholder: "Enter your Container Start Command",
    envVarTxt: "Environment Variables",
    envKeyTxt: "key",
    envValueTxt: "value",
    addEnvVarBtnTxt: "+ Add Environment Variable",
    envKeyValueEmptyTxt: "Key or value can not be empty",
    isSaveData: "Save data on reset",
    saveDataDescPrefixTxt: "If the data and system are incompatible, the data",
    saveDataDescSuffixTxt: "cannot be saved",
    cancelBtnTxt: "Cancel",
    upgradeBtnTxt: "Upgrade",
    invalidImage: "Please input valid image, max length 500",
  },
  saveImageModal: {
    title: "Save Image",
    tips: "After adjusting the instance, you can save the updated instance as an image, and then create new templates and instances based on the latest image!",
    imagePathTxt: "Image Path",
    containerRefCredTxt: "Container Registry Credentials",
    addCredentialsTxt: "+ Add Credentials",
    invalidImageData:
      "The image path and container registry credentials can not be empty, and the image path can not contain whitespace characters",
    imagePathPlaceholder: "Please input your Image address",
    containerRefCredPlaceholder: "Please Select Credentials",
    cancelBtnTxt: "Cancel",
    saveBtnTxt: "Save",
  },
  jobCreateSuccessModal: {
    title: "Job Created Success",
    tips1: "A job has been created. Job ID: ",
    tips2:
      ". You can view and manage your jobs in the [Console - Jobs]. Once the job is complete, you'll be able to view the saved image in your image repository.",
    toJobsTxt: "To [Jobs]",
    closeBtnTxt: "Close",
  },
  editModal: {
    title: "Edit Instance",
    tenWarnings: "HttpPort field must have less than or equal to 10 items.",
    maxSizeWarnings:
      "Please enter a valid local volume size and can not be greater than ${0} GB",
    funcDesc:
      "You can edit while the instance is running ,you won't lose data.",
    volDiskTxt: "Volume Disk",
    httpPortsExposeTxt: "Expose HTTP Ports (Max 10)",
    tcpPortsExposeTxt: "Expose TCP Ports",
    inUsePortTxt: "Port: ${0} is already in use",
    inUsePortsTxt: "Ports: ${0} are already in use",
    invalidVolumeSize:
      "Please enter a valid local volume size and can not be smaller than the original value(${0} GB)",
    cancelBtnTxt: "Cancel",
    saveBtnTxt: "Save",
    success: "Success",
    localDiskSize: "Enter your volume disk size",
  },
  startModal: {
    title: "Start Instance",
    tip1: "Start your Instance. If you have a volume configured, it will be retrieved and mounted.",
    tip2Prefix: "The current machine price for",
    tip2Suffix: "${0}x ${1} is $${2}/hr",
    cancelBtnTxt: "Cancel",
    startBtnTxt: "Start",
  },
  restartModal: {
    title: "Restart Instance",
    tip11:
      "You will restart the running instance, please confirm whether to continue?",
    cancelBtnTxt: "Cancel",
    restartBtnTxt: "Restart",
  },
  unabledStartInstanceNoSourceModal: {
    title: "Unable to start",
    tipsTitle:
      "This node currently has no available resources. Would you like to migrate to a resource of the same specification?",
    tip: "After migration, the instance information (Instance ID, Egress IP, etc.) will remain unchanged. However,",
    saveDataTxt:
      " the migration will result in data loss on the system disk and local disk. ",
    tip2: "Please ensure data is backed up in advance.",
    cancelBtnTxt: "Cancel",
    migrateBtnTxt: "Migrate now",
  },
  migrateModal: {
    title: "Instance Migration",
    tips: "Please confirm whether to migrate the instance",
    cancelBtnTxt: "Cancel",
    yesBtnTxt: "Confirm",
  },
  stopModal: {
    title: "Stop Instance",
    tip11: "Stop your instance. You can start the instance later, but it is",
    tip12: "not guaranteed",
    tip13: "to be",
    tip14: "available",
    tip2: "All data will be saved for 7 days,otherwise it will be lost!",
    tip3: "You will be charged $${0}/GB per day for volume storage while your instance is idle",
    tip4: "Please terminate your instance after stopping it to avoid disk charges!",
    cancelBtnTxt: "Cancel",
    stopBtnTxt: "Stop",
  },
  terminateModal: {
    title: "Terminate Instance",
    tip11: "Delete your instance.",
    tip12:
      "This action will remove your pod configuration as well as any non-network volumes and data associated with it.",
    tip13: "This is irreversible! Do you want to proceed?",
    cancelBtnTxt: "Cancel",
    yesBtnTxt: "Yes",
  },
  logsModal: {
    title: "Logs",
    sysLogTxt: "System Logs",
    insLogsTxt: "Instance Logs",
    closeBtnTxt: "Close",
  },
  connectModal: {
    title: "Connect",
    connOptTxt: "Connection Options",
    tcpMapTxt: "TCP Port Mappings",
    confPubKeyTxt: "Configure Public Key",
    httpPortTxt: "Connect to HTTP Service [Port ${0}]",
    httpToolTxt: "Connect to ${0} [Port ${1}]",
    startWebTerBtnTxt: "Start Web Terminal",
    connectWebTerBtnTxt: "Connect to Web Terminal",
    stopWebTerBtnTxt: "Stop Web Terminal",
    usernameTxt: "username",
    password: "password",
    sshTips: "Basic SSH Terminal:",
    tcpMapTip11:
      "These are the TCP Port mappings that you can use to connect to your pod If you're not sure what to do with these, you can",
    tcpMapTip12: "Click Here to Learn More",
    tcpMapContent: "Internal: ${0} External: ${1}",
    configPubKeyDesc:
      "Run the follow command to generate your public/private key pair.",
    configPubHelpTip11: "You can add your SSH public key in the",
    configPubHelpTip12: "Settings",
    configPubHelpTip13: "menu",
    configPubLearnMoreTip11: "Learn more about",
    configPubLearnMoreTip12: "generating SSH keys",
    configPubLearnMoreTip13: "",
    closeBtnTxt: "Close",
  },
  stateUtc: true,
  stateCreateDateTips: "Last start time:",
  batchOperations: "Batch Operations",
  cancelBatchOperations: "Cancel Batch Operations",
};
export default function Logs({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo, setInstanceInfo] = useState({
    ...instanceInfoObj,
    httpPorts:
      instanceInfoObj?.portMappings?.filter(
        (item: any) => item.type === "http",
      ) || [],
    tcpPorts:
      instanceInfoObj?.portMappings?.filter(
        (item: any) => item.type === "tcp",
      ) || [],
  });
  useEffect(() => {
    if (instanceInfo.id) {
      getSingleGpuInstance(instanceInfo.id);
    }
  }, [instanceInfo.id]);
  function getSingleGpuInstance(id: string) {
    reqSingleGpuInstance(id)
      .then((res: any) => {
        const instanceInfoObj: any = res || {};
        setInstanceInfo({
          ...instanceInfoObj,
          httpPorts:
            instanceInfoObj?.portMappings?.filter(
              (item: any) => item.type === "http",
            ) || [],
          tcpPorts:
            instanceInfoObj?.portMappings?.filter(
              (item: any) => item.type === "tcp",
            ) || [],
        });
      })
      .catch(() => {
        setInstanceInfo({});
      });
  }
  const [alignment, setAlignment] = useState("left");
  const children = [
    <ToggleGroupItem
      style={{
        border: "none",
        marginRight: "8px",
        background: alignment === "left" ? "var(--gray-3)" : "",
        borderRadius: "4px",
        textTransform: "none",
      }}
      value="left"
      key="left"
      id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SHOW_SYSTEM_LOGS}
    >
      <span
        className={
          alignment === "left" ? styles.selectedTabTxt : styles.unSelectedTabTxt
        }
      >
        {"System Logs"}
      </span>
    </ToggleGroupItem>,
    <ToggleGroupItem
      style={{
        border: "none",
        background: alignment === "right" ? "var(--gray-3)" : "",
        borderRadius: "4px",
        textTransform: "none",
      }}
      value="right"
      key="right"
      id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SHOW_INSTANCE_LOGS}
    >
      <span
        className={
          alignment === "right"
            ? styles.selectedTabTxt
            : styles.unSelectedTabTxt
        }
      >
        {"Instance Logs"}
      </span>
    </ToggleGroupItem>,
  ];
  const pollCounterRef = useRef(30);
  useEffect(() => {
    const timerHandler = setInterval(() => {
      if (pollCounterRef.current <= 0) {
        pollCounterRef.current = 30;
      }
      if (pollCounterRef.current % 3 === 0 && instanceInfo.id) {
        getSingleGpuInstance(instanceInfo.id);
      }
      pollCounterRef.current -= 1;
    }, 3000);

    return () => {
      clearInterval(timerHandler);
    };
  }, [instanceInfo.id]);
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Logs"}</h1>
        <div>
          <div className={styles.toggleBtn}>
            <ToggleGroup
              type="single"
              value={alignment}
              onValueChange={(value) => value && setAlignment(value)}
              style={{ height: "100%", width: "100%" }}
              aria-label="Large sizes"
            >
              {children}
            </ToggleGroup>
          </div>
          {alignment === "left" ? (
            <div
              style={{
                marginTop: "16px",
              }}
            >
              <InstanceLog
                outHeight={"50vh"}
                address={instanceInfo?.connectComponentLog?.systemLogAddress}
              />
            </div>
          ) : (
            ""
          )}

          {alignment === "right" ? (
            <div
              style={{
                marginTop: "16px",
              }}
            >
              <InstanceLog
                outHeight={"50vh"}
                address={instanceInfo?.connectComponentLog?.instanceLogAddress}
              />
            </div>
          ) : (
            ""
          )}
          <div style={{ marginTop: "24px" }}>
            <Button
              onClick={() => finishForm()}
              className={styles.closeBtn}
              variant="default"
            >
              <span className={styles.closeBtnTxt}>{"Close"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
