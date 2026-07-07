import styles from "./data.module.scss";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load
// time instead of re-evaluating per render.
export function getWhyUsList() {
  return [
    {
      unSelectTitle: (
        <div className="font-h5 text-[var(--dark-3-1)]">
          {"1. Multi-Model Ecosystem"}
        </div>
      ),
      selectTitle: (
        <div className="font-h5 text-[#2563EB]">
          {"1. Multi-Model Ecosystem"}
        </div>
      ),
      subTitle: (count: number) => (
        <div className="font-body text-[var(--dark-2)]">
          {`Access ${count} state-of-the-art models under one roof`}
        </div>
      ),
      description: [
        (baseModeList: any[]) => (
          <div key={0} className="flex flex-row items-start gap-1">
            <div className="mr-3 mt-2 min-w-2 w-2 h-2 bg-[#2563EB] rounded-full"></div>
            <div className="flex flex-col gap-4 flex-wrap">
              <div className="font-body-medium text-[var(--black)]">
                {"Models: "}
              </div>
              <div className="flex flex-row gap-1 flex-wrap">
                {baseModeList.map((item: any, index: number) => (
                  <div key={index} className="font-body text-[var(--dark-2)]">
                    {item} ;
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),

        <div key={5} className={styles.descriptionItem0}>
          <div className={styles.descriptionItem0Content}>
            {"Eliminate vendor lock-in with unified API access."}
          </div>
        </div>,
      ],
    },

    {
      unSelectTitle: (
        <div className="font-h5 text-[var(--dark-3-1)]">
          {"2. Revolutionary Cost Efficiency"}
        </div>
      ),
      selectTitle: (
        <div className="font-h5 text-[#9C25EB]">
          {"2. Revolutionary Cost Efficiency"}
        </div>
      ),
      subTitle: "",
      description: [
        <div key={0} className="flex flex-row items-center gap-1">
          <div className="mr-3 w-2 h-2 bg-[#9C25EB] rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="font-body-medium text-[var(--black)]">
              {"Up to 33% Savings vs. Pay-as-You-Go:"}
            </div>
            <div className="font-body text-[var(--dark-2)]">
              {"Flexible resource packages with cross-model deduction"}
            </div>
          </div>
        </div>,

        <div key={1} className="flex flex-row items-center gap-1">
          <div className="mr-3 w-2 h-2 bg-[#9C25EB] rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="font-body-medium text-[var(--black)]">
              {"Smart Billing:"}
            </div>
            <div className="font-body text-[var(--dark-2)]">
              {"Automatic quota-to-cash account switching"}
            </div>
          </div>
        </div>,
      ],
    },

    {
      unSelectTitle: (
        <div className="font-h5 text-[var(--dark-3-1)]">
          {"3. Enterprise-Grade Reliability"}
        </div>
      ),
      selectTitle: (
        <div className="font-h5 text-[#0BC779]">
          {"3. Enterprise-Grade Reliability"}
        </div>
      ),
      subTitle: "",
      description: [
        <div key={0} className="flex flex-row items-center gap-1">
          <div className="mr-3 w-2 h-2 bg-[#0BC779] rounded-full"></div>
          <div className="flex gap-1 flex-wrap">
            <div className="font-body-medium text-[var(--black)]">
              {"99.99% Uptime: "}
            </div>
            <div className="font-body text-[var(--dark-2)]">
              {"SOC 2 & ISO 27001 certified infrastructure"}
            </div>
          </div>
        </div>,

        <div key={1} className="flex flex-row items-center gap-1">
          <div className="mr-3 w-2 h-2 bg-[#0BC779] rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="font-body-medium text-[var(--black)]">
              {"Real-Time Monitoring: "}
            </div>
            <div className="font-body text-[var(--dark-2)]">
              {"Instant alerts for quota exhaustion"}
            </div>
          </div>
        </div>,

        <div key={2} className="flex flex-row items-center gap-1">
          <div className="mr-3 w-2 h-2 bg-[#0BC779] rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="font-body-medium text-[var(--black)]">
              {"24/7 Support: "}
            </div>
            <div className="font-body text-[var(--dark-2)]">
              {
                "Dedicated technical assistance Scale confidently with production-ready infrastructure."
              }
            </div>
          </div>
        </div>,

        <div key={3} className={styles.descriptionItem2}>
          <div className={styles.descriptionItem2Content}>
            {"Scale confidently with production-ready infrastructure."}
          </div>
        </div>,
      ],
    },

    {
      unSelectTitle: (
        <div className="font-h5 text-[var(--dark-3-1)]">
          {"4. Developer-Centric Experience"}
        </div>
      ),
      selectTitle: (
        <div className="font-h5 text-[#E85014]">
          {"4. Developer-Centric Experience"}
        </div>
      ),
      subTitle: "",
      description: [
        <div key={0} className="flex flex-row items-center gap-1">
          <div className="mr-3 w-2 h-2 bg-[#E85014] rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="font-body-medium text-[var(--black)]">
              {"Zero-Friction Setup "}
            </div>
            <div className="font-body text-[var(--dark-2)]">
              {"Instant activation post-purchase"}
            </div>
          </div>
        </div>,

        <div key={1} className="flex flex-row items-center gap-1">
          <div className="mr-3 w-2 h-2 bg-[#E85014] rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="font-body-medium text-[var(--black)]">
              {"Unified Console "}
            </div>
            <div className="font-body text-[var(--dark-2)]">
              {"Centralized billing, quota, and API management"}
            </div>
          </div>
        </div>,

        <div key={2} className="flex flex-row items-center gap-1">
          <div className="mr-3 w-2 h-2 bg-[#E85014] rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="font-body-medium text-[var(--black)]">
              {"Comprehensive Docs "}
            </div>
            <a
              className="font-body text-[var(--dark-2)] underline 
            underline-offset-[4px] decoration-[var(--dark-2)]"
              href="https://novita.ai/docs/guides/quickstart"
              target="_blank"
              rel="noopener noreferrer"
            >
              {"https://novita.ai/docs/guides/quickstart"}
            </a>
          </div>
        </div>,
      ],
    },
  ];
}
