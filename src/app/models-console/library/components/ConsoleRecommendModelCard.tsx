import Link from "next/link";
import { DOCS_URL } from "@/constants/urls";

export function ConsoleRecommendModelCard() {
  return (
    <Link
      href={DOCS_URL.LLM_RECOMMENDED}
      className="group relative flex min-h-[270px] cursor-pointer overflow-hidden rounded-4 border border-[var(--border-2)] bg-fill-white transition-colors duration-200 hover:border-[var(--border-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/build-with/bg01.png"
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-110 object-cover object-center transition-transform duration-500 group-hover:scale-125"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[image:var(--model-library-recommend-overlay)]" />
      <div className="relative flex w-full flex-col items-center justify-center gap-space-20 p-space-16">
        <div className="flex flex-col items-start gap-space-20">
          {[
            ["200+", "models"],
            ["200ms", "latency"],
            ["99.5%", "uptime"],
          ].map(([value, label]) => (
            <div key={label} className="flex items-center gap-space-4">
              <span
                className="h-space-6 w-space-6 shrink-0 rounded-[1px] bg-[var(--element-high-em)]"
                aria-hidden="true"
              />
              <div className="flex items-center gap-space-10 whitespace-nowrap font-tt-mono text-mono-12 uppercase tracking-[0.48px] [line-height:1.2]">
                <span className="text-[var(--element-high-em)]">{value}</span>
                <span className="text-element-mid-em">{label}</span>
              </div>
            </div>
          ))}
        </div>

        <span className="inline-flex h-[var(--height-36)] items-center justify-center rounded-full border border-[var(--border-strong)] bg-fill-white px-space-20 font-miletus text-paragraph-15 text-[var(--text-1)] transition-colors duration-200 group-hover:border-brand-1 group-hover:text-brand-1">
          Recommend me a model →
        </span>
      </div>
    </Link>
  );
}
