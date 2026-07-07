"use client";

import { Check } from "lucide-react";
import { ServerlessProvider } from "./Context";
import styles from "./section.module.scss";
import GPUCardList from "./gpuCardList";
import { useLayoutEffect, useRef, useState } from "react";
import type { AddEndpointRef } from "./addEndpoint";
import CommitFooter from "./commitFooter";
import AddEndpointArea from "./addEndpointArea";

export default function Section() {
  // const res = await reqGetStorage({});
  // setStorageOptions(res.data || []);
  // setSelectOptions([
  //   { label: formDict.createCloudStorage, value: "create" },
  //   ...storageOptions.map((storage) => ({
  //     label: storage.storageName,
  //     value: storage.storageId,
  //   })),
  // ]);

  const [selectedGPU, setSelectedGPU] = useState<any>(null);
  const [gpuCount, setGpuCount] = useState(1);
  const addEndpointRef = useRef<AddEndpointRef>(null);
  const [createInstanceInfoParams, setCreateInstanceInfoParams] =
    useState<any>(null);
  const sectionRootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = sectionRootRef.current;
    if (!root) return;

    const apply = () => {
      const el = root.querySelector("[data-commit-footer]");
      if (!el || !(el instanceof HTMLElement)) {
        root.style.setProperty("--commit-footer-h", "84px");
        return;
      }
      const h = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty("--commit-footer-h", `${h}px`);
    };

    apply();
    const ro = new ResizeObserver(apply);
    const footerEl = root.querySelector("[data-commit-footer]");
    if (footerEl instanceof HTMLElement) ro.observe(footerEl);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  function getCreateParameter(params: any) {
    setCreateInstanceInfoParams(params);
  }

  function checkValid() {
    return addEndpointRef.current?.checkValid() ?? "";
  }

  return (
    <ServerlessProvider>
      <div ref={sectionRootRef} className={styles.section_root}>
        <div className="flex items-center gap-2 mb-[-8px]">
          <div className="w-[3px] h-[14px] bg-[var(--dark-1)]"></div>
          <div className="font-h6 text-[var(--black)]">{"Select GPU Type"}</div>
        </div>
        <div>
          <GPUCardList selectedId={selectedGPU?.id} onDeploy={setSelectedGPU} />
        </div>
        <div className="px-6 py-4 rounded-[8px] border-[1px] border-[var(--gray-2)] bg-[var(--gray-3)] flex items-center gap-3">
          <div className="font-body-medium text-[var(--black)]">
            {"Selection:"}
          </div>
          <Check className="w-[14px] h-[14px] text-[var(--dark-1)]" />
          <div className="font-body-medium text-[var(--black)]">
            {selectedGPU?.gpu_name}
          </div>
          <div className="w-[1px] h-[14px] bg-[var(--gray-2)]"></div>
          <div className="font-body-medium text-[var(--black)]">
            {`Includes ${selectedGPU?.gpu_size || "--"} GB VRAM, 
             ${selectedGPU?.cpuNum || "--"} vCPU`}
          </div>
        </div>
        <AddEndpointArea
          ref={addEndpointRef}
          onGetCreateParameter={getCreateParameter}
          onGpuCountChange={(count: number) => setGpuCount(count)}
        />
        <CommitFooter
          gpuCount={gpuCount}
          checkValid={checkValid}
          createInstanceInfoParams={createInstanceInfoParams}
          product={selectedGPU}
        />
      </div>
    </ServerlessProvider>
  );
}
