import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Monitor } from "lucide-react";
import { NOVITA_URL } from "@/constants/urls";

const DOCS_URL = "https://novita.ai/docs/guides/llm-dedicated-endpoint";

export default function GetStarted({
  goToCreateEndpoint,
}: {
  goToCreateEndpoint: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Empty state - centered content */}
      <div className="flex-1 flex flex-col items-center justify-center py-16">
        {/* Icon with circular background */}
        <div className="w-[120px] h-[120px] rounded-full bg-[var(--gray-2)] flex items-center justify-center mb-6">
          <Monitor className="w-10 h-10 text-[var(--dark-3)]" />
        </div>

        {/* Title */}
        <h2 className="text-[24px] font-semibold text-[var(--dark-1)] mb-3">
          Dedicated Endpoints
        </h2>

        {/* Description */}
        <p className="text-[16px] text-[var(--dark-2)] text-center max-w-[480px] mb-8">
          Quickly deploy your own model from the{" "}
          <Link
            href="https://huggingface.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-0)] hover:underline"
          >
            Hugging Face
          </Link>{" "}
          repository.
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {DOCS_URL ? (
            <Button variant="outline" size="sl" className="px-6 h-11" asChild>
              <Link href={DOCS_URL}>Learn more</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sl" className="px-6 h-11" disabled>
              Learn more
            </Button>
          )}
          <Button
            variant="secondary"
            size="sl"
            className="px-6 h-11"
            onClick={goToCreateEndpoint}
          >
            Create Endpoint
          </Button>
        </div>
      </div>
    </div>
  );
}
