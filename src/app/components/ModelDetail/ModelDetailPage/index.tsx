import React from "react";
import { NOVITA_URL } from "@/constants/urls";
import Breadcrumb from "../../Breadcrumb";
import ModelDetailHeader from "../ModelDetailHeader";
import ModelFeatures from "../ModelFeatures";
import ModelUsage from "../ModelUsage";
import ModelInfo from "../ModelInfo";
import { LLMModelWithStatus } from "@/types/models";
import {
  getLocalizedPath,
  getPathnameLocale,
  getPathnameWithoutLocale,
} from "@/i18n/config";

interface ModelDetailPageProps {
  modelName: string;
  modelVersion?: string;
  modelStatus?: string;
  modelId?: string;
  modelLogo?: string;
  model?: LLMModelWithStatus;
  initialReadmeContent?: { [key: string]: string };
  modelConfig?: any;
  pathname?: string;
  from?: string;
  onTryModal?: () => void;
  onApiDocs?: () => void;
}

const ModelDetailPage: React.FC<ModelDetailPageProps> = ({
  modelName,
  modelVersion,
  modelStatus,
  modelId,
  modelLogo,
  model,
  initialReadmeContent,
  modelConfig,
  pathname = "",
  from,
  onTryModal,
  onApiDocs,
}) => {
  const locale = getPathnameLocale(pathname).locale;
  const businessPathname = getPathnameWithoutLocale(pathname);
  // Determine the previous page URL and label based on current path and from parameter
  const isFromConsole = businessPathname.startsWith("/models-console");

  // Determine breadcrumb based on from parameter or pathname
  let previousPage: string;
  let previousPageUrl: string;

  if (isFromConsole) {
    previousPage = "Model Library";
    previousPageUrl = NOVITA_URL.MODEL_API_CONSOLE_MODEL_LIBRARY;
  } else if (from === "pricing") {
    previousPage = "Pricing";
    previousPageUrl = "/pricing";
  } else if (from === "home") {
    previousPage = "Home";
    previousPageUrl = "/";
  } else {
    previousPage = "Model Library";
    previousPageUrl = "/models";
  }
  previousPageUrl = locale
    ? getLocalizedPath(previousPageUrl, locale)
    : previousPageUrl;

  return (
    <div className="bg-white pb-12">
      {/* Breadcrumb outside max_width_container to allow full-width positioning */}
      <div className="w-full">
        <Breadcrumb
          previousPage={previousPage}
          modelName={modelName}
          previousPageUrl={previousPageUrl}
          variant={isFromConsole ? "console" : "default"}
          container={isFromConsole ? "default" : "layout-safe"}
        />
      </div>
      <div
        className={
          isFromConsole
            ? "px-console"
            : "mx-auto w-full min-w-0 max-w-layout-safe px-[var(--spacing-layout-x)]"
        }
      >
        {/* Content with padding */}
        <div className="pt-4 pb-6">
          {/* Header */}
          <ModelDetailHeader
            modelName={modelName}
            modelVersion={modelVersion}
            modelStatus={modelStatus}
            modelId={modelId}
            modelLogo={modelLogo}
            model={model}
            onTryModal={onTryModal}
            onApiDocs={onApiDocs}
          />

          {/* Main Content Area with borders */}
          <div className="border-t border-r border-[var(--gray-2)]">
            {/* Content Container */}
            <div className="flex flex-col lg:flex-row">
              {/* Left Column - Features and Usage */}
              <div className="flex-1 pl-0 pr-4 pt-4 pb-4 lg:pl-0 lg:pr-6 lg:pt-5 lg:pb-0 min-w-0">
                <div className="space-y-8">
                  <ModelFeatures
                    modelId={modelId}
                    model={model}
                    modelConfig={modelConfig}
                  />
                  <ModelUsage
                    model={model}
                    initialReadmeContent={initialReadmeContent}
                    modelConfig={modelConfig}
                  />
                </div>
              </div>

              {/* Right Column - Info */}
              <div className="flex-shrink-0 w-full max-w-[350px] lg:w-auto lg:min-w-[200px] lg:max-w-[350px] xl:max-w-[400px] border-t lg:border-t-0 lg:border-l border-[var(--gray-2)] min-w-0">
                <ModelInfo model={model} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPage;
