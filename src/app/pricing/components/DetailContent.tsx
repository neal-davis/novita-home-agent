"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { reqHomeProductsStorage } from "@/api/gpu-instance/storage";
import { reqSandboxPrice, reqSandboxStoragePrice } from "@/api/sandbox";
import ModelAPIPrice from "./ModelAPIPrice";
import GpuPrice from "./GpuPrice";
import StorePrice from "./StorePrice";
import styles from "./DetailContent.module.scss";
import DePage from "./DePage";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import SandboxPrice from "./SandboxPrice";
import { LLMModelWithStatus, ModelType } from "@/types/models";
import { useAppDispatch, useAppSelector } from "@/store";
import { useHeaderHeight, ORI_HEADER_HEIGHT } from "@/hooks/useHeaderHeight";
import {
  fetchMultimodalConfigs,
  selectMultimodalConfigs,
  selectMultimodalPriceMap,
} from "@/store/slice/multimodalSlice";

interface InstancePriceObject {
  discount?: string;
}

interface PriceProps {
  productId: string;
  productName?: string;
  cpuNum?: number;
  expansion?: number;
  freeStorage: number;
  gpuMemory?: number;
  memory: number;
  instancePrice?: InstancePriceObject;
  savingPlan: Array<any>;
}

interface DetailContentProps {
  initialFullLLMModels: LLMModelWithStatus[];
  isConsole?: boolean;
}

const WEBSITE_TAB_STICKY_TOP_OFFSET = 24;

function getLlmSort(model: any) {
  if (!model) return 0;
  if (
    model.input_token_price_per_m === 0 &&
    model.output_token_price_per_m === 0
  ) {
    return 2;
  }
  if (
    model.input_token_price_per_m === 0 ||
    model.output_token_price_per_m === 0
  ) {
    return 1;
  }
  return 0;
}

