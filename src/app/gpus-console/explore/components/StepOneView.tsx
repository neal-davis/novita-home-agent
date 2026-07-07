"use client";

import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { ValueSlider as Slider } from "@/components/ui/standard/value-slider";
import Modal from "@/app/components/Modal/Modal";
import { Info as InfoCircleOutlined } from "lucide-react";
import ReadMe from "./readMe";
import AddTemplate from "@/app/gpus-console/components/addTemplate";
import Segmente from "./segmente";
import AddNetworkVolume from "../../storage/components/addNetworkVolume";
import { matchLogoForTemplate } from "@/lib/utils/utils";
import { SelectFilter } from "@/components/ui/standard/selectFilter";
import { Button } from "@/components/ui/button";
import ChangeTemplateModal from "./changeNewTemplate";
import { Input } from "./Input";
import Image from "next/image";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StepOneProductOptions from "./StepOneProductOptions";
import styles from "./stepOne.module.scss";
import type { Dispatch, RefObject, SetStateAction } from "react";

const CREATE_VOLUME_OPTION_VALUE = "__create_network_volume__";
const newTagStyle = {
  fontSize: "12px",
  fontWeight: "400",
  fontStyle: "normal",
  lineHeight: "14px",
  position: "absolute",
  color: "var(--white)",
  backgroundColor: "var(--brand-1)",
  left: "0",
  top: "0",
  padding: "1px 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "5px 0",
} as const;
const MyModal = Modal;

type SelectOption = {
  label?: string;
  text?: string;
  value: string;
  [key: string]: unknown;
};

type ReadMeState = {
  showModal: boolean;
  readMe: string;
};

type StepOneState = {
  createInstanceInfo: Record<string, any>;
  setCreateInstanceInfo: Dispatch<SetStateAction<any>>;
  recommendCardsShow: any[];
  productsLoading: boolean;
  params: Record<string, any>;
  filters: Record<string, any[]>;
  dataInit: boolean;
  myRef: RefObject<HTMLDivElement>;
  products: any[];
  deployObj: Record<string, any>;
  currentGpuNum: number;
  showReadMe: ReadMeState;
  templateListPrivate: any[];
};

type StepOneOptions = {
  selectedNetworkVolumeId: string | number;
  networkVolumeOptions: SelectOption[];
  isNetworkVolumeUnsupported: boolean;
  clusterOptions: SelectOption[];
  gpuNumMax: number;
  gpuNumOptions: number[];
};

type StepOneActions = {
  setShowReadMe: Dispatch<SetStateAction<ReadMeState>>;
  createMyTemplate: () => void;
  setOpenChangeTemplate: Dispatch<SetStateAction<any>>;
  inputSetParamsText: (key: string, value: any, valueType?: string) => void;
  openCreateNetworkVolume: () => void;
  changeCreateInstanceVolumeInfo: (item: any, subItem: any, value: any) => void;
  deployFun: (currProduct: any) => void;
  submitRequest: (productName: any, gpuNum: any) => void;
  setCurrentGpuNum: Dispatch<SetStateAction<number>>;
  changeGPUNumCreateInstanceInfo: (value: any) => void;
  closeReadMe: () => void;
  addTemplate: (template: any) => void;
  updateList: (templateId: any) => void;
  finishOper: (operMark: any, info: any) => void;
  changeImageTemplate: (templateType: string, templateId: any) => void;
  changeOfficialTemplateCheck: (templateId: any, checked: boolean) => void;
};

type StepOneModals = {
  showCreateTemplateModal: boolean;
  showVolumeModal: boolean;
  openChangeTemplate: {
    open: boolean;
  };
};

export type StepOneViewProps = {
  state: StepOneState;
  options: StepOneOptions;
  actions: StepOneActions;
  modals: StepOneModals;
};

