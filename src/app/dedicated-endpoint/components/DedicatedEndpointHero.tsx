import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Button from "@/app/components/button/Button";
import { LayoutSafeRail } from "@/app/components/layout/LayoutSafeRail";
import { NOVITA_URL } from "@/constants/urls";
import DedicatedEndpointGpuBudgetList from "./DedicatedEndpointGpuBudgetList";

const CARD_ICON_SRC = [
  "/dedicated-endpoint/desc-card/icon1.png",
  "/dedicated-endpoint/desc-card/icon2.png",
  "/dedicated-endpoint/desc-card/icon3.png",
] as const;

const DESC_CARD_ICON_SRC = [
  "/dedicated-endpoint/desc-card/icon4.png",
  "/dedicated-endpoint/desc-card/icon5.png",
  "/dedicated-endpoint/desc-card/icon6.png",
] as const;

const DEPLOYMENT_CARD_ICON_SRC = [
  "/dedicated-endpoint/deployment/icon1.png",
  "/dedicated-endpoint/deployment/icon2.png",
] as const;

const DEPLOYMENT_BULLET_ICON_SRC = "/dedicated-endpoint/deployment/icon3.png";

function createValueCards() {
  return [
    {
      title: "Pay only for what's running",
      description:
        "Per-second billing on active replicas. Scale to zero, pay zero. No charges for idle endpoints, no minimum commitments.",
      detail: (
        <div className="overflow-hidden rounded-[4px] border border-[var(--border-default)] bg-[var(--gray-25,#fafafa)]">
          <div className="flex h-[36px] items-center gap-[var(--space-12)] border-b border-[var(--border-2,#e5e5e5)] bg-[var(--fill-white)] px-[var(--space-16)]">
            <div className="flex items-center gap-[4px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[var(--border-2,#e5e5e5)]" />
              <span className="h-[8px] w-[8px] rounded-full bg-[var(--border-2,#e5e5e5)]" />
              <span className="h-[8px] w-[8px] rounded-full bg-[var(--border-2,#e5e5e5)]" />
            </div>
            <p className="font-mono-12 uppercase text-[var(--text-3)]">
              Billing preview
            </p>
          </div>
          <div className="flex flex-col gap-[var(--space-8)] px-[var(--space-16)] py-[var(--space-16)]">
            <p className="font-mono-12 uppercase text-[var(--text-3)]">
              3 replicas 4090 × 2h 15m 42s running
            </p>
            <p className="font-mono-12 uppercase text-[var(--text-3)]">
              = 3 × <span className="text-[var(--text-1)]">8,142s</span> ×{" "}
              <span className="text-[var(--text-1)]">$0.000608/s</span>
            </p>
            <div className="mt-[var(--space-1)] border-t border-[var(--border-2,#e5e5e5)] pt-[var(--space-8)]">
              <p className="font-mono-12 uppercase text-[var(--brand-1)]">
                = $14.85
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "GPUs for every budget",
      description:
        "Not every workload needs an H200. Choose from RTX 4090, RTX 5090, H100 — match the GPU to your model size and your budget.",
      detail: <DedicatedEndpointGpuBudgetList />,
    },
    {
      title: "Inference breaks? That's on us.",
      description:
        "OOM, CUDA errors, model loading failures — our team diagnoses and resolves. You get a clear explanation, not a cryptic stack trace.",
      detail: (
        <div className="flex flex-col gap-[var(--space-16)]">
          {[
            "Report via console or email",
            "Our team investigates root cause",
            "You get diagnosis + resolution",
          ].map((item, index) => (
            <div key={item} className="flex h-[24px] items-center gap-[10px]">
              <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[4px] border border-[var(--border-default)] bg-[var(--gray-25,#fafafa)]">
                <Image
                  src={DESC_CARD_ICON_SRC[index]}
                  alt=""
                  width={12}
                  height={12}
                  className="h-[12px] w-[12px] object-contain"
                />
              </span>
              <p className="font-mono-14 uppercase text-[var(--text-1)]">
                {item}
              </p>
            </div>
          ))}
        </div>
      ),
    },
  ];
}

function createDeploymentComparison() {
  return [
    {
      title: "Serverless Endpoints",
      icon: DEPLOYMENT_CARD_ICON_SRC[0],
      bulletIcon: DEPLOYMENT_BULLET_ICON_SRC,
      items: [
        "Pay per token",
        "600+ models available",
        "Zero infrastructure management",
        "Auto-scaling included",
        "Best for variable workloads",
      ],
      highlighted: false,
    },
    {
      title: "Dedicated Endpoints",
      icon: DEPLOYMENT_CARD_ICON_SRC[1],
      bulletIcon: DEPLOYMENT_BULLET_ICON_SRC,
      items: [
        "Isolated GPU resources",
        "Guaranteed latency SLA",
        "Custom models & LoRA adapters",
        "Scale-to-zero support",
        "Best for predictable, high-throughput workloads",
      ],
      highlighted: true,
    },
  ] as const;
}

// Hero 区高度/顶距：viewport 比例 + clamp 上下限；背景层随该区域 min-height 铺满（含内容增高）
const DEDICATED_HERO_MIN_H = "clamp(35rem, 70svh, 51.25rem)";
const DEDICATED_HERO_PT_SAFE = "calc(env(safe-area-inset-top, 0px) + 215px)";

export default function DedicatedEndpointHero() {
  const valueCards = createValueCards();
  const deploymentComparison = createDeploymentComparison();

  return (
    <section className="relative overflow-hidden bg-[var(--gray-50)]">
      <div
        className="relative flex w-full min-w-0 flex-col"
        style={{ minHeight: DEDICATED_HERO_MIN_H }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 right-0"
          style={{
            paddingLeft: "env(safe-area-inset-left, 0px)",
            paddingRight: "env(safe-area-inset-right, 0px)",
          }}
          aria-hidden
        >
          <div className="relative h-full min-h-0 w-full">
            <Image
              src="/dedicated-endpoint/hero-bg.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 md:h-10 lg:h-52"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, var(--gray-50))",
              }}
              aria-hidden
            />
          </div>
        </div>

        <LayoutSafeRail
          className="relative z-10 flex flex-1 flex-col items-start"
          style={{
            paddingTop: DEDICATED_HERO_PT_SAFE,
            paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex w-full max-w-[737px] flex-col items-start gap-[40px]">
            <div className="flex w-full flex-col items-start gap-[24px] px-[2px]">
              <div className="flex items-center gap-[var(--space-8)]">
                <span
                  className="h-2 w-2 rounded-[2px] bg-[var(--brand-0)]"
                  aria-hidden
                />
                <span className="font-mono-13 uppercase text-[var(--dark-2)]">
                  DEDICATED ENDPOINT
                </span>
              </div>

              <h1 className="w-full font-miletus font-display-md text-[var(--text-1)]">
                Run Your Models,
                <br />
                We Handle the Rest
              </h1>
              <p className="w-full max-w-[400px] font-miletus font-paragraph-18 text-[var(--text-3)]">
                Deploy models on dedicated GPUs. Per-second billing on running
                replicas only, affordable GPU options starting at $0.61/hr, and
                inference issues are on us.
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-[var(--space-12)]">
              <Button
                type="primary"
                height={40}
                renderTag="link"
                link={NOVITA_URL.MODEL_API_CONSOLE_LLM_DE}
                className="!rounded-[var(--radius-full)] !bg-[var(--gray-950)] !px-[var(--space-20)] !text-[var(--white)] font-paragraph-15 shadow-[0px_1px_3px_0px_var(--alpha-dark-10),inset_0px_2px_0px_0px_var(--alpha-light-20)] hover:!bg-[var(--gray-800)]"
              >
                Start Deploying
              </Button>
              <Button
                type="text"
                height={44}
                renderTag="link"
                link={NOVITA_URL.MODEL_API_PRICING_ENTERPRISE}
                className="!rounded-[var(--radius-full)] !px-[var(--space-20)] !no-underline font-paragraph-15 text-[var(--gray-800)] flex items-center gap-[var(--space-4)]"
              >
                See Price
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </LayoutSafeRail>
      </div>

      <div className="relative z-10 mt-space-48 px-[var(--spacing-layout-x)] pb-[72px] md:mt-space-48 md:pb-[96px] xl:px-[124px] lg:mt-space-48 lg:pb-[120px]">
        <div className="mx-auto grid max-w-layout-content gap-[var(--space-20)] lg:grid-cols-3 lg:gap-[var(--space-24)]">
          {valueCards.map((card, index) => (
            <article
              key={card.title}
              className="flex min-h-[369px] flex-col rounded-[4px] border border-[var(--border-default)] bg-[var(--fill-white)] px-[var(--space-24)] py-[var(--space-24)] shadow-[0px_4px_16px_0px_var(--alpha-dark-6)]"
            >
              <div>
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[4px] bg-[var(--fill-4)]">
                  <Image
                    src={CARD_ICON_SRC[index]}
                    alt=""
                    width={17}
                    height={17}
                    aria-hidden
                  />
                </div>
                <h2 className="mt-[var(--space-16)] font-miletus font-heading-h5 text-[var(--text-1)]">
                  {card.title}
                </h2>
                <p className="mt-[var(--space-12)] font-paragraph-14 text-[var(--text-3)]">
                  {card.description}
                </p>
              </div>
              <div className="mt-auto pt-[var(--space-20)]">{card.detail}</div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-[var(--space-48)] flex max-w-layout-content flex-col pb-[var(--space-16)] pt-[var(--space-24)]">
          <div className="border-b border-[var(--border-strong)] pb-[var(--space-8)]">
            <div className="flex items-center gap-[var(--space-8)]">
              <span className="h-[8px] w-[8px] rounded-[2px] bg-[var(--brand-1)]" />
              <p className="font-mono-14 uppercase text-[var(--text-2)]">
                Deployment options
              </p>
            </div>
          </div>

          <div className="py-[var(--space-24)]">
            <div className="max-w-[474px] py-[var(--space-16)]">
              <h2 className="font-miletus font-heading-h4 text-[var(--text-1)]">
                Serverless vs Dedicated
              </h2>
              <p className="mt-[var(--space-16)] font-paragraph-18 text-[var(--text-3)]">
                Choose the right deployment model for your workload
              </p>
            </div>

            <div className="relative mt-[33px] grid gap-[var(--space-24)] lg:grid-cols-2">
              {deploymentComparison.map((card) => (
                <article
                  key={card.title}
                  className={[
                    "relative flex h-full min-h-[279px] flex-col gap-[var(--space-20)] rounded-[6px] bg-[var(--fill-white)] px-[29px] pb-px pt-[29px] shadow-[0px_1px_1px_0px_var(--alpha-dark-4)]",
                    card.highlighted
                      ? "border-2 border-[var(--border-brand)]"
                      : "border border-[var(--border-default)]",
                  ].join(" ")}
                >
                  {card.highlighted ? (
                    <div className="absolute right-[12px] top-[-14px] inline-flex min-h-[36px] items-center justify-center rounded-[999px] bg-[linear-gradient(90deg,#00BC7D_0%,#009689_100%)] px-[12px] py-[6px] shadow-[0px_4px_6px_0px_rgba(0,188,125,0.3),0px_2px_4px_0px_rgba(0,188,125,0.3)]">
                      <span className="text-[12px] font-semibold uppercase leading-[14px] tracking-[0.6px] text-[var(--white)]">
                        Recommended for production
                      </span>
                    </div>
                  ) : null}

                  <div className="flex h-[32px] items-center justify-between">
                    <div className="flex items-center gap-[8px]">
                      <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] bg-[var(--fill-4)]">
                        <Image
                          src={card.icon}
                          alt=""
                          width={15}
                          height={15}
                          className="h-[15px] w-[15px] object-contain"
                        />
                      </div>
                      <h3 className="font-paragraph-16 text-[var(--text-1)]">
                        {card.title}
                      </h3>
                    </div>
                  </div>

                  <div className="h-px w-full bg-[var(--fill-4)]" />

                  <ul className="flex h-[148px] flex-col gap-[var(--space-12)]">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-center gap-[10px]">
                        <Image
                          src={card.bulletIcon}
                          alt=""
                          width={16}
                          height={16}
                          className="h-[16px] w-[16px] shrink-0 object-contain"
                        />
                        <span className="font-paragraph-15 text-[var(--text-2)]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
