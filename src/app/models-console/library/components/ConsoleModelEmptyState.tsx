import Link from "next/link";
import { DOCS_URL } from "@/constants/urls";

export function ConsoleModelEmptyState() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/hero/3d-logo.png"
        alt=""
        className="h-[140px] w-[160px] object-contain"
        aria-hidden="true"
      />
      <p className="mt-space-12 font-miletus text-[12px] font-normal leading-[16px] tracking-normal text-[var(--text-3)]">
        No models match your filters
      </p>
      <Link
        href={DOCS_URL.LLM_RECOMMENDED}
        className="mt-space-12 inline-flex h-[var(--height-36)] items-center justify-center rounded-full border border-[var(--border-strong)] bg-fill-white px-space-20 font-miletus text-[15px] font-normal leading-[22px] tracking-normal text-[var(--text-1)] transition-colors duration-200 hover:border-brand-1 hover:text-brand-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0"
      >
        Recommend me a model →
      </Link>
    </div>
  );
}
