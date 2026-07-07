"use client";
import styles from "./mountNetVolume.module.scss";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Button as CButton } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { ConfirmDialog } from "@/components/ui/standard/confirm-dialog";
import { reqInstanceMount } from "@/api/gpu-instance/instances";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import outStyles from "./section.module.scss";
import { Button as MButton } from "@/components/ui/button";
export default function MountNetVolume({
  instanceInfoObj,
  finishForm,
  bindList,
  allVolumeList,
}: {
  instanceInfoObj: any;
  finishForm: any;
  bindList: any[];
  allVolumeList: any[];
}) {
  const [instanceInfo] = useState({ ...instanceInfoObj });
  const [btnLoading, setBtnLoading] = useState(false);
  const [newBindList, setNewBindList] = useState(
    JSON.parse(JSON.stringify(bindList)),
  );
  const [errorRowIndex, setErrorRowIndex] = useState<number | null>(null);
  const [errorRowPathIndex, setErrorRowPathIndex] = useState<number | null>(
    null,
  );
  const [scrollToErrorTrigger, setScrollToErrorTrigger] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevListLengthRef = useRef(newBindList.length);
  useEffect(() => {
    if (newBindList.length > prevListLengthRef.current) {
      prevListLengthRef.current = newBindList.length;
      requestAnimationFrame(() => {
        listContainerRef.current?.scrollTo({
          top: listContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    } else {
      prevListLengthRef.current = newBindList.length;
    }
  }, [newBindList.length]);
  useEffect(() => {
    if (errorRowIndex === null && errorRowPathIndex === null) return;
    let index = errorRowPathIndex ?? 0;
    if (errorRowIndex !== null) {
      index = errorRowIndex;
    }
    const timer = setTimeout(() => {
      const container = listContainerRef.current;
      if (!container) return;
      let rowTopInContent = 0;
      for (let i = 0; i < index; i++) {
        const child = container.children[i] as HTMLElement | undefined;
        if (!child) break;
        const style = getComputedStyle(child);
        rowTopInContent +=
          child.offsetHeight + (parseFloat(style.marginBottom) || 0);
      }
      const targetScrollTop = Math.max(0, rowTopInContent - 24);
      const maxScroll = Math.max(
        0,
        container.scrollHeight - container.clientHeight,
      );
      const scrollTop = Math.min(targetScrollTop, maxScroll);
      const needScrollUp = scrollTop < container.scrollTop;
      if (needScrollUp) {
        const rowEl = container.children[index] as HTMLElement | undefined;
        if (rowEl?.scrollIntoView) {
          rowEl.scrollIntoView({
            block: "start",
            behavior: "auto",
            inline: "nearest",
          });
        } else {
          container.scrollTop = scrollTop;
        }
      } else {
        container.scrollTop = scrollTop;
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [errorRowIndex, errorRowPathIndex, scrollToErrorTrigger]);
  const isBindListEqual = (
    a: {
      id?: string;
      path?: string;
    }[],
    b: {
      id?: string;
      path?: string;
    }[],
  ) => {
    if (a.length !== b.length) return false;
    const normalize = (
      list: {
        id?: string;
        path?: string;
      }[],
    ) => [...list].map((x) => `${x.id ?? ""}\t${x.path ?? ""}`).sort();
    const aNorm = normalize(a);
    const bNorm = normalize(b);
    return aNorm.every((s, i) => s === bNorm[i]);
  };
  function terminateInstance() {
    if (btnLoading) {
      return;
    }
    if (newBindList.length > 0) {
      const invalidIdList: any[] = [];
      const invalidPathList: any[] = [];
      for (let index = 0; index < newBindList.length; index++) {
        const bind = newBindList[index];
        if (!bind.id) {
          setErrorRowIndex(index);
          setErrorRowPathIndex(null);
          setScrollToErrorTrigger((t) => t + 1);
          message.error("Please select the cloud storage to mount");
          return;
        }
        if (
          !bind.path ||
          bind.path.trim() === "/" ||
          bind.path[0] !== "/" ||
          bind.path.indexOf(" ") >= 0
        ) {
          setErrorRowIndex(null);
          setErrorRowPathIndex(index);
          setScrollToErrorTrigger((t) => t + 1);
          message.error("Please enter a valid cloud storage mount path");
          return;
        }
        if (invalidIdList.includes(bind.id)) {
          setErrorRowIndex(index);
          setErrorRowPathIndex(null);
          setScrollToErrorTrigger((t) => t + 1);
          message.error("Please select a different cloud storage");
          return;
        }
        if (invalidPathList.includes(bind.path)) {
          setErrorRowIndex(null);
          setErrorRowPathIndex(index);
          setScrollToErrorTrigger((t) => t + 1);
          message.error("Please enter a different cloud storage mount path");
          return;
        }
        invalidIdList.push(bind.id);
        invalidPathList.push(bind.path);
      }
    }
    setErrorRowIndex(null);
    setErrorRowPathIndex(null);
    setScrollToErrorTrigger((t) => t + 1);
    if (isBindListEqual(newBindList, bindList)) {
      message.error(
        "There is no change in the existing cloud storage data, please confirm",
      );
      return;
    }
    setConfirmOpen(true);
  }
  function confirmMount() {
    setBtnLoading(true);
    reqInstanceMount({
      // action: "AttachVolume",
      instanceId: instanceInfo.id,
      clusterId: instanceInfo.clusterId,
      volumeIds: newBindList.map((bind: any) => bind.id),
      mountPath: newBindList.map((bind: any) => bind.path),
    })
      .then((res: any) => {
        message.success("success");
        finishForm(true);
      })
      .finally(() => {
        setBtnLoading(false);
      });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Tips"
        description={
          <div className="font-subtle text-[var(--dark-1)]">
            <div className="flex gap-0 items-start font-subtle flex-wrap">
              <span className="inline-flex w-[18px] h-[8px] shrink-0 justify-center items-center overflow-visible mt-[2px]">
                <span className="inline-block origin-center scale-[3] leading-[0]">
                  ·
                </span>
              </span>
              <span className="min-w-0 flex-1 font-subtle break-words">
                {"Cloud storage mounts will be changed to"}{" "}
                <span className="text-[var(--red-1)]">
                  {`${newBindList.length} (from ${bindList.length})`}
                </span>
                .
              </span>
            </div>
            <div className="flex gap-0 items-start">
              <span className="inline-flex w-[18px] h-[8px] shrink-0 justify-center items-center overflow-visible mt-[2px]">
                <span className="inline-block origin-center scale-[3] leading-[0]">
                  ·
                </span>
              </span>
              <span className="min-w-0 flex-1 leading-normal font-subtle">
                {`Please make sure you've unmounted the extra volume-submitting this change will restart the instance.`}
              </span>
            </div>
          </div>
        }
        onConfirm={confirmMount}
      />
      <div className={styles.section}>
        <h1 className={styles.title}>{"Mount Cloud Storage"}</h1>
        <div>
          <div className={styles.desc}>
            <div className="px-4 py-3 rounded-[8px] bg-[var(--gray-3)] border-[1px] border-[var(--gray-2)] flex items-start gap-3 mb-6">
              <img
                src="/gpu-instance/instances/primary-alert.svg"
                alt="alert"
                className="w-4 h-4 mt-[3px]"
              />
              <div className="flex flex-col">
                <span className="font-subtle-medium text-[var(--dark-1)]">
                  {"Mounting Notes"}
                </span>
                <ul className="font-subtle text-[var(--dark-2)] list-none">
                  <li className="flex gap-0 items-start">
                    <span className="inline-flex w-[8px] mx-1 h-[8px] shrink-0 justify-center items-center overflow-visible mt-1">
                      <span className="inline-block origin-center scale-[2] leading-[0]">
                        ·
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 leading-normal font-subtle">
                      {
                        "Applying these changes will restart the current instance immediately."
                      }
                    </span>
                  </li>
                  <li className="flex gap-0 items-start">
                    <span className="inline-flex w-[8px] mx-1 h-[8px] shrink-0 justify-center items-center overflow-visible mt-1">
                      <span className="inline-block origin-center scale-[2] leading-[0]">
                        ·
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 leading-normal font-subtle">
                      {
                        "A single instance can mount up to 30 cloud storage volumes."
                      }
                    </span>
                  </li>
                  <li className="flex gap-0 items-start">
                    <span className="inline-flex w-[8px] mx-1 h-[8px] shrink-0 justify-center items-center overflow-visible mt-[2px]">
                      <span className="inline-block origin-center scale-[2] leading-[0]">
                        ·
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 leading-normal font-subtle">
                      {
                        "Before detaching a volume, ensure it has been unmounted inside the instance to avoid losing unsaved data."
                      }
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 mb-3">
              <div className="w-[4px] h-[14px] bg-[#10B981] rounded-[16777200px]"></div>
              <div
                className={`${styles.subtitle} text-[var(--dark-1)]`}
              >{`Storage Configuration (${newBindList.length})`}</div>
            </div>
            <div className="leading-[20px] mb-2 h-[20px] flex items-center gap-3">
              <span
                className={`${styles.label} text-[var(--dark-1)] inline-block ${newBindList.length > 4 ? "w-[230px]" : "w-[246px]"}`}
              >
                {"Storage Instance"}
              </span>
              <span
                className={`${styles.label} text-[var(--dark-1)] inline-block w-[246px]`}
              >
                {"Mount Path"}
              </span>
              <div
                className={`${styles.label} text-[var(--dark-2)] inline-block w-[36px]`}
              >
                {""}
              </div>
            </div>
            {newBindList.length > 0 && (
              <div
                ref={listContainerRef}
                className={`flex flex-col mb-2 min-h-[20px] max-h-[186px] overflow-y-auto pr-1`}
              >
                {newBindList.map((bind: any, index: number) => (
                  <div
                    ref={(el) => {
                      rowRefs.current[index] = el;
                    }}
                    className={`flex items-center gap-3 rounded-[2px] ${index === newBindList.length - 1 ? "mb-0" : "mb-3"}`}
                    key={bind.id + "_" + index}
                  >
                    <Select
                      value={bind.id || ""}
                      onValueChange={(e: any) => {
                        setErrorRowIndex(null);
                        const newBindListTmp = [...newBindList];
                        newBindListTmp[index].id = e;
                        setNewBindList(newBindListTmp);
                      }}
                    >
                      <SelectTrigger
                        className={`text-[var(--black)] h-9 rounded-[6px] border-[1px] ${errorRowIndex === index ? "border-[var(--red-1)]" : "border-[var(--gray-2)]"}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        disableScrollButton={true}
                        className="z-[1001]"
                      >
                        {allVolumeList.map((volume) => (
                          <SelectItem
                            hideCheck={true}
                            checkPosition="right"
                            value={volume.id}
                            key={volume.id}
                          >
                            {volume.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className={`w-[246px] h-9 ${errorRowPathIndex === index ? "!border-[var(--red-1)]" : "border-[var(--gray-2)]"}`}
                      value={bind.path}
                      onChange={(e) => {
                        const newBindListTmp = [...newBindList];
                        newBindListTmp[index].path = e.target.value;
                        setNewBindList(newBindListTmp);
                      }}
                    />
                    <MButton
                      onClick={() => {
                        const newBindListTmp = [...newBindList];
                        newBindListTmp.splice(index, 1);
                        setNewBindList(newBindListTmp);
                      }}
                      className="!h-9 !w-9 !rounded-[6px]"
                      variant="noborderoutline"
                    >
                      <span
                        className={`iconfont icon-delete`}
                        style={{
                          color: "var(--black)",
                          fontSize: "16px",
                        }}
                      />
                      {/* <span className={styles.terminateBtnTxt}>
                  {"卸载"}
                </span> */}
                    </MButton>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-start mt-3">
              <CButton
                className={`!h-8`}
                onClick={() => {
                  if (newBindList.length >= 30) {
                    message.error(
                      "Maximum 30 mounts allowed. Please unmount some storage first",
                    );
                    return;
                  }
                  const newBindListTmp = [...newBindList];
                  newBindListTmp.push({
                    volumeId: "",
                    mountPath: "",
                  });
                  setNewBindList(newBindListTmp);
                }}
                variant="ghost"
              >
                <img
                  src="/gpu-instance/instances/add-default.svg"
                  alt="add"
                  className="w-3 h-3 mr-1"
                />
                <span className={styles.addBtnTxt}>{"Add Mount"}</span>
              </CButton>
            </div>
          </div>
          <div className="h-[1px] bg-[var(--gray-2)] my-6"></div>
          <div>
            <Button
              className={styles.terminateBtn}
              onClick={() => terminateInstance()}
              variant="default"
            >
              <span className={styles.terminateBtnTxt}>{"Confirm"}</span>
            </Button>
            <Button
              onClick={() => finishForm(false)}
              className={styles.cancelBtn}
              variant="default"
            >
              <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
