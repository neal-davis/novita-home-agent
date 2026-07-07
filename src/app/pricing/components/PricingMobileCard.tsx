import React from "react";
import { cn } from "@/lib/utils";

export interface PricingMobileField {
  label: React.ReactNode;
  value: React.ReactNode;
}

interface PricingMobileCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  fields?: PricingMobileField[];
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export default function PricingMobileCard({
  title,
  subtitle,
  fields = [],
  action,
  children,
  className,
  "data-testid": dataTestId,
}: PricingMobileCardProps) {
  return (
    <article
      data-testid={dataTestId}
      className={cn(
        "rounded-8 border border-[var(--border-default)] bg-white p-space-16 [box-shadow:none]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-space-12">
        <div className="min-w-0">
          <h4 className="break-words font-miletus text-paragraph-16-medium text-[var(--text-1)]">
            {title}
          </h4>
          {subtitle ? (
            <div className="mt-space-4 break-words font-miletus text-paragraph-13 text-[var(--text-3)]">
              {subtitle}
            </div>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {fields.length > 0 ? (
        <dl className="mt-space-16 flex flex-col gap-space-12">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex flex-col gap-space-4 border-t border-[var(--border-subtle)] pt-space-12 first:border-t-0 first:pt-0"
            >
              <dt className="font-miletus text-[12px] leading-[16px] text-[var(--text-3)]">
                {field.label}
              </dt>
              <dd className="min-w-0 break-words font-miletus text-paragraph-13 text-[var(--text-1)]">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {children ? <div className="mt-space-16">{children}</div> : null}
    </article>
  );
}
