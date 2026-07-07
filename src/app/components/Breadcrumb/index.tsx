import React from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";

interface BreadcrumbProps {
  previousPage: string;
  modelName: string;
  previousPageUrl?: string;
  variant?: "default" | "console";
  align?: "left" | "center";
  container?: "default" | "layout-safe";
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  previousPage,
  modelName,
  previousPageUrl,
  variant = "default",
  align = "center",
  container = "default",
}) => {
  const isConsole = variant === "console";
  const containerClass =
    container === "layout-safe"
      ? "mx-auto w-full min-w-0 max-w-layout-safe px-[var(--spacing-layout-x)]"
      : "max_width_container";

  return (
    <div
      className={`flex items-center gap-2 ${
        isConsole
          ? "border-b border-[var(--gray-2)] py-[5px] pr-4"
          : containerClass
      }`}
    >
      <div
        className={`${isConsole ? "pl-3" : align === "left" ? "pl-0" : "pl-0"}`}
      >
        {/* Previous Page - Clickable */}
        <div
          className={`flex items-center gap-2 ${isConsole || align === "left" || container === "layout-safe" ? "" : "px-web"}`}
        >
          <Link
            href={previousPageUrl || NOVITA_URL.MODEL_API_CONSOLE_MODEL_LIBRARY}
            className="font-small-console text-[var(--dark-3)] hover:text-[var(--dark-2)] transition-colors cursor-pointer flex items-center gap-2"
          >
            {isConsole && <ChevronLeft className="w-4 h-4" />}
            {previousPage}
          </Link>

          {/* Separator */}
          <span className="text-[var(--dark-3)]">/</span>

          {/* Current Model Name - Not clickable */}
          <span className="font-small-console text-[var(--dark-1)]">
            {modelName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
