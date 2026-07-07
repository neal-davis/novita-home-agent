"use client";
import React from "react";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  docsLink: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
  docsLink,
}) => {
  const router = useRouter();

  return (
    <div className="flex gap-4 w-full">
      <div className="w-8 h-8 bg-[var(--gray-3)] rounded flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex justify-between items-center gap-2">
          <h3 className="text-sm font-medium text-[var(--black)] leading-[1.43]">
            {title}
          </h3>
          <div
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(docsLink)}
          >
            <FileText className="w-3 h-3 text-[var(--brand-1)]" />
            <span className="text-xs font-normal text-[var(--brand-1)] leading-[1.67] underline">
              Docs
            </span>
          </div>
        </div>
        <p className="text-xs font-normal text-[var(--dark-1)] leading-[1.67]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureItem;
