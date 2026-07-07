"use client";

import { cn } from "@/lib/utils";
import styles from "./DePage.module.scss";
import { ChevronRight, CircleCheck } from "lucide-react";
import Image from "next/image";
import { Button as UIButton } from "@/components/ui/button";
import AppButton from "@/app/components/button/Button";
import { DEProduct } from "@/app/dedicated-endpoint/components/imgDeComponent";
import { useEffect, useState } from "react";
import { enterpriseProductList } from "@/api/enterprise";
import { BREVO_BOOK_LINK, NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import LinkWithAuthority from "@/app/components/LinkWithAuthority";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
import BuyImageDeButton from "@/app/dedicated-endpoint/components/buyImageDe";
import { useDedicatedGpuPricing } from "@/hooks/useDedicatedGpuPricing";
import PricingMobileCard from "./PricingMobileCard";

export default function DePage({ isConsole = false }: { isConsole?: boolean }) {
  const [products, setProducts] = useState<Array<DEProduct>>([]);
  const {
    rows: llmDePrice,
    loading: llmDePriceLoading,
    loadingKeys: llmDeLoadingKeys,
  } = useDedicatedGpuPricing();

  useEffect(() => {
    enterpriseProductList().then((res) => {
      if (Array.isArray(res.productList)) {
        setProducts(res.productList);
      }
    });
  }, []);

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        className={cn(
          isConsole ? "w-full pl-space-16 pr-space-8" : "max_width_container",
          styles.container,
        )}
      >
        <div>
          {/* ── Article 1: LLM Dedicated Endpoints (v5 redesign) ── */}
          <article
            className={`flex flex-col ${isConsole ? "items-start" : "items-center"} pt-0 pb-0`}
          >
            <div className="w-full bg-white border border-[var(--gray-2)] rounded-6 p-space-16 flex flex-col gap-space-16 overflow-hidden">
              {/* Header: title + subtitle + features (with bottom border) */}
              <div className="flex flex-col gap-space-8 border-b border-[var(--border-1)] pb-space-24 pt-space-8 px-space-8">
                <h3 className="font-miletus text-paragraph-16-medium text-[var(--text-1)]">
                  Dedicated Endpoints
                </h3>
                <p className="font-miletus text-paragraph-16 text-[var(--text-3)]">
                  Deploy models on isolated GPUs with guaranteed performance.
                  Per-second billing, scale-to-zero support.
                </p>
                <div className="flex flex-wrap items-start gap-space-12 font-miletus text-paragraph-16 text-[var(--text-3)] md:gap-space-16">
                  <span className="flex min-w-0 items-center gap-space-8">
                    <CircleCheck className="w-[16px] h-[16px] shrink-0" />
                    Guaranteed performance (no sharing)
                  </span>
                  <span className="flex min-w-0 items-center gap-space-8">
                    <CircleCheck className="w-[16px] h-[16px] shrink-0" />
                    Support for custom models
                  </span>
                  <span className="flex min-w-0 items-center gap-space-8">
                    <CircleCheck className="w-[16px] h-[16px] shrink-0" />
                    {`Autoscaling & traffic spike handling`}
                  </span>
                </div>
              </div>

              {/* Pricing table */}
              <div className="flex flex-col gap-space-12 md:hidden">
                {llmDePriceLoading &&
                  llmDeLoadingKeys.map((key) => (
                    <PricingMobileCard
                      key={key}
                      title={
                        <div className="h-4 w-[160px] animate-pulse rounded-2 bg-fill-4" />
                      }
                      fields={[
                        {
                          label: "VRAM",
                          value: (
                            <div className="h-4 w-[56px] animate-pulse rounded-2 bg-fill-4" />
                          ),
                        },
                        {
                          label: "PRICE / GPU-HOUR",
                          value: (
                            <div className="h-4 w-[64px] animate-pulse rounded-2 bg-fill-4" />
                          ),
                        },
                      ]}
                    />
                  ))}
                {!llmDePriceLoading &&
                  llmDePrice.map((row) => (
                    <PricingMobileCard
                      key={row.displayName}
                      title={
                        <span className="inline-flex flex-wrap items-center gap-space-8">
                          {row.displayName}
                          {row.popular && (
                            <span className="rounded-4 bg-status-success-bg px-space-6 py-[2px] font-mono-11 text-[var(--text-1)]">
                              Popular
                            </span>
                          )}
                        </span>
                      }
                      fields={[
                        { label: "VRAM", value: row.vram },
                        {
                          label: "PRICE / GPU-HOUR",
                          value: row.pricePerHour,
                        },
                      ]}
                    />
                  ))}
              </div>
              <table className="hidden w-full border-collapse md:table">
                <thead>
                  <tr className="bg-[var(--gray-100)] h-[48px]">
                    <th className="px-space-12 py-space-8 text-left font-miletus text-paragraph-14 font-normal text-[var(--text-2)] w-[40%]">
                      GPU
                    </th>
                    <th className="px-space-12 py-space-8 text-left font-miletus text-paragraph-14 font-normal text-[var(--text-2)]">
                      VRAM
                    </th>
                    <th className="px-space-12 py-space-8 text-right font-miletus text-paragraph-14 font-normal text-[var(--text-2)]">
                      PRICE / GPU-HOUR
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {llmDePriceLoading &&
                    llmDeLoadingKeys.map((key) => (
                      <tr
                        key={key}
                        className="h-[48px] border-b border-[var(--gray-2)] bg-white"
                      >
                        <td className="px-space-12 py-space-12">
                          <div className="h-4 w-[160px] animate-pulse rounded-2 bg-fill-4" />
                        </td>
                        <td className="px-space-12 py-space-12">
                          <div className="h-4 w-[56px] animate-pulse rounded-2 bg-fill-4" />
                        </td>
                        <td className="px-space-12 py-space-12">
                          <div className="ml-auto h-4 w-[64px] animate-pulse rounded-2 bg-fill-4" />
                        </td>
                      </tr>
                    ))}
                  {!llmDePriceLoading &&
                    llmDePrice.map((row) => (
                      <tr
                        key={row.displayName}
                        className="h-[48px] border-y border-[var(--gray-2)] bg-white"
                      >
                        <td className="px-space-12 py-space-12 font-miletus text-paragraph-14 text-[var(--text-2)]">
                          <div className="flex items-center gap-space-12">
                            <span>{row.displayName}</span>
                            {row.popular && (
                              <span className="rounded-4 bg-status-success-bg px-space-6 py-[2px] font-mono-11 text-[var(--text-1)]">
                                Popular
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-space-12 py-space-12 font-miletus text-paragraph-14 text-[var(--text-2)]">
                          {row.vram}
                        </td>
                        <td className="px-space-12 py-space-12 text-right font-miletus text-paragraph-14 text-[var(--text-2)]">
                          {row.pricePerHour}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* Footer note */}
              <p className="font-miletus text-paragraph-16 text-[var(--text-3)]">
                Per-second billing on running replicas only. Scale to zero, pay
                zero.
              </p>

              {/* Actions */}
              <div className="flex items-center gap-space-12">
                <UIButton
                  asChild
                  className="h-[44px] font-miletus font-paragraph-15"
                >
                  <LinkWithAuthority
                    href={NOVITA_URL.MODEL_API_CONSOLE_LLM_DE}
                    id={
                      CLICK_BTN_IDs.PRICING_BTNS
                        .LLM_DEDICATED_ENDPOINT_CREATE_ENDPOINT
                    }
                    loginRequired
                  >
                    Create Endpoint
                  </LinkWithAuthority>
                </UIButton>
                <AppButton
                  type="text"
                  height={44}
                  renderTag="link"
                  link={BREVO_BOOK_LINK}
                  className="px-space-12 font-miletus gap-space-4"
                >
                  Contact Sales
                  <ChevronRight className="w-space-16 h-space-16" />
                </AppButton>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* ── Image Endpoints (v5 redesign) ── */}
      <div className={isConsole ? "mt-[58px]" : "mt-[66px]"}>
        <div
          className={cn(
            isConsole ? "w-full pl-space-16 pr-space-8" : "max_width_container",
          )}
        >
          <div>
            <div>
              {/* Heading group */}
              <div className="text-center">
                <SectionEyebrow label="SANDBOX CAPABILITIES" />
                <h2 className="mt-[40px] text-heading-h5 text-[var(--text-1)]">
                  Image Endpoints
                </h2>
                <p className="mt-space-8 text-paragraph-16 text-[var(--text-3)]">
                  Subscription plans for dedicated image generation endpoints.
                </p>
              </div>

              {products.length > 0 && (
                <div className="mt-[48px] flex flex-col lg:flex-row gap-[40px] max-w-[960px] mx-auto">
                  {products.map((product) => {
                    const isPro = product.name === "Pro";
                    const displayPrice = `$${Number(product.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

                    return (
                      <div
                        key={product.id}
                        className="flex-1 min-h-[480px] md:min-h-[560px] rounded-6 overflow-hidden relative"
                        style={
                          isPro
                            ? {
                                background:
                                  "linear-gradient(186.73deg, rgb(254,252,244) 2.5%, rgb(241,240,233) 94.3%)",
                              }
                            : {
                                background:
                                  "linear-gradient(186.73deg, rgb(254,253,250) 2.5%, rgb(245,244,239) 94.3%)",
                              }
                        }
                      >
                        {isPro && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            aria-hidden
                          >
                            <img
                              src="/pricing/v5/pricing-de-card-bg.png"
                              className="absolute right-0 top-0 h-full object-cover object-right"
                              alt=""
                            />
                          </div>
                        )}
                        <div className="relative flex h-full flex-col p-space-24 md:p-[40px]">
                          {/* Card header */}
                          <div>
                            <h3 className="text-heading-h5 text-[var(--text-1)]">
                              {product.name}
                            </h3>
                            <p className="mt-space-8 text-[14px] leading-[20px] tracking-[-0.15px] text-[var(--text-3)]">
                              Perfect for developers and startups scaling their
                              AI applications.
                            </p>
                          </div>

                          {/* Price */}
                          <div className="mt-space-24 text-[var(--text-1)]">
                            <span className="font-miletus text-[40px] leading-[48px] tracking-[-0.8px]">
                              {displayPrice}
                            </span>{" "}
                            <span className="font-miletus text-paragraph-18 text-[var(--text-3)]">
                              / month
                            </span>
                          </div>

                          {/* Feature list */}
                          <ul className="mt-space-24 flex flex-col gap-space-16 md:gap-space-24">
                            {product.detail.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-space-12 md:items-center md:gap-space-16"
                              >
                                <Image
                                  src="/gpus/v5/circle-check-bg.png"
                                  alt=""
                                  width={16}
                                  height={16}
                                  aria-hidden
                                  className="shrink-0"
                                />
                                <span className="font-miletus text-paragraph-16 text-element-high-em">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* Subscribe button */}
                          <div className="mt-auto pt-[36px]">
                            <BuyImageDeButton
                              product={product}
                              type={isPro ? "primary" : "secondary"}
                              height={44}
                              className="font-paragraph-15 px-space-24 w-fit"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
