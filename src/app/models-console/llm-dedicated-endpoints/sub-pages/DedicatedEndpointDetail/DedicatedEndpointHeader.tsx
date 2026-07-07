"use client";

import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink } from "lucide-react";
import styles from "./DedicatedEndpointDetail.module.scss";

interface DedicatedEndpointHeaderProps {
  endpointData: LLMDedicatedEndpoint;
  modelDisplayName: string;
  formattedCreateTime: string;
  primaryActions: Array<{
    key: string;
    label: string;
    onClick: () => void;
  }>;
  canTerminate: boolean;
  canDelete: boolean;
  canPlayground: boolean;
  onBack: () => void;
  onTerminate: () => void;
  onDelete: () => void;
}

export function DedicatedEndpointHeader({
  endpointData,
  modelDisplayName,
  formattedCreateTime,
  primaryActions,
  canTerminate,
  canDelete,
  canPlayground,
  onBack,
  onTerminate,
  onDelete,
}: DedicatedEndpointHeaderProps) {
  return (
    <div className={styles.top_section}>
      <div className={styles.header_content}>
        {/* Left: Back + Name + Meta stacked vertically */}
        <div className={styles.header_left}>
          {/* Back button */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[12px] text-[var(--dark-2)] border-[var(--gray-2)] hover:bg-[var(--gray-3)]"
            onClick={onBack}
          >
            <ChevronLeft size={14} strokeWidth={1.4} className="mr-1" />
            Back to Endpoints
          </Button>

          {/* Name row */}
          <div className={styles.name_row}>
            <h1 className={styles.endpoint_name}>{endpointData.name}</h1>
          </div>

          {/* Meta info row */}
          <div className={styles.meta_row}>
            <span className="flex items-center gap-1">
              <span>Created:</span>
              <span>{formattedCreateTime}</span>
            </span>
            <span className={styles.meta_separator}>·</span>
            <span className="flex items-center gap-1">
              <span>Model:</span>
              <span>{modelDisplayName}</span>
            </span>
            <span className={styles.meta_separator}>·</span>
            <span className="flex items-center gap-1">
              <span>GPU:</span>
              <span>{endpointData.resources.gpu.name} ×</span>
              <span>{endpointData.resources.gpu.count}</span>
            </span>
            <span className={styles.meta_separator}>·</span>
            <span className="flex items-center gap-1">
              <span>by</span>
              <span>{endpointData.createUserName || "Unknown"}</span>
            </span>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className={styles.header_actions}>
          {/* 1. Primary actions (Wake Up, Redeploy) */}
          {primaryActions.map((action) => (
            <Button
              key={action.key}
              size="sm"
              className="h-7 px-3 text-[12px] bg-[var(--dark-1)] text-white hover:bg-[var(--dark-2)]"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}

          {/* 2. Terminate button */}
          {canTerminate && (
            <Button
              size="sm"
              className="h-7 px-3 text-[12px] bg-[var(--dark-1)] text-white hover:bg-[var(--dark-2)]"
              onClick={onTerminate}
            >
              Terminate
            </Button>
          )}

          {/* 3. Delete button */}
          {canDelete && (
            <Button
              size="sm"
              className="h-7 px-3 text-[12px] bg-[var(--red-1)] text-white hover:bg-[var(--red-2)]"
              onClick={onDelete}
            >
              Delete
            </Button>
          )}

          {/* 4. Playground button */}
          {canPlayground && (
            <Link
              href={`${NOVITA_URL.LLM_PAGE}/${
                endpointData.id
              }?endpoint=${encodeURIComponent(endpointData.url)}`}
              target="_blank"
            >
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[12px] text-[var(--dark-1)] border-[var(--dark-1)] hover:bg-[var(--gray-3)]"
              >
                Playground
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
