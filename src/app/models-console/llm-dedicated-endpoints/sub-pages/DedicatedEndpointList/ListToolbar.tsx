"use client";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { SearchInput } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LLM_DE_STATUS } from "../../components/DEModelStatus";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";

interface ListToolbarProps {
  dedicatedEndpointList: LLMDedicatedEndpoint[];
  totalCount: number;
  filterStatus: string;
  filterEndpointName: string;
  onStatusChange: (value: string) => void;
  onEndpointNameChange: (value: string) => void;
  onCreateEndpoint: () => void;
}

export function ListToolbar({
  dedicatedEndpointList,
  totalCount,
  filterStatus,
  filterEndpointName,
  onStatusChange,
  onEndpointNameChange,
  onCreateEndpoint,
}: ListToolbarProps) {
  return (
    <div className="flex flex-row gap-2 mb-4 justify-between items-center">
      {/* Left: New Endpoint button + count */}
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 px-3"
          onClick={() => {
            onCreateEndpoint();
            analytics.trackClick(
              CLICK_BTN_IDs.MODELS_CONSOLE.LLM_DE_CREATE_ENDPOINT_ENTRY,
              { position: "toolbar" },
            );
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          New Endpoint
        </Button>
        <span className="text-[12px] text-[var(--dark-2)]">
          {dedicatedEndpointList.length === totalCount
            ? `${totalCount} endpoint${totalCount !== 1 ? "s" : ""}`
            : `${dedicatedEndpointList.length}/${totalCount} endpoints`}
        </span>
      </div>

      {/* Right: Search + Status filter */}
      <div className="flex flex-row gap-2">
        <SearchInput
          containerClassName="w-[300px]"
          className="h-8"
          placeholder="Search by endpoint or model name..."
          value={filterEndpointName}
          onSearch={onEndpointNameChange}
        />
        <div className="relative">
          <Select value={filterStatus} onValueChange={onStatusChange}>
            <SelectTrigger
              className={`h-8 ${filterStatus !== "all" ? "w-[160px] pr-8" : "w-[160px]"}`}
            >
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" key="all">
                All Status
              </SelectItem>
              <SelectItem value={LLM_DE_STATUS.RUNNING} key="running">
                Running
              </SelectItem>
              <SelectItem value={LLM_DE_STATUS.SLEEPING} key="sleeping">
                Sleeping
              </SelectItem>
              <SelectItem value={LLM_DE_STATUS.FAILED} key="failed">
                Failed
              </SelectItem>
              <SelectItem value={LLM_DE_STATUS.TERMINATED} key="terminated">
                Terminated
              </SelectItem>
            </SelectContent>
          </Select>
          {filterStatus !== "all" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange("all");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[var(--gray-3)] transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[var(--dark-3)]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
