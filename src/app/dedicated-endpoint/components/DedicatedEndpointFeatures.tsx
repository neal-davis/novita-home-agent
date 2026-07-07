import Image from "next/image";

/** Figma 735:35205 — Platform cards; assets in `public/dedicated-endpoint/platform/` */
const FEATURE_ICONS = [
  "/dedicated-endpoint/platform/icon1.png",
  "/dedicated-endpoint/platform/icon2.png",
  "/dedicated-endpoint/platform/icon3.png",
  "/dedicated-endpoint/platform/icon4.png",
  "/dedicated-endpoint/platform/icon5.png",
  "/dedicated-endpoint/platform/icon6.png",
] as const;

function createFeatureCards() {
  return [
    {
      title: "Blazing-Fast Inference",
      description:
        "Powered by optimized serving engines on NVIDIA H200, H100, and RTX 4090 GPUs. Sub-second latency for real-time applications.",
    },
    {
      title: "Dynamic Auto-Scaling",
      description:
        "Scale from 0 to N replicas automatically based on traffic. Set min/max replicas and scale-down delay to match your traffic patterns.",
    },
    {
      title: "LoRA Adapter Support",
      description:
        "Hot-swap LoRA adapters on running endpoints without restarts. Deploy multiple fine-tuned variants on a single base model.",
    },
    {
      title: "Flexible GPU Options",
      description:
        "Choose from NVIDIA H200, H100, and RTX 4090. Select tensor parallelism and GPU count to match your model requirements.",
    },
    {
      title: "Pay-Per-Hour Billing",
      description:
        "Billed by GPU-hour with per-second granularity. Scale to zero when idle — no minimum commitment, no idle GPU costs.",
    },
    {
      title: "Enterprise Support",
      description:
        "Dedicated technical support, custom SLAs, and priority access to new GPU types. Volume discounts for large deployments.",
    },
  ];
}

export default function DedicatedEndpointFeatures() {
  const featureCards = createFeatureCards();

  return (
    <section className="bg-[var(--gray-50)] px-[var(--spacing-layout-x)] pt-0 pb-[72px] md:pb-[96px] xl:px-[124px] lg:pb-[120px]">
      <div className="mx-auto flex w-full max-w-layout-content flex-col gap-10">
        <div className="flex w-full min-h-[33px] flex-col justify-end border-b border-[var(--border-strong)] pt-0 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-[2px] bg-[var(--brand-0)]"
              aria-hidden
            />
            <p className="font-mono-14 text-[var(--text-2)] uppercase">
              Platform
            </p>
          </div>
        </div>

        <div className="max-w-[430px]">
          <div className="flex flex-col gap-4">
            <h2 className="font-miletus font-heading-h4 text-[var(--text-1)]">
              Built for Production Workloads
            </h2>
            <p className="font-paragraph-18 text-[var(--text-3)]">
              Everything you need to deploy, scale, and manage AI inference in
              production.
            </p>
          </div>
        </div>

        <div className="border border-[var(--border-1)]">
          <div className="grid grid-cols-1 gap-px bg-[var(--border-1)] md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((card, index) => (
              <article
                key={card.title}
                className="flex min-h-0 min-w-0 flex-col items-start gap-6 bg-[var(--fill-white)] p-[var(--space-24)]"
              >
                <div
                  className="box-border flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[var(--fill-4)] px-[8.5px]"
                  aria-hidden
                >
                  <Image
                    src={FEATURE_ICONS[index]}
                    alt=""
                    width={17}
                    height={17}
                    className="size-[17px] shrink-0 object-contain"
                  />
                </div>
                <h3 className="w-full font-heading-h5 text-[var(--text-1)]">
                  {card.title}
                </h3>
                <p className="w-full max-w-[314px] font-paragraph-18 text-[var(--text-3)]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
