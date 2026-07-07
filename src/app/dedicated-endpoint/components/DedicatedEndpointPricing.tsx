import { ArrowRight, Star } from "lucide-react";
import { BREVO_BOOK_LINK } from "@/constants/urls";

const GPU_PRICING_ROWS = [
  {
    gpu: "NVIDIA H200 SXM",
    vram: "141 GB",
    price: "2.99",
    popular: true,
  },
  {
    gpu: "NVIDIA H100 SXM",
    vram: "80 GB",
    price: "1.99",
  },
  {
    gpu: "NVIDIA RTX 4090",
    vram: "24 GB",
    price: "0.61",
  },
] as const;

export default function DedicatedEndpointPricing() {
  return (
    <section className="bg-[var(--gray-50)] px-[var(--spacing-layout-x)] pt-0 pb-[72px] md:pb-[96px] xl:px-[124px] lg:pb-[120px]">
      <div className="mx-auto flex w-full max-w-layout-content min-w-0 flex-col gap-10">
        <div className="flex w-full min-h-[33px] flex-col justify-end border-b border-[var(--border-strong)] pt-0 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-[2px] bg-[var(--brand-0)]"
              aria-hidden
            />
            <p className="font-mono-14 text-[var(--text-2)] uppercase">
              Pricing
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-start">
          <div className="flex w-full max-w-[430px] flex-col">
            <h2 className="font-miletus font-heading-h4 text-[var(--text-1)] md:whitespace-nowrap">
              Transparent GPU Pricing
            </h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-4 border border-[var(--border-1)] bg-[var(--fill-white)] shadow-[0px_1px_1px_rgba(15,23,42,0.04)]">
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="h-11 border-b border-[var(--border-2)] bg-[var(--fill-4)]">
                  <th
                    className="px-6 py-3 text-left align-middle font-paragraph-14 text-[var(--text-3)]"
                    scope="col"
                  >
                    GPU
                  </th>
                  <th
                    className="px-6 py-3 text-right align-middle font-paragraph-14 text-[var(--text-3)]"
                    scope="col"
                  >
                    VRAM
                  </th>
                  <th
                    className="px-6 py-3 text-right align-middle font-paragraph-14 text-[var(--text-3)]"
                    scope="col"
                  >
                    Price / GPU-hour
                  </th>
                </tr>
              </thead>
              <tbody>
                {GPU_PRICING_ROWS.map((row) => (
                  <tr
                    key={row.gpu}
                    className="border-b border-[var(--border-1)] last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                        <span className="font-paragraph-14 text-[var(--text-1)]">
                          {row.gpu}
                        </span>
                        {"popular" in row && row.popular ? (
                          <span className="inline-flex h-5 items-center gap-1 rounded-4 border border-solid border-[var(--brand-1)] bg-[var(--brand-3)] pl-[6px] pr-2 font-mono-10 text-[10px] font-normal uppercase leading-[14.286px] tracking-[1.1172px] text-[var(--brand-1)]">
                            <Star
                              className="size-[10px] shrink-0 text-[var(--brand-1)]"
                              strokeWidth={1.5}
                              fill="none"
                              aria-hidden
                            />
                            Popular
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-paragraph-14 text-[var(--text-2)]">
                      {row.vram}
                    </td>
                    <td className="px-6 py-4 text-right font-paragraph-14">
                      <span className="text-[var(--text-2)]">$</span>
                      <span className="text-[var(--text-2)]">{row.price}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col justify-center gap-4 border-t border-[var(--border-1)] bg-[var(--fill-4)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-paragraph-14 text-[var(--text-2)]">
              Need reserved capacity or custom pricing?
            </p>
            <a
              href={BREVO_BOOK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 self-start font-mono-14 uppercase text-[var(--brand-1)] sm:self-auto"
            >
              Talk to our team
              <ArrowRight
                className="size-[13px] shrink-0"
                strokeWidth={1.5}
                aria-hidden
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