const DetailContent: React.FC<DetailContentProps> = ({
  initialFullLLMModels,
  isConsole = false,
}) => {
  const dispatch = useAppDispatch();
  const dynamicModelConfigs = useAppSelector(selectMultimodalConfigs);
  const dynamicPriceMap = useAppSelector(selectMultimodalPriceMap);
  const { noticeHeight } = useHeaderHeight();
  const stickyTop = isConsole
    ? 0
    : ORI_HEADER_HEIGHT + noticeHeight + WEBSITE_TAB_STICKY_TOP_OFFSET;
  const tabsHeaderRef = useRef<HTMLDivElement>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabsContentRef = useRef<HTMLDivElement>(null);

  const llmList = useMemo(
    () =>
      (initialFullLLMModels || [])
        .filter((one) => {
          const features = Array.isArray(one.features)
            ? one.features
            : one.features
              ? [one.features]
              : [];
          return (
            one.type === ModelType.Chat &&
            features.some((feature) => feature.toLowerCase() === "serverless")
          );
        })
        .map((one) => ({
          ...one,
          sort: getLlmSort(one),
        }))
        .sort((a, b) => b.sort - a.sort),
    [initialFullLLMModels],
  );
  const embeddingList = useMemo(
    () =>
      (initialFullLLMModels || []).filter(
        (one) => one.type === ModelType.Embedding,
      ),
    [initialFullLLMModels],
  );
  const [gpuPriceList, setGpuPriceList] = useState<Array<PriceProps>>([]);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("model");
  const [gpuDataLoading, setGpuDataLoading] = useState(false); // New: GPU data loading state
  const searchParams = useSearchParams();
  const [sandboxPriceInfo, setSandboxPriceInfo] = useState<any>({});
  const [sandboxStorageInfo, setSandboxStorageInfo] = useState<any>({});

  useEffect(() => {
    // debugger;
    if ("undefined" !== typeof window) {
      const scrollToElement = () => {
        // alert("scrollToElement");
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
          const element = document.getElementById(hash.slice(1));
          if (element) {
            element.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        }
      };
      scrollToElement();
      // window.addEventListener("load", scrollToElement);
      // return () => {
      //   window.removeEventListener("load", scrollToElement);
      // };
    }
  }, [llmList, embeddingList, gpuPriceList, storageInfo]);

  useEffect(() => {
    const isGpu = searchParams.get("gpu");
    const isDe = searchParams.get("de");
    const isSandbox = searchParams.get("sandbox");
    const isAISearch = searchParams.get("ai-search");
    if (isGpu) {
      setActiveTab("gpu");
    }
    if (isSandbox) {
      setActiveTab("sandbox");
    }
    if (isDe) {
      setActiveTab("de");
    }
    if (isAISearch) {
      setActiveTab("model");
    }
  }, [searchParams]);

  useEffect(() => {
    // Background async fetch GPU related data, not blocking first screen rendering
    const fetchGPUData = async () => {
      try {
        setGpuDataLoading(true);
        const [productsResult, storageResult] = await Promise.all([
          reqMarketProducts({
            cpuModel: 4,
            memoryModel: 8,
          }),
          reqHomeProductsStorage(),
        ]);

        setGpuPriceList(
          Array.isArray(productsResult?.products)
            ? productsResult.products
            : [],
        );
        setStorageInfo(storageResult);
      } catch (error) {
        // Even if it fails, it won't affect first screen display
      } finally {
        setGpuDataLoading(false);
      }
    };

    // Background async fetch Sandbox data
    const fetchSandboxData = async () => {
      try {
        const res = await reqSandboxPrice({});
        setSandboxPriceInfo(res);
      } catch (error) {
        // Handle error silently
      }
    };

    const fetchSandboxStorageData = async () => {
      try {
        const res = await reqSandboxStoragePrice({
          productIds: ["sandbox-storage"],
          businessType: "cloud_sandbox",
        });

        setSandboxStorageInfo(res?.products?.length > 0 ? res.products[0] : {});
      } catch (error) {
        // Handle error silently
      }
    };

    fetchGPUData(); // Background async execution
    fetchSandboxData(); // Background async execution
    fetchSandboxStorageData(); // Background async execution
  }, []);

  useEffect(() => {
    dispatch(fetchMultimodalConfigs(false) as any);
  }, [dispatch]);

  useEffect(() => {
    if (isConsole) return;

    requestAnimationFrame(() => {
      const list = tabsListRef.current;
      const activeTrigger = list?.querySelector<HTMLElement>(
        `[data-tab-value="${activeTab}"]`,
      );
      if (!list || !activeTrigger || list.scrollWidth <= list.clientWidth) {
        return;
      }

      const listRect = list.getBoundingClientRect();
      const triggerRect = activeTrigger.getBoundingClientRect();
      const listPaddingLeft = parseFloat(getComputedStyle(list).paddingLeft);
      const targetLeft =
        list.scrollLeft + triggerRect.left - listRect.left - listPaddingLeft;

      list.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      });
    });
  }, [activeTab, isConsole]);

  const handleTabChange = useCallback(
    (value: string) => {
      const header = tabsHeaderRef.current;
      const isSticky =
        header !== null && header.getBoundingClientRect().top <= stickyTop + 1;
      setActiveTab(value);
      if (isSticky) {
        requestAnimationFrame(() => {
          const content = tabsContentRef.current;
          if (!content) return;
          const tabBarHeight = header.offsetHeight;
          const contentTop =
            content.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: contentTop - stickyTop - tabBarHeight,
            behavior: "smooth",
          });
        });
      }
    },
    [stickyTop],
  );

  return (
    <div
      className={`${styles.container} ${isConsole ? "console_container" : "relative z-10 md:-mt-[60px]"}`}
    >
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <div
          ref={tabsHeaderRef}
          className={`flex ${isConsole ? "justify-start" : "justify-center"} ${styles.tabs_header_wrap} ${isConsole ? styles.console_sticky : styles.website_sticky}`}
          style={!isConsole ? { top: `${stickyTop}px` } : undefined}
        >
          <TabsList
            ref={tabsListRef}
            className={
              isConsole
                ? "w-full pr-space-8"
                : "w-full overflow-x-auto overflow-y-hidden px-space-16 md:mx-auto md:max-w-[var(--max-width)] md:px-0"
            }
            align="left"
            tabsStyle="line"
          >
            <div
              className={`flex w-full ${isConsole ? "justify-start" : "justify-start md:justify-center"} ${isConsole ? "gap-space-8" : "min-w-max gap-space-8 md:min-w-0 md:gap-[48px]"}`}
            >
              <TabsTrigger
                value="model"
                data-tab-value="model"
                className={`${isConsole ? `console-tab ${styles.console_tab_item}` : ""} ${styles.tab_item} xl:max-w-[200px]`}
                id={
                  CLICK_BTN_IDs.PRICING_BTNS.FIRST_PAGE_SERVERLESS_ENDPOINTS_TAB
                }
              >
                Serverless Endpoints
              </TabsTrigger>
              <TabsTrigger
                value="de"
                data-tab-value="de"
                className={`${isConsole ? `console-tab ${styles.console_tab_item}` : ""} ${styles.tab_item} xl:max-w-[200px]`}
                id={
                  CLICK_BTN_IDs.PRICING_BTNS.FIRST_PAGE_DEDICATED_ENDPOINTS_TAB
                }
              >
                Dedicated Endpoints
              </TabsTrigger>
              <TabsTrigger
                value="sandbox"
                data-tab-value="sandbox"
                className={`${isConsole ? `console-tab ${styles.console_tab_item}` : ""} ${styles.tab_item} xl:max-w-[200px]`}
                id={CLICK_BTN_IDs.PRICING_BTNS.FIRST_PAGE_SANDBOX_TAB}
              >
                Agent Sandbox
              </TabsTrigger>
              <TabsTrigger
                value="gpu"
                data-tab-value="gpu"
                className={`${isConsole ? `console-tab ${styles.console_tab_item}` : ""} ${styles.tab_item} ${isConsole ? styles.console_gpu_tab : ""} ${isConsole ? "xl:max-w-[120px]" : "xl:max-w-[200px]"}`}
                id={CLICK_BTN_IDs.PRICING_BTNS.FIRST_PAGE_GPUS_TAB}
              >
                GPUs
              </TabsTrigger>
            </div>
          </TabsList>
        </div>
        <div ref={tabsContentRef} className={styles.tabs_content_wrap}>
          <TabsContent value="model" className={isConsole ? "pt-space-12" : ""}>
            <ModelAPIPrice
              llmList={llmList}
              embeddingList={embeddingList}
              isConsole={isConsole}
              dynamicModelConfigs={dynamicModelConfigs}
              dynamicPriceMap={dynamicPriceMap}
            />
          </TabsContent>
          <TabsContent value="de" className="pt-space-16">
            <DePage isConsole={isConsole} />
          </TabsContent>
          <TabsContent value="sandbox" className="pt-space-16">
            <SandboxPrice
              sandboxPriceInfo={sandboxPriceInfo}
              sandboxStorageInfo={sandboxStorageInfo}
              isConsole={isConsole}
            />
          </TabsContent>
          <TabsContent value="gpu" className="pt-space-16">
            <GpuPrice
              gpuPriceList={gpuPriceList}
              loading={gpuDataLoading}
              isConsole={isConsole}
            />
            {!gpuDataLoading && storageInfo && (
              <StorePrice price={storageInfo} isConsole={isConsole} />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DetailContent;
