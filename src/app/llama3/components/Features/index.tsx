import styles from "./index.module.scss";
function createCopyFeaturesItems() {
  return [
    {
      title: "Simple & Easy to Use",
      desc: "Fast integration with minimal configuration.",
    },
    {
      title: "Affordable",
      desc: "Save up to 70% compared to other LLM API providers.",
    },
    {
      title: "Reliable & Scalable",
      desc: "Built on a high-performance, stable platform that scales with your needs.",
    },
    {
      title: "OpenAI Compatible",
      desc: "Easy integration into your existing application using OpenAI API standards.",
    },
  ];
}
export default function Features({ copy }: { copy?: unknown }) {
  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <img src="/llama3/feature_bg.svg" alt="feature_bg" />
      </div>
      <div className="relative">
        <h3 className={styles.title}>{"Key Features of Llama 3 API"}</h3>
        <div className="mt-[56px] relative max-w-full flex justify-center overflow-hidden">
          <div className="max_width_container relative">
            <ul className="grid grid-cols-2 gap-[16px]">
              {createCopyFeaturesItems().map((one, index) => (
                <li
                  key={one.title}
                  className={`${styles.li} relative flex flex-col w-[512px]`}
                >
                  <span
                    className={`text-primary font-h5 mb-8 ${styles.li_index}`}
                  >
                    {index.toString().padStart(2, "0")}
                  </span>
                  <div className="font-h5 mb-4">{one.title}</div>
                  <div className="font-subtle">{one.desc}</div>
                </li>
              ))}
            </ul>
            <div className="absolute top-0 left-[-336px] flex flex-col gap-[16px] w-[320px] -z-10">
              <div className="w-full h-[240px] bg-common-gray-3"></div>
              <div className="w-full h-[240px] bg-common-gray-3"></div>
            </div>
            <div className="absolute top-0 right-[-336px] flex flex-col gap-[16px] w-[320px] -z-10">
              <div className="w-full h-[240px] bg-common-gray-3"></div>
              <div className="w-full h-[240px] bg-common-gray-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
