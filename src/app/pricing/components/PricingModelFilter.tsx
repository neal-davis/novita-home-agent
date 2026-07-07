"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import {
  LayoutGrid,
  MessageCircleCode,
  FileImage,
  AudioLines,
  Video,
  SquarePercent,
  Search,
  X,
} from "lucide-react";
import { useI18nSubscription } from "@/i18n/provider";

export type PricingFilterType =
  | "All"
  | "LLM"
  | "Image"
  | "Audio"
  | "Video"
  | "AI Search"
  | "Cache";

interface PricingModelFilterProps {
  searchValue: string;
  filterType: PricingFilterType;
  selectedProvider?: string;
  availableProviders?: string[];
  onSearchChange: (value: string) => void;
  onFilterTypeChange: (type: PricingFilterType) => void;
  onProviderChange?: (provider: string) => void;
  className?: string;
  isConsole?: boolean;
}

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getFilterTypes() {
  return [
    {
      label: "All",
      value: "All" as PricingFilterType,
      icon: <LayoutGrid size={16} />,
    },
    {
      label: "LLM",
      value: "LLM" as PricingFilterType,
      icon: <MessageCircleCode size={16} />,
    },
    {
      label: "Image",
      value: "Image" as PricingFilterType,
      icon: <FileImage size={16} />,
    },
    {
      label: "Audio",
      value: "Audio" as PricingFilterType,
      icon: <AudioLines size={16} />,
    },
    {
      label: "Video",
      value: "Video" as PricingFilterType,
      icon: <Video size={16} />,
    },
    {
      label: "AI Search",
      value: "AI Search" as PricingFilterType,
      icon: <Search size={16} />,
    },
    {
      label: "Cache",
      value: "Cache" as PricingFilterType,
      icon: <SquarePercent size={16} />,
    },
  ];
}

export default function PricingModelFilter({
  searchValue,
  filterType,
  selectedProvider = "",
  availableProviders = [],
  onSearchChange,
  onFilterTypeChange,
  onProviderChange,
  className,
  isConsole = false,
}: PricingModelFilterProps) {
  useI18nSubscription();
  const filterTypes = getFilterTypes();
  const handleTypeClick = (type: PricingFilterType) => {
    if (searchValue.trim()) {
      onSearchChange("");
    }
    const newType = filterType === type ? "All" : type;
    onProviderChange?.("");
    onFilterTypeChange(newType);
  };

  const handleProviderChange = (provider: string) => {
    if (searchValue.trim()) {
      onSearchChange("");
    }
    onFilterTypeChange("All");
    onProviderChange?.(provider === "All" ? "" : provider);
  };

  const handleSearchChange = (value: string) => {
    if (value.trim() && filterType !== "All") {
      onFilterTypeChange("All");
      onProviderChange?.("");
    }
    onSearchChange(value);
  };

  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-space-8",
        className,
      )}
    >
      {/* Search input */}
      <div
        className={cn(
          "relative flex items-center justify-between h-[34px] bg-white border border-[var(--border-default)] rounded-6 px-space-16",
          isConsole ? "max-w-[296px] flex-1" : "w-full flex-none md:w-[420px]",
        )}
      >
        <input
          placeholder="Search Model"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 bg-transparent outline-none font-miletus text-paragraph-13 text-[var(--text-1)] placeholder:text-[var(--text-3)]"
          aria-label="Search models"
        />
        {searchValue.trim() ? (
          <button
            onClick={handleClearSearch}
            className="ml-space-8 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        ) : (
          <Search
            size={16}
            className="ml-space-8 text-[var(--text-3)] pointer-events-none"
          />
        )}
      </div>

      {/* Category filter pills */}
      <div className="flex w-full max-w-full flex-wrap gap-space-8 overflow-visible md:w-auto">
        {filterTypes.map((type) => {
          const isActive = filterType === type.value && selectedProvider === "";

          return (
            <button
              key={type.value}
              onClick={() => handleTypeClick(type.value)}
              className={cn(
                "flex h-[34px] flex-none items-center gap-space-4 whitespace-nowrap rounded-6 border px-space-16 font-miletus text-[13px] leading-[18px] text-[var(--text-1)] transition-colors cursor-pointer",
                isActive
                  ? "bg-[var(--brand-2)] border-[var(--brand-0)]"
                  : "bg-white border-[var(--border-default)]",
              )}
              aria-pressed={isActive}
              aria-label={`Filter by ${type.label}`}
            >
              {type.icon}
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Providers dropdown */}
      <Select
        value={selectedProvider || "All"}
        onValueChange={handleProviderChange}
      >
        <SelectTrigger
          className={cn(
            "h-[34px] w-full md:w-[180px] md:max-w-[180px] flex-none flex-nowrap overflow-hidden whitespace-nowrap bg-white border border-[var(--border-default)] rounded-6 px-space-16 gap-space-4 font-miletus text-[13px] leading-[18px] text-[var(--text-1)]",
            /* 覆盖 shadcn SelectTrigger 的 [&>span]:line-clamp-1，避免 logo + provider 名被拆行 */
            "[&>span]:line-clamp-none [&>span]:flex [&>span]:min-w-0 [&>span]:flex-nowrap [&>span]:items-center",
            selectedProvider !== "" &&
              "bg-[var(--brand-2)] border-[var(--brand-0)]",
          )}
        >
          <span className="flex min-w-0 min-h-0 flex-1 flex-nowrap items-center gap-space-4 overflow-hidden text-left">
            {selectedProvider ? (
              <ModelLogo
                modelName={selectedProvider}
                size={16}
                className="shrink-0"
              />
            ) : null}
            <span className="block min-w-0 flex-1 truncate whitespace-nowrap">
              {selectedProvider === "" ? "All" : selectedProvider}
            </span>
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {availableProviders.map((provider) => (
            <SelectItem key={provider} value={provider}>
              <span className="flex items-center gap-space-8">
                <ModelLogo
                  modelName={provider}
                  size={20}
                  className="shrink-0"
                />
                <span>{provider}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