// react-doctor-disable-next-line react-doctor/no-giant-component -- View-only adapter around the historical deploy wizard; props are grouped and deeper section extraction is follow-up work.
export default function StepOneView({
  state,
  options,
  actions,
  modals,
}: StepOneViewProps) {
  const {
    createInstanceInfo,
    setCreateInstanceInfo,
    recommendCardsShow,
    productsLoading,
    params,
    filters,
    dataInit,
    myRef,
    products,
    deployObj,
    currentGpuNum,
    showReadMe,
    templateListPrivate,
  } = state;
  const {
    selectedNetworkVolumeId,
    networkVolumeOptions,
    isNetworkVolumeUnsupported,
    clusterOptions,
    gpuNumMax,
    gpuNumOptions,
  } = options;
  const {
    setShowReadMe,
    createMyTemplate,
    setOpenChangeTemplate,
    inputSetParamsText,
    openCreateNetworkVolume,
    changeCreateInstanceVolumeInfo,
    deployFun,
    submitRequest,
    setCurrentGpuNum,
    changeGPUNumCreateInstanceInfo,
    closeReadMe,
    addTemplate,
    updateList,
    finishOper,
    changeImageTemplate,
    changeOfficialTemplateCheck,
  } = actions;
  const { showCreateTemplateModal, showVolumeModal, openChangeTemplate } =
    modals;

  return (
    <div className="bg-[var(--white)] rounded-[6px]">
      <div className="mb-[20px]">
        <div className="font-body-medium text-[var(--black)] mb-[8px]">
          Deploy an Instance
        </div>
        <div className="h-[1px] bg-[var(--gray-2)] w-full"></div>
      </div>
      {createInstanceInfo?.imageObj?.Id ? (
        <div className={`${styles.mr5} ${styles.selectedTmpObjContainer}`}>
          {createInstanceInfo?.imageObj?.extra?.tags?.includes("NEW") && (
            <div
              className="font-small-console text-[var(--black)]"
              style={newTagStyle}
            >
              New
            </div>
          )}
          <div className="w-full flex items-center justify-between">
            {/* <div className={styles.currentTemplate}>Current Template</div> */}
            <div
              className="flex flex-row"
              style={{
                width: "calc(100% - 20px)",
              }}
            >
              <Image
                alt="icon"
                src={matchLogoForTemplate(
                  createInstanceInfo?.imageObj?.logo,
                  createInstanceInfo?.imageObj?.image,
                )}
                width={24}
                height={24}
                className={styles.tmpLogo}
              />
              <span className={styles.selectTmpTxtContainer}>
                <div className={styles.selectTmpNameTxt}>
                  {createInstanceInfo?.imageObj?.name || "/"}{" "}
                  <Tooltip title={<div>README</div>}>
                    <Button
                      variant="noborderghost"
                      size="icon"
                      onClick={() =>
                        setShowReadMe({
                          showModal: true,
                          readMe: createInstanceInfo?.imageObj?.readme || "",
                        })
                      }
                      className={styles.iconBtn}
                      id={CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_README}
                    >
                      <span
                        className={`iconfont icon-badge-info ${styles.inlineDisp}`}
                      />
                      {/* <img
  alt=""
  className={styles.inlineDisp}
  src="/gpu-instance/explore/icon-readmeDetail.svg"
/> */}
                    </Button>
                  </Tooltip>
                </div>
                <div className={styles.selectTmpImageTxt}>
                  {createInstanceInfo?.imageObj?.image || "/"}
                </div>
              </span>
            </div>
            <div className="flex flex-row gap-4">
              <Button
                onClick={() => createMyTemplate()}
                variant="outline"
                className="!px-[12px] !py-[6px]"
                size="sl"
                id={CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_CREATE_MY_TEMPLATE}
              >
                + Create Template
              </Button>
              <Button
                onClick={() =>
                  setOpenChangeTemplate({
                    open: true,
                  })
                }
                variant="default"
                className="!px-[12px] !py-[6px]"
                size="sl"
                id={CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_CHANGE_TEMPLATE}
              >
                Change Template
              </Button>
            </div>
          </div>
          {(createInstanceInfo?.imageObj?.recommendCards || []).length > 0 &&
          recommendCardsShow.length > 0 ? (
            <div className="ml-[56px] mt-2 flex items-center gap-1 justify-start">
              <span className="inline-flex items-center gap-1 justify-center px-2 py-[2px] bg-[var(--gray-3)] h-6 rounded-[6px]">
                <Image
                  src="/gpu-instance/explore/favorite.svg"
                  alt="favorate"
                  width={14}
                  height={14}
                />
                <span className="font-small-console text-[var(--brand-1)]">
                  Featured GPUs
                </span>
              </span>
              {recommendCardsShow.map((item: any, index: number) => (
                <span key={item} className="contents">
                  <span className="inline-flex items-center justify-center px-[6px] py-[2px] h-6 rounded-[2px]">
                    <span className="font-small-console text-[var(--dark-2)]">
                      {item}
                    </span>
                  </span>
                  {index < recommendCardsShow.length - 1 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="5"
                      height="4"
                      viewBox="0 0 5 4"
                      fill="none"
                    >
                      <circle cx="2.5" cy="2" r="2" fill="#BBB9B6" />
                    </svg>
                  )}
                </span>
              ))}
            </div>
          ) : !(createInstanceInfo?.imageObj?.recommendCards || []).length &&
            createInstanceInfo?.imageObj?.channel === "official" ? (
            <div className="ml-[56px] mt-2 flex items-center gap-1 justify-start">
              <span className="inline-flex items-center justify-center px-2 py-[2px] bg-[var(--gray-3)] h-6 rounded-[2px]">
                <span className="font-small-console text-[var(--dark-2)]">
                  This template is a basic environment template and is
                  applicable to all GPUs.
                </span>
              </span>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        ""
      )}
      <div className={styles.bothContainer}>
        <div className={styles.filterArea}>
          <div className={styles.networkContainer}>
            <div className={styles.instanceFilterRow}>
              <div className={styles.spotTag}>Spot up to 50% off</div>
              <div>
                <Select
                  disabled={productsLoading}
                  value={params.billingMethod}
                  onValueChange={(value) => {
                    inputSetParamsText("billingMethod", value, "value");
                    setCreateInstanceInfo({
                      ...createInstanceInfo,
                      billingMode: value,
                      productId: null,
                      currProduct: null,
                      gpuNum: 1,
                    });
                  }}
                >
                  <SelectTrigger
                    className={`${styles.selectItem} ${styles.aniItem} ${styles.selectFilterItemW100} !w-[260px]`}
                  >
                    {(() => {
                      const selected = params.billingMethod;
                      return (
                        <span
                          className={`${styles.selectValueContent} text-[var(--dark-1)]`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            {/* i18n-disable-next-line */}
                            <g clipPath="url(#clip0_5394_4611)">
                              <path
                                d="M10 6L6 10M6 6H6.01M10 10H10.01M14.67 8C14.67 11.68 11.68 14.67 8 14.67C4.32 14.67 1.33 11.68 1.33 8C1.33 4.32 4.32 1.33 8 1.33C11.68 1.33 14.67 4.32 14.67 8Z"
                                stroke="black"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_5394_4611">
                                <rect width="16" height="16" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          {selected === "onDemand" && (
                            <span className={styles.selectValueText}>
                              On Demand
                            </span>
                          )}
                          {selected === "monthly" && (
                            <span className={styles.selectValueText}>
                              Subscription
                            </span>
                          )}
                          {selected === "spot" && (
                            <span className={styles.selectValueText}>
                              Spot
                              <span className="text-[var(--brand-1)] ml-1">
                                {"(50% Off, Interruptible)"}
                              </span>
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </SelectTrigger>
                  <SelectContent className={styles.filterSelectMenu}>
                    <SelectItem className={styles.menuItem} value={"onDemand"}>
                      {"On Demand"}
                    </SelectItem>
                    <SelectItem className={styles.menuItem} value={"monthly"}>
                      {"Subscription"}
                    </SelectItem>
                    <SelectItem className={styles.menuItem} value={"spot"}>
                      <Tooltip
                        placement="left"
                        title="Spot instances offer low prices but may be interrupted at any time. Best suited for fault-tolerant tasks. A 1-hour protection period is applied by default."
                      >
                        {"Spot"}
                        <span className="text-[var(--brand-1)] ml-1">
                          {"(50% Off, Interruptible)"}
                        </span>
                      </Tooltip>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={styles.networkVolumeFilter}>
                <SelectFilter
                  {...{
                    value: String(selectedNetworkVolumeId),
                    options: networkVolumeOptions,
                    onValueChange: (value) => {
                      if (value === CREATE_VOLUME_OPTION_VALUE) {
                        openCreateNetworkVolume();
                        return;
                      }
                      changeCreateInstanceVolumeInfo("network", "id", value);
                    },
                    onClear: () =>
                      changeCreateInstanceVolumeInfo("network", "id", "-1"),
                    allowClear: selectedNetworkVolumeId !== "-1",
                    // i18n-disable-next-line
                    clearAriaLabel: "Clear network volume",
                    getOptionValue: (item: any) => String(item.storageId),
                    getOptionLabel: (item: any) => item.storageName,
                    getOptionSearchText: (item: any) => [
                      item.storageName,
                      item.storageId,
                    ],
                    renderTrigger: (item: any) => (
                      <span
                        className={`${styles.selectValueContent} text-[var(--dark-1)]`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M14.67 8H1.33M14.67 8V12C14.67 12.35 14.53 12.69 14.28 12.94C14.03 13.19 13.69 13.33 13.33 13.33H2.67C2.31 13.33 1.97 13.19 1.72 12.94C1.47 12.69 1.33 12.35 1.33 12V8M14.67 8L12.37 3.41C12.26 3.18 12.09 3 11.88 2.87C11.66 2.74 11.42 2.67 11.17 2.67H4.83C4.58 2.67 4.34 2.74 4.12 2.87C3.91 3 3.74 3.18 3.63 3.41L1.33 8M4 10.67H4.01M6.67 10.67H6.67"
                            stroke="#292827"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className={styles.selectValueText}>
                          {item?.storageName || selectedNetworkVolumeId}
                        </span>
                      </span>
                    ),
                    renderOption: (item: any) => item.storageName,
                    // i18n-disable-next-line
                    placeholder: "Network Volume",
                    inputPlaceholder: "Search volume",
                    emptyText: "No matching volumes found",
                    triggerClassName: `${styles.selectItem} ${styles.aniItem} ${styles.selectFilterItemW100} !w-[220px]`,
                    contentClassName: styles.filterSelectMenu,
                    itemClassName: styles.menuItem,
                  }}
                />
                {isNetworkVolumeUnsupported && (
                  <span className={styles.notSupport}>
                    <InfoCircleOutlined className={styles.notSupportIcon} />
                    {"Network Volume is not available in this region"}
                  </span>
                )}
              </div>
              <SelectFilter
                {...{
                  value: params.clusterId,
                  options: clusterOptions,
                  onValueChange: (value) =>
                    inputSetParamsText("clusterId", value, "value"),
                  onClear: () => inputSetParamsText("clusterId", "-1", "value"),
                  allowClear: params.clusterId !== "-1",
                  // i18n-disable-next-line
                  clearAriaLabel: "Clear region",
                  getOptionValue: (item: any) => String(item.id),
                  getOptionLabel: (item: any) => item.name,
                  getOptionSearchText: (item: any) => [item.name, item.id],
                  renderTrigger: (item: any) => {
                    const selected = params.clusterId;
                    return (
                      <span
                        className={`${styles.selectValueContent} text-[var(--dark-1)]`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          {/* i18n-disable-next-line */}
                          <g clipPath="url(#clip0_5319_4594)">
                            <path
                              d="M14.36 10H11.33C10.98 10 10.64 10.14 10.39 10.39C10.14 10.64 10 10.98 10 11.33V14.36M4.67 2.23V3.33C4.67 3.86 4.88 4.37 5.25 4.75C5.63 5.12 6.14 5.33 6.67 5.33C7.02 5.33 7.36 5.47 7.61 5.72C7.86 5.97 8 6.31 8 6.67C8 7.4 8.6 8 9.33 8C9.69 8 10.03 7.86 10.28 7.61C10.53 7.36 10.67 7.02 10.67 6.67C10.67 5.93 11.27 5.33 12 5.33H14.11M7.33 14.63V12C7.33 11.65 7.19 11.31 6.94 11.06C6.69 10.81 6.35 10.67 6 10.67C5.65 10.67 5.31 10.53 5.06 10.28C4.81 10.03 4.67 9.69 4.67 9.33V8.67C4.67 8.31 4.53 7.97 4.28 7.72C4.03 7.47 3.69 7.33 3.33 7.33H1.37M14.67 8C14.67 11.68 11.68 14.67 8 14.67C4.32 14.67 1.33 11.68 1.33 8C1.33 4.32 4.32 1.33 8 1.33C11.68 1.33 14.67 4.32 14.67 8Z"
                              stroke="#292827"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_5319_4594">
                              <rect width="16" height="16" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                        <span className={styles.selectValueText}>
                          {selected === "-1"
                            ? "Any Region"
                            : item?.name || selected}
                        </span>
                        {createInstanceInfo?.imageObj?.clusterIds?.includes(
                          selected,
                        ) && (
                          <Image
                            src="/gpu-instance/explore/prewarm.svg"
                            alt="prewarm"
                            width={18}
                            height={18}
                            className="inline-block w-[18px] h-[18px] ml-[-4px]"
                          />
                        )}
                      </span>
                    );
                  },
                  renderOption: (item: any) => {
                    const optionContent = (
                      <span className="w-full h-full inline-flex items-center">
                        {item.name}
                        {createInstanceInfo?.imageObj?.clusterIds?.includes(
                          item.id,
                        ) && (
                          <Image
                            src="/gpu-instance/explore/prewarm.svg"
                            alt="prewarm"
                            width={18}
                            height={18}
                            className="inline-block w-[18px] h-[18px] ml-1"
                          />
                        )}
                      </span>
                    );

                    return item.supportNetStorage ? (
                      <Tooltip
                        placement="left"
                        mouseEnterDelay={0}
                        mouseLeaveDelay={0}
                        zIndex={9999}
                        title="This cluster supports NAS"
                      >
                        {optionContent}
                      </Tooltip>
                    ) : (
                      optionContent
                    );
                  },
                  // i18n-disable-next-line
                  placeholder: "Any Region",
                  inputPlaceholder: "Search region",
                  emptyText: "No matching regions found",
                  triggerClassName: `${styles.selectItem} ${styles.aniItem} ${styles.selectFilterItemW100} !w-[220px]`,
                  contentClassName: styles.filterSelectMenu,
                  itemClassName: styles.menuItem,
                }}
              />

              <div className={styles.secureCloudFilter}>
                <div className="flex flex-row items-center gap-1">
                  <div
                    className={`${styles.networkVolTxt} !mb-0 !text-[var(--black)]`}
                  >
                    {"Show Secure Cloud Only"}
                  </div>
                  <Tooltip
                    overlayInnerStyle={{ width: "340px", padding: "12px" }}
                    placement="topRight"
                    title={
                      <div>
                        <div>
                          GPU Cloud includes{" "}
                          <span className="font-medium">Secure Cloud</span> and{" "}
                          <span className="font-medium">Community Cloud</span>
                        </div>
                        <div className="font-medium">Secure Cloud: </div>
                        <div>
                          GPU instances that run in T3/T4 data centers,
                          providing high reliability and security.
                        </div>
                        <div className="font-medium">Community Cloud: </div>
                        <div>
                          GPU instances connect distributed compute providers to
                          consumers through a vetted, secure peer-to-peer
                          system.
                        </div>
                      </div>
                    }
                  >
                    <span className="iconfont icon-badge-help text-[var(--dark-2)]"></span>
                  </Tooltip>
                </div>
                <div className="h-[20px] ml-[8px]">
                  <Switch
                    className="h-[20px] w-[36px]"
                    size="sm"
                    checked={params.cloudServiceType?.indexOf("Center") !== -1}
                    onCheckedChange={(checked: any) => {
                      inputSetParamsText(
                        "cloudServiceType",
                        checked ? "Center" : "",
                        "value",
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className={`flex flex-row items-center gap-[12px] ${
                isNetworkVolumeUnsupported ? "mt-[36px]" : ""
              }`}
            >
              <div>
                <div
                  className={`${styles.cpuPerGpuTxt} flex flex-row items-center gap-[6px]`}
                >
                  <span>{"vCPUs per GPU"}</span>
                  <Tooltip
                    overlayInnerStyle={{ width: "340px", padding: "12px" }}
                    placement="top"
                    title={
                      <div>
                        The minimum number of virtual CPUs assigned per GPU.
                        Determines the processing power available for each GPU.
                      </div>
                    }
                  >
                    <span className="iconfont icon-badge-help text-[var(--dark-2)]"></span>
                  </Tooltip>
                </div>

                <Select
                  value={params.cpuModel}
                  onValueChange={(v: any) =>
                    inputSetParamsText("cpuModel", v, "value")
                  }
                >
                  <SelectTrigger className="w-[110px] h-[32px] text-[var(--dark-1)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(filters &&
                    filters.cpuModels &&
                    filters.cpuModels.length > 0
                      ? filters.cpuModels
                      : []
                    ).map((type: any) => (
                      <SelectItem value={type} key={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div
                  className={`${styles.ramPerGpuTxt} flex flex-row items-center gap-[6px]`}
                >
                  <span>{"System Memory per GPU"}</span>
                  <Tooltip
                    overlayInnerStyle={{ width: "340px", padding: "12px" }}
                    placement="top"
                    title={
                      <div>
                        The minimum amount of system memory assigned per GPU.
                        Usually you should aim to have at least as much System
                        RAM as VRAM.
                      </div>
                    }
                  >
                    <span className="iconfont icon-badge-help text-[var(--dark-2)]"></span>
                  </Tooltip>
                </div>
                <Segmente
                  options={
                    filters.memoryModels && filters.memoryModels.length > 0
                      ? filters.memoryModels
                      : []
                  }
                  onChange={(v: any) =>
                    inputSetParamsText("memoryModel", v, "value")
                  }
                  value={params.memoryModel}
                />
              </div>
              <div>
                <div className={styles.cudaAllowed}>Container Disk (GB)</div>
                <div className="w-[180px] h-[32px] relative">
                  <Input
                    className="pl-8 pr-8 h-12 hover:border-[var(--dark-4)] text-center w-[180px] h-[32px]"
                    ref={myRef as unknown as RefObject<HTMLInputElement>}
                    // type="number"
                    // min={0}
                    // required={true}
                    // inputMode="numeric"
                    value={params.rootFSSize + ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[1-9]\d*$/.test(value + "") || value === "0") {
                        // debouncedInput(value.trim());
                        inputSetParamsText("rootFSSize", value, "value");
                      } else {
                        e.target.value = params.rootFSSize + "";
                        return;
                      }
                    }}
                    prefixIcon={
                      <>
                        <Button
                          type="button"
                          variant="noborderghost"
                          size="icon"
                          onClick={() => {
                            inputSetParamsText(
                              "rootFSSize",
                              Number(params.rootFSSize) - 1,
                              "value",
                            );
                            // debouncedInput(Number(params.rootFSSize) - 1);
                          }}
                          className="absolute cursor-pointer left-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-[var(--dark-1)]"
                        >
                          <Image
                            src="/gpu-instance/explore/minus.svg"
                            alt="minus"
                            width={16}
                            height={16}
                          />
                        </Button>
                        <Button
                          type="button"
                          variant="noborderghost"
                          size="icon"
                          onClick={() => {
                            inputSetParamsText(
                              "rootFSSize",
                              Number(params.rootFSSize) + 1,
                              "value",
                            );
                            // debouncedInput(Number(params.rootFSSize) + 1);
                          }}
                          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-[var(--dark-1)]"
                        >
                          <Image
                            src="/gpu-instance/explore/add.svg"
                            alt="add"
                            width={16}
                            height={16}
                          />
                        </Button>
                      </>
                    }
                  />
                </div>
              </div>
              <div>
                <div
                  className={`${styles.cudaAllowed} flex flex-row items-center gap-[6px]`}
                >
                  <span>{"Min CUDA Version"}</span>
                  <Tooltip
                    overlayInnerStyle={{ maxWidth: "340px", padding: "12px" }}
                    placement="top"
                    title={
                      <div>The minimum CUDA version supported by the GPU.</div>
                    }
                  >
                    <span className="iconfont icon-badge-help text-[var(--dark-2)]"></span>
                  </Tooltip>
                </div>
                <Select
                  value={params.cudaVersion || "-1"}
                  onValueChange={(v: any) =>
                    inputSetParamsText("cudaVersion", v, "value")
                  }
                >
                  <SelectTrigger
                    className={`w-[120px] h-[32px] text-[var(--dark-1)]
                    ${
                      dataInit &&
                      params.cudaVersion !== "-1" &&
                      Number(params.cudaVersion) <
                        Number(
                          createInstanceInfo?.imageObj?.minCudaVersion || "-1",
                        )
                        ? "!border-[var(--red-2)]"
                        : ""
                    }
                    `}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { label: "No Limit", value: "-1" },
                      ...(filters &&
                      filters.cudaVersions &&
                      filters.cudaVersions.length > 0
                        ? filters.cudaVersions
                        : []
                      ).map((item: any) => ({ label: item, value: item })),
                    ].map((type) => (
                      <SelectItem value={type.value} key={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {dataInit &&
                params.cudaVersion !== "-1" &&
                Number(params.cudaVersion) <
                  Number(
                    createInstanceInfo?.imageObj?.minCudaVersion || "-1",
                  ) && (
                  <div>
                    <div className={styles.cudaAllowed}>&nbsp;</div>
                    <span className="flex items-center gap-1">
                      <span className="iconfont icon-badge-alert text-[var(--red-2)] text-[16px]"></span>
                      <span className="font-subtle text-[var(--red-2)]">
                        The min supported CUDA version for this template is{" "}
                        {createInstanceInfo?.imageObj?.minCudaVersion}. Using a
                        lower version may cause deployment failure
                      </span>
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
        <StepOneProductOptions
          productsLoading={productsLoading}
          products={products}
          deployObj={deployObj}
          createInstanceInfo={createInstanceInfo}
          params={params}
          deployFun={deployFun}
          submitRequest={submitRequest}
        />

        {createInstanceInfo.currProduct && (
          <div className="min-w-[324px] mt-[20px] choose-gpu-num-slider py-4 px-3 rounded-md bg-[var(--gray-3)] relative">
            <div className="font-subtle-medium mb-[12px]">
              <span className="text-[var(--dark-1)]">GPUs / Instance : </span>
              <span className="text-[var(--brand-1)]">{currentGpuNum}</span>
              <span className="text-[var(--black)]"> X </span>
              <span className="text-[var(--black)]">
                {createInstanceInfo?.currProduct?.productName || "/"}
              </span>
            </div>
            <div className="px-[6px] w-full">
              <Slider
                {...{
                  key: `slider-${createInstanceInfo?.gpuNum || 0}`,
                  className: styles.slider,
                  min: 1,
                  max: gpuNumMax,
                  value: Number(currentGpuNum || 1),
                  onChange: (value: any) => {
                    setCurrentGpuNum(value);
                  },
                  onAfterChange: (value: any) => {
                    changeGPUNumCreateInstanceInfo(value);
                  },
                  step: 1,
                }}
              />
              <div className="relative mt-1.5 h-4 text-[12px] text-[var(--dark-3)]">
                {gpuNumOptions.map((item: number) => (
                  <span
                    key={item}
                    className={`absolute -translate-x-1/2 ${
                      Number(currentGpuNum) === item
                        ? "font-medium text-[var(--brand-1)]"
                        : ""
                    }`}
                    style={{
                      left:
                        gpuNumMax === 1
                          ? "0%"
                          : `${((item - 1) / (gpuNumMax - 1)) * 100}%`,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {showReadMe.showModal ? (
        <MyModal
          width="608px"
          footer={null}
          className={styles.templateModal}
          open={showReadMe.showModal}
          title={null}
          onCancel={() => setShowReadMe({ ...showReadMe, showModal: false })}
          styles={{ content: { padding: 0 } }}
        >
          <ReadMe
            finishForm={() => closeReadMe()}
            readMe={showReadMe?.readMe || ""}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showCreateTemplateModal ? (
        <AddTemplate
          title={"Create My Template"}
          createPosition={"out"}
          mode={"Create"}
          finishForm={addTemplate}
          updateList={updateList}
        />
      ) : (
        ""
      )}
      {showVolumeModal && (
        <AddNetworkVolume
          openDiag={showVolumeModal}
          mode={"Add"}
          info={{}}
          finishOper={finishOper}
        />
      )}

      {openChangeTemplate.open && (
        <ChangeTemplateModal
          open={openChangeTemplate.open}
          onClose={() => {
            setOpenChangeTemplate({
              open: false,
            });
          }}
          currentTemplate={createInstanceInfo?.imageObj || null}
          onConfirm={(template: any) => {
            analytics.trackClick(
              CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_CHANGE_TEMPLATE_CHOOSE,
              {
                template_id: template.Id,
              },
            );
            const privateTemplate =
              templateListPrivate?.find(
                (item: any) => item.Id === template.Id,
              ) || null;
            if (
              template.channel === "private" ||
              (template.channel === "community" && privateTemplate)
            ) {
              changeImageTemplate("private", template.Id);
            } else {
              changeOfficialTemplateCheck(template.Id, true);
            }
            setOpenChangeTemplate({
              open: false,
            });
            // reqComplaintTemplate(params).then(() => {
            //   message.success("Thank you for inform us. We will deal with it soon.");
            //   setOpenChangeTemplate({
            //     open: false,
            //     templateId: "",
            //   });
            // });
          }}
        />
      )}
    </div>
  );
}
