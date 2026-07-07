"use client";

import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModelType } from "@/types/models";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Boxes,
  MessageCircleCode,
  FileImage,
  AudioLines,
  Video,
  SquareSigma,
  ListFilter,
  Eye,
  Search,
} from "lucide-react";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { LLMModelWithStatus, MediaModel } from "@/types/models";
import BuildMonthTag from "@/app/components/buildMonth";
import { useI18n } from "@/i18n/provider";
import styles from "./index.module.scss";

type AnyModel = LLMModelWithStatus | MediaModel;

interface ModelFilterProps {
  models: AnyModel[];
  selectedCategory: ModelType | "";
  selectedProvider: string;
  onFilterChange: (category: ModelType | "") => void;
  onProviderChange: (provider: string) => void;
  campaignConfig?: {
    displayName: string;
    enabled: boolean;
    discountLabel?: string;
  };
  className?: string;
}

const ServerlessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M14 2.66668H9.33333M6.66667 2.66668H2M14 8.00001H8M5.33333 8.00001H2M14 13.3333H10.6667M8 13.3333H2M9.33333 1.33334V4.00001M5.33333 6.66668V9.33334M10.6667 12V14.6667"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ALL_PROVIDER_VALUE = "__all__";

export function createBaseFilterTypes(): {
  label: string;
  value: ModelType;
  icon?: React.ReactNode;
  className?: string;
}[] {
  return [
    {
      label: "Featured",
      value: ModelType.Featured,
      icon: <Sparkles size={16} />,
    },
    {
      label: "All Models",
      value: ModelType.All,
      icon: <Boxes size={16} />,
    },
    {
      label: "LLM",
      value: ModelType.Chat,
      icon: <MessageCircleCode size={16} />,
    },
    {
      label: "Serverless",
      value: ModelType.Serverless,
      icon: <ServerlessIcon />,
    },
    { label: "Image", value: ModelType.Images, icon: <FileImage size={16} /> },
    { label: "Audio", value: ModelType.Audio, icon: <AudioLines size={16} /> },
    { label: "Video", value: ModelType.Video, icon: <Video size={16} /> },
    {
      label: "Embedding",
      value: ModelType.Embedding,
      icon: <SquareSigma size={16} />,
    },
    {
      label: "Reranker",
      value: ModelType.Reranker,
      icon: <ListFilter size={16} />,
    },
    {
      label: "AI Search",
      value: ModelType.AISearch,
      icon: <Search size={16} />,
    },
    { label: "Vision", value: ModelType.Vision, icon: <Eye size={16} /> },
  ];
}

export default function ModelFilter({
  models,
  selectedCategory,
  selectedProvider,
  onFilterChange,
  onProviderChange,
  campaignConfig,
  className,
}: ModelFilterProps) {
  const { locale } = useI18n();

  const filterTypes = useMemo(() => {
    void locale;
    const baseFilterTypes = createBaseFilterTypes();
    if (campaignConfig && campaignConfig.enabled) {
      return [
        {
          label: campaignConfig.displayName,
          value: ModelType.Campaign,
          className: styles.campaign_filter,
        },
        ...baseFilterTypes,
      ];
    }
    return baseFilterTypes;
  }, [campaignConfig, locale]);

  const providers: string[] = useMemo(() => {
    const allSeries = models.map((model) => model.series);
    const providers = [...new Set(allSeries)].filter(Boolean) as string[];
    const othersIndex = providers.indexOf("Others");
    if (othersIndex > -1) {
      providers.splice(othersIndex, 1);
      providers.push("Others");
    }
    return [ALL_PROVIDER_VALUE, ...providers];
  }, [models]);

  useEffect(() => {
    if (selectedProvider && !providers.includes(selectedProvider)) {
      onProviderChange("");
    }
  }, [selectedProvider, providers, onProviderChange]);

  const handleTypeToggle = (type: ModelType) => {
    const newSelectedType = selectedCategory === type ? ModelType.All : type;
    // onProviderChange("");
    onFilterChange(newSelectedType);
  };

  const handleProviderChange = (provider: string) => {
    // onFilterChange("");
    onProviderChange(provider === ALL_PROVIDER_VALUE ? "" : provider);
  };

  return (
    <div className={cn(styles.filter_container, className)}>
      <div className={styles.filter_type_group}>
        {filterTypes.map((type) => {
          const isActive = selectedCategory === type.value;
          const isCampaignFilter = type.className === styles.campaign_filter;

          return (
            <Button
              key={type.value}
              variant={isActive ? "default" : "outline"}
              onClick={() => handleTypeToggle(type.value)}
              className={cn(styles.model_filter_label, type.className, {
                [styles.model_filter_label_active]: isActive,
              })}
            >
              {isCampaignFilter &&
                campaignConfig &&
                campaignConfig.discountLabel && (
                  <BuildMonthTag
                    type="small"
                    text={campaignConfig.discountLabel}
                    className="absolute -top-[8px] -left-[1px]"
                  />
                )}
              {type.icon && (
                <span className={styles.model_filter_label_icon}>
                  {type.icon}
                </span>
              )}
              {type.label}
            </Button>
          );
        })}
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger
            className={cn(
              "w-[140px] h-8 text-sm",
              styles.model_filter_select_label,
              //   , {
              //   [styles.model_filter_label_active]: selectedProvider !== "",
              // }
            )}
          >
            {selectedProvider === "" ? (
              <span>Model Series</span>
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider} checkPosition="right">
                {provider === ALL_PROVIDER_VALUE ? (
                  <div>All</div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ModelLogo modelName={provider} size={20} />
                    <span>{provider}</span>
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
