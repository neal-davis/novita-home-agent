"use client";

import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ChartPie } from "lucide-react";

interface BillingFieldDetail {
  label: string;
  labelDesc?: string;
  value: string | React.ReactNode;
}

interface BillingFieldDetailsProps {
  displayValue: string | React.ReactNode;
  details: BillingFieldDetail[];
}

const BillingDetailRows: React.FC<{ details: BillingFieldDetail[] }> = ({
  details,
}) => (
  <div className="flex flex-col gap-1">
    {details.map((detail, index) => {
      const hasLabel = Boolean(detail.label || detail.labelDesc);
      return (
        <React.Fragment key={index}>
          <div className="flex flex-wrap items-start gap-x-1 text-[12px] leading-5">
            {hasLabel && (
              <>
                {detail.label && (
                  <span className="text-[var(--dark-3)] whitespace-normal">
                    {detail.label}
                  </span>
                )}
                {detail.labelDesc && (
                  <span className="text-[var(--dark-3)] whitespace-normal">
                    {detail.labelDesc}
                  </span>
                )}
              </>
            )}
            <span className="text-[var(--dark-1)] whitespace-nowrap">
              {detail.value}
            </span>
          </div>
          {index < details.length - 1 && (
            <div className="h-px w-full bg-[var(--border-3)] my-1" />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const BillingFieldDetails: React.FC<BillingFieldDetailsProps> = ({
  displayValue,
  details,
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--brand-0)] transition-colors">
          <ChartPie className="w-3 h-3 shrink-0" />
          {displayValue}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="!w-auto min-w-fit p-3">
        <BillingDetailRows details={details} />
      </HoverCardContent>
    </HoverCard>
  );
};

export const BillingFieldDetailsOutput: React.FC<BillingFieldDetailsProps> = ({
  displayValue,
  details,
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--brand-0)] transition-colors">
          <ChartPie className="w-3 h-3 shrink-0" />
          {displayValue}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="!w-auto min-w-fit p-3">
        <BillingDetailRows details={details} />
      </HoverCardContent>
    </HoverCard>
  );
};

export default BillingFieldDetails;
