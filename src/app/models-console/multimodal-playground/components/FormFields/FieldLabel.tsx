"use client";

import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import styles from "./FormFields.module.scss";

interface FieldLabelProps {
  label: string;
  required?: boolean;
  description?: string;
  htmlFor?: string;
}

export const FieldLabel = ({
  label,
  required,
  description,
  htmlFor,
}: FieldLabelProps) => {
  return (
    <div className="flex items-center gap-1 mb-2">
      <Label htmlFor={htmlFor} className={styles.field_label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </Label>
      {description && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-[var(--dark-3)]" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
