import styles from "./Parameters.module.scss";
import {
  type GpuData,
  type GpuLandingPageContent,
} from "../gpuLandingPageData";

export default async function FirstPage({
  content,
  gpuData,
}: {
  content: GpuLandingPageContent;
  gpuData: GpuData;
}) {
  const data = [
    {
      label: content.performanceParameters.gpuArch.label,
      value: gpuData.params.gpuArch.text,
    },
    {
      label: content.performanceParameters.tensorCore.label,
      value: gpuData.params.tensorCore.text,
    },
    {
      label: content.performanceParameters.boostClock.label,
      value: gpuData.params.boostClock.text,
    },
    {
      label: content.performanceParameters.cudaCore.label,
      value: gpuData.params.cudaCore,
    },
    {
      label: content.performanceParameters.memBandwidth.label,
      value: gpuData.params.memoryBandwidth.text,
    },
    {
      label: content.performanceParameters.busWidth.label,
      value: gpuData.params.busWidth.text,
    },
    {
      label: content.performanceParameters.rtCore.label,
      value: gpuData.params.rtCore.text,
    },
    {
      label: content.performanceParameters.vRam.label,
      value: gpuData.params.vram.text,
    },
    {
      label: content.performanceParameters.compPower.label,
      value: gpuData.params.computingPower.text,
    },
  ];

  return (
    <div className={`max_width_container`}>
      <div className={`${styles.container}`}>
        <div className="relative px-web z-[10]">
          <div className="flex flex-col gap-[57px] px-0 md:px-6 xl:px-0">
            <h2 className="font-h3 text-[var(--gray-3)] text-center">
              {gpuData.model} {content.performanceParameters.title}
            </h2>
            <div className={styles.content}>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[14px] px-[18px] py-[14px]"
                style={{
                  gridAutoRows: "auto",
                }}
              >
                {data.map((item, index) => (
                  <div
                    key={index}
                    className={`
                      ${styles.item}
                      !leading-normal
                      px-[14px] py-[18px] font-subtle
                      border-solid border-[var(--dark-2)]
                      border-b-[1px]
                    `}
                  >
                    <label className="text-[var(--gray-3)]">
                      {item.label}&nbsp;
                    </label>
                    <span className="text-[var(--brand-0)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
