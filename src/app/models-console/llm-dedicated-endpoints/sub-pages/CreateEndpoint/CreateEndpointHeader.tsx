"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { NOVITA_URL } from "@/constants/urls";

interface CreateEndpointHeaderProps {
  onBack: () => void;
}

export function CreateEndpointHeader({ onBack }: CreateEndpointHeaderProps) {
  return (
    <div className="bg-white -mx-4 -mt-4 px-4 py-4 mb-5 border-b border-[var(--gray-2)]">
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-[12px] text-[var(--dark-2)] border-[var(--gray-2)] hover:bg-[var(--gray-3)] mb-3"
        onClick={onBack}
      >
        <ChevronLeft size={14} strokeWidth={1.4} className="mr-1" />
        Back to Endpoints
      </Button>

      <h1 className="text-[20px] font-semibold text-[var(--dark-1)]">
        Create Dedicated Endpoint
      </h1>
      <p className="text-[13px] text-[var(--dark-2)] mt-1">
        Deploy an open source model from the{" "}
        <Link
          href={NOVITA_URL.MODEL_API_CONSOLE_MODEL_LIBRARY}
          className="text-[var(--brand-0)] hover:underline"
        >
          Model Library
        </Link>{" "}
        or your own custom model in just a few commands.
      </p>
    </div>
  );
}
