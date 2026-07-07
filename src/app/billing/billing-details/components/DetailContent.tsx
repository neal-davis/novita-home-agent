"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import LLMTable from "./LLMTable";
import GPUInstanceTable from "./GPUInstanceTable";
import ServerlessTable from "./ServerlessTable";
import NetworkStorageTable from "./NetworkStorageTable";
import EnterpriseTable from "./EnterpriseTable";
import styles from "../page.module.scss";
import PurcherTable from "./PurcherTable";
import GenAPITable from "./GenAPITable";
import SummaryTable from "./SummaryTable";
import CategoryTabs from "./CategoryTabs";
import { InfoIcon } from "lucide-react";
import SummaryTableMonthly from "./SummaryTableMonthly";
import GPUInstanceTableMonthly from "./GPUInstanceTableMonthly";
import NetworkStorageTableMonthly from "./NetworkStorageTableMonthly";
import ImageDedicatedEndpointTable from "./ImageDedicatedEndpointTable";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import LLMDedicatedEndpointTable from "./LLMDedicatedEndpointTable";
import SandboxTable from "./Sandbox";
import APIKeyTable from "./APIKeyTable";
import { useAppSelector } from "@/store";
import { useI18nSubscription } from "@/i18n/provider";
const PAGE_SIZE = 10;
type BillDetailsDictProps = {
  copy?: unknown;
};
export default function DetailContent({ copy }: BillDetailsDictProps) {
  // Subscribe so locale switches re-render this subtree (and re-evaluate the
  // `__t(...)` calls inside `tooltips`).
  useI18nSubscription();
  // Built per-render so each tooltip literal is re-evaluated when the i18n
  // store updates. If this object were hoisted to module scope the strings
  // would be frozen at module init and never reflect a locale switch.
  const tooltips = {
    OnDemand: (
      <>
        Billing records are generated at an hourly interval. As an exception,
        storage services are billed daily, with records generated at 00:00 UTC.
      </>
    ),
    Monthly: (
      <>
        For products billed on a Fixed-term Billing basis, billing statements
        are generated on a monthly cycle. The final billing statement for the
        current month will be available after 06:00 UTC on the 1st of the
        following month. <br />
        Any billing data viewed before this time is for reference only and
        should not be used for reconciliation.
      </>
    ),
    MultiDimension: (
      <>
        Multi-dimensional summary bills display other summary dimensions except
        for the billing mode dimension.
        <br />
        Billing summaries aggregated by API Key currently support only LLM and
        image/video products.
        <br />
        Billing summaries aggregated by API Key currently only support billing
        data starting from 2026 onwards.
      </>
    ),
    Enterprise:
      "The daily charge shown below covers your committed usage under the LLM Saving Plan. Any usage beyond the committed amount is billed at the on-demand rate and can be viewed under the Usage-based Billing tab.",
  };

  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [billingMethod, setBillingMode] = useState<
    "OnDemand" | "Monthly" | "MultiDimension" | "Enterprise"
  >("OnDemand");
  const [filterOptions, setFilterOptions] = useState<any>({
    productCategory: "summary",
    currentPage: 1,
  });
  const [monthlyCategory, setMonthlyCategory] = useState<
    "summary" | "gpu" | "cloud_storage" | "image"
  >("summary");
  const [multiDimensionCategory, setMultiDimensionCategory] = useState(
    currentTeam ? "creator" : "api_key",
  );
  const tableInitFilter = useMemo(
    () => ({
      currentPage: 1,
    }),
    [],
  );
  const tableProps = {
    copy,
    pageSize: PAGE_SIZE,
  };
  function handleCycleChange(
    productCategory:
      | "summary"
      | "llm"
      | "gen_api"
      | "gpu"
      | "serverless"
      | "cloud_storage"
      | "cloud_sandbox"
      | "llm-dedicated-endpoint",
  ) {
    setFilterOptions({
      ...tableInitFilter,
      productCategory,
    });
  }
  return (
    <>
      <Card className="mb-4 -mt-4 -ml-4 w-[calc(100%+32px)] rounded-none">
        <CardContent className="p-0">
          <CategoryTabs onChange={setBillingMode} />
        </CardContent>
      </Card>

      <div className={styles.page_description}>
        <div className={styles.infoAlert} role="status">
          <div className="flex items-start gap-2">
            <InfoIcon className="w-4 h-4" style={{ color: "var(--dark-2)" }} />
            <div className={styles.infoAlertDesc}>
              {tooltips[billingMethod]}
            </div>
          </div>
        </div>
      </div>

      <Card className={styles.billing_content_wrapper}>
        <CardContent className="pt-6">
          {billingMethod === "OnDemand" && (
            <Tabs defaultValue={filterOptions.productCategory}>
              <div className="flex flex-row overflow-x-auto">
                <TabsList className="mb-[22px] bg-common-gray-3">
                  <TabsTrigger
                    value="summary"
                    onClick={() => handleCycleChange("summary")}
                    className="px-3"
                    id={
                      CLICK_BTN_IDs.BILLING
                        .BILLING_DETAIL_USAGE_BASED_SUMMARY_SUB_TAB
                    }
                  >
                    {"Summary"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="llm"
                    onClick={() => handleCycleChange("llm")}
                    className="px-3"
                    id={
                      CLICK_BTN_IDs.BILLING
                        .BILLING_DETAIL_USAGE_BASED_LLM_SUB_TAB
                    }
                  >
                    {"LLM Serverless Endpoints"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="llm-dedicated-endpoint"
                    onClick={() => handleCycleChange("llm-dedicated-endpoint")}
                    className="px-3"
                    id={
                      CLICK_BTN_IDs.BILLING
                        .BILLING_DETAIL_USAGE_BASED_LLM_DE_SUB_TAB
                    }
                  >
                    {"LLM Dedicated Endpoints"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="gen_api"
                    onClick={() => handleCycleChange("gen_api")}
                    className="px-3"
                    id={
                      CLICK_BTN_IDs.BILLING
                        .BILLING_DETAIL_USAGE_BASED_IMG_VIDEO_SUB_TAB
                    }
                  >
                    {"Image/Video/Search"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="gpu"
                    onClick={() => {
                      handleCycleChange("gpu");
                    }}
                    className="px-3"
                    id={
                      CLICK_BTN_IDs.BILLING
                        .BILLING_DETAIL_USAGE_BASED_GPU_SUB_TAB
                    }
                  >
                    {"GPU Instances"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="serverless"
                    onClick={() => handleCycleChange("serverless")}
                    className="px-3"
                    id={
                      CLICK_BTN_IDs.BILLING
                        .BILLING_DETAIL_USAGE_BASED_SERVERLESS_SUB_TAB
                    }
                  >
                    {"GPU Serverless"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="cloud_storage"
                    onClick={() => handleCycleChange("cloud_storage")}
                    className="px-3"
                    id={
                      CLICK_BTN_IDs.BILLING
                        .BILLING_DETAIL_USAGE_BASED_STORAGE_SUB_TAB
                    }
                  >
                    {"Storage"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="cloud_sandbox"
                    onClick={() => handleCycleChange("cloud_sandbox")}
                    className="px-3"
                    id={
                      CLICK_BTN_IDs.BILLING
                        .BILLING_DETAIL_USAGE_BASED_SANDBOX_SUB_TAB
                    }
                  >
                    Agent Sandbox
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="summary">
                <SummaryTable {...tableProps} />
              </TabsContent>
              <TabsContent value="llm">
                <LLMTable {...tableProps} />
              </TabsContent>
              <TabsContent value="gen_api">
                <GenAPITable {...tableProps} />
              </TabsContent>
              <TabsContent value="gpu">
                <GPUInstanceTable {...tableProps} />
              </TabsContent>
              <TabsContent value="serverless">
                <ServerlessTable {...tableProps} />
              </TabsContent>
              <TabsContent value="cloud_storage">
                <NetworkStorageTable {...tableProps} />
              </TabsContent>
              <TabsContent value="llm-dedicated-endpoint">
                <LLMDedicatedEndpointTable {...tableProps} />
              </TabsContent>
              <TabsContent value="cloud_sandbox">
                <SandboxTable {...tableProps} />
              </TabsContent>
            </Tabs>
          )}
          {billingMethod === "Monthly" && (
            <Tabs defaultValue={monthlyCategory}>
              <TabsList className="mb-[22px] bg-common-gray-3">
                <TabsTrigger
                  value="summary"
                  onClick={() => setMonthlyCategory("summary")}
                  className="px-3"
                  id={
                    CLICK_BTN_IDs.BILLING
                      .BILLING_DETAIL_FIXED_TERM_SUMMARY_SUB_TAB
                  }
                >
                  {"Summary"}
                </TabsTrigger>
                <TabsTrigger
                  value="gpu"
                  onClick={() => {
                    setMonthlyCategory("gpu");
                  }}
                  className="px-3"
                  id={
                    CLICK_BTN_IDs.BILLING.BILLING_DETAIL_FIXED_TERM_GPU_SUB_TAB
                  }
                >
                  {"GPU Instance"}
                </TabsTrigger>
                <TabsTrigger
                  value="cloud_storage"
                  onClick={() => setMonthlyCategory("cloud_storage")}
                  className="px-3"
                  id={
                    CLICK_BTN_IDs.BILLING
                      .BILLING_DETAIL_FIXED_TERM_STORAGE_SUB_TAB
                  }
                >
                  {"Storage"}
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  onClick={() => setMonthlyCategory("image")}
                  className="px-3"
                  id={
                    CLICK_BTN_IDs.BILLING
                      .BILLING_DETAIL_FIXED_TERM_IMG_DE_SUB_TAB
                  }
                >
                  {"Image Dedicated Endpoint"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <SummaryTableMonthly {...tableProps} />
              </TabsContent>
              <TabsContent value="gpu">
                <GPUInstanceTableMonthly {...tableProps} />
              </TabsContent>
              <TabsContent value="cloud_storage">
                <NetworkStorageTableMonthly {...tableProps} />
              </TabsContent>
              <TabsContent value="image">
                <ImageDedicatedEndpointTable {...tableProps} />
              </TabsContent>
            </Tabs>
          )}
          {billingMethod === "MultiDimension" && (
            <Tabs defaultValue={multiDimensionCategory}>
              <TabsList className="mb-[22px]">
                {currentTeam && (
                  <TabsTrigger
                    value="creator"
                    onClick={() => setMultiDimensionCategory("creator")}
                    className="px-3"
                  >
                    {"By Creator"}
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="api_key"
                  onClick={() => setMultiDimensionCategory("api_key")}
                  className="px-8"
                >
                  {"By API Key"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="creator">
                <PurcherTable {...tableProps} />
              </TabsContent>
              <TabsContent value="api_key">
                <APIKeyTable {...tableProps} />
              </TabsContent>
            </Tabs>
          )}
          {billingMethod === "Enterprise" && (
            <EnterpriseTable pageSize={PAGE_SIZE} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
