/**
 * GPU Bare Metal — main page body (between Hero and Footer).
 * Figma: Novita 2026 v5.0 — node 214-11372
 * https://www.figma.com/design/3nHa4z8enopB5YGSneFZlK/Novita-2026---v5.0重构?node-id=214-11372&m=dev
 *
 * Structure (6 blocks):
 *   M1  SectionHeader   — centered kicker + H2 + description
 *   M2  WorkloadSection — "The Right GPU for Every Workload" + 2 cards
 *   M3  WorkloadSection — "AI Inference" + 2 cards
 *   M4  WorkloadSection — "Rendering & Simulation" + 2 cards
 *   M5  WorkloadSection — "Scientific Computing" + 2 cards
 *   M6  WhyNovitaSection — kicker + H2 + 4 feature tiles
 */

import Image from "next/image";
import Button from "@/app/components/button/Button";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
import { BREVO_BOOK_LINK } from "@/constants/urls";

type GpuCardData = {
  title: string;
  subtitle: string;
  bullets: Array<{ text: string }>;
  badge: { label: string };
  backgroundImage: string;
  price?: string;
  cta?: {
    label: string;
    href: string;
  };
};

type WorkloadSectionData = {
  id: string;
  title: string;
  description: string;
  cards: [GpuCardData, GpuCardData];
};

type WhyNovitaFeature = {
  title: string;
  description: string;
  icon: string;
};

const CARD_BG = "/gpus/v5/gpu-card-bg.png";
const CONTACT_HREF = BREVO_BOOK_LINK;

function createWorkloadSections(): WorkloadSectionData[] {
  return [
    {
      id: "every-workload",
      title: "The Right GPU for Every Workload",
      description:
        "Four core AI scenarios, each matched with purpose-built bare-metal GPU configurations.",
      cards: [
        {
          title: "H100 SXM",
          subtitle: "8x NVIDIA H100 SXM per node",
          bullets: [
            { text: "80 GB HBM3 per GPU · 640 GB total" },
            { text: "NVLink 900 GB/s + RDMA" },
            { text: "1000+ GPU linear scaling" },
          ],
          badge: { label: "BEST VALUE" },
          backgroundImage: CARD_BG,
          price: "$1.70",
        },
        {
          title: "B200 SXM",
          subtitle: "8x NVIDIA B200 SXM per node",
          bullets: [
            { text: "192 GB HBM3e per GPU · 1,536 GB total" },
            { text: "NVLink 5th Gen 1.8 TB/s + RDMA" },
          ],
          badge: { label: "TOP PERFORMANCE" },
          backgroundImage: CARD_BG,
          price: "$4.77",
        },
      ],
    },
    {
      id: "ai-inference",
      title: "AI Inference",
      description:
        "LLM serving, real-time chat, multimodal generation, and agent inference at scale with low latency.",
      cards: [
        {
          title: "H200 SXM",
          subtitle: "8x NVIDIA H200 SXM per node",
          bullets: [
            { text: "141 GB HBM3e per GPU · 1,128 GB total" },
            { text: "NVLink 900 GB/s + RDMA" },
            { text: "1000+ GPU linear scaling" },
            { text: "KV cache-heavy workloads" },
          ],
          badge: { label: "LARGE CONTEXT" },
          backgroundImage: CARD_BG,
          cta: {
            label: "Contact us",
            href: CONTACT_HREF,
          },
        },
        {
          title: "RTX 5090",
          subtitle: "8x NVIDIA RTX 5090 per node",
          bullets: [
            { text: "32 GB GDDR7 per GPU · 256 GB total" },
            { text: "PCIe 5.0" },
            { text: "AIGC content generation" },
            { text: "Cost-efficient inference" },
          ],
          badge: { label: "COST EFFICIENT" },
          backgroundImage: CARD_BG,
          cta: {
            label: "Contact us",
            href: CONTACT_HREF,
          },
        },
      ],
    },
    {
      id: "rendering-simulation",
      title: "Rendering & Simulation",
      description:
        "3D rendering, cloud gaming, autonomous driving simulation, and digital twin environments.",
      cards: [
        {
          title: "RTX 5090",
          subtitle: "8x NVIDIA RTX 5090 per node",
          bullets: [
            { text: "32 GB GDDR7 per GPU · 256 GB total" },
            { text: "PCIe 5.0 · Latest Blackwell architecture" },
            { text: "Real-time ray tracing & DLSS 4" },
            { text: "Cloud gaming & content creation" },
          ],
          badge: { label: "NEXT GEN" },
          backgroundImage: CARD_BG,
          cta: {
            label: "Contact us",
            href: CONTACT_HREF,
          },
        },
        {
          title: "RTX 4090",
          subtitle: "8x NVIDIA RTX 4090 per node",
          bullets: [
            { text: "24 GB GDDR6X per GPU · 192 GB total" },
            { text: "PCIe 4.0 · Proven Ada Lovelace" },
            { text: "Broadest software compatibility" },
            { text: "Digital twins & simulation" },
          ],
          badge: { label: "BATTLE TESTED" },
          backgroundImage: CARD_BG,
          cta: {
            label: "Contact us",
            href: CONTACT_HREF,
          },
        },
      ],
    },
    {
      id: "scientific-computing",
      title: "Scientific Computing",
      description:
        "CPU-reducible dynamics, remote modeling, and molecular science with GPU-accelerated computation.",
      cards: [
        {
          title: "H100 SXM",
          subtitle: "8x NVIDIA H100 SXM per node",
          bullets: [
            { text: "80 GB HBM3 per GPU · 640 GB total" },
            { text: "NVLink 900 GB/s + RDMA" },
            { text: "FP64 double-precision for HPC" },
            { text: "MPI + NCCL multi-node scaling" },
          ],
          badge: { label: "HPC READY" },
          backgroundImage: CARD_BG,
          price: "$1.70",
        },
        {
          title: "H200 SXM",
          subtitle: "8x NVIDIA H200 SXM per node",
          bullets: [
            { text: "141 GB HBM3e per GPU · 1,128 GB total" },
            { text: "NVLink 900 GB/s + RDMA" },
            { text: "76% more HBM than H100" },
            { text: "Large-scale simulation & modeling" },
          ],
          badge: { label: "MAX MEMORY" },
          backgroundImage: CARD_BG,
          cta: {
            label: "Contact us",
            href: CONTACT_HREF,
          },
        },
      ],
    },
  ];
}

function createWhyNovitaFeatures(): WhyNovitaFeature[] {
  return [
    {
      title: "Zero Virtualization Overhead",
      description:
        "Direct physical GPU access eliminates hypervisor layers. Get 100% of the silicon performance with bare-metal allocation.",
      icon: "/gpus/v5/why-novita/icon1.png",
    },
    {
      title: "Ready-to-Run Environment",
      description:
        "Pre-configured with CUDA drivers, ML frameworks, and networking. Deploy training jobs in minutes, not days.",
      icon: "/gpus/v5/why-novita/icon2.png",
    },
    {
      title: "Guaranteed Delivery",
      description:
        "Reserved capacity with contractual SLAs. Your GPUs are physically allocated and always available — no spot interruptions.",
      icon: "/gpus/v5/why-novita/icon3.png",
    },
    {
      title: "Physically Isolated Infrastructure",
      description:
        "Dedicated servers with hardware-level isolation. Your data never shares memory, storage, or network paths with other tenants.",
      icon: "/gpus/v5/why-novita/icon4.png",
    },
  ];
}

// Figma node 235:13392 — flat rectangular tag, rounded-[2px], bg #e5e5e5 (--fill-3), mono-14 uppercase
function BadgeTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-[2px] bg-[var(--fill-3)] px-[var(--space-4)] pt-[6px] pb-[4px] font-mono-14 uppercase text-[var(--text-2)]">
      {label}
    </span>
  );
}

function SectionHeader() {
  return (
    <div className="mb-space-48">
      <SectionEyebrow label="SOLUTIONS" />
    </div>
  );
}

function GpuCard({ card }: { card: GpuCardData }) {
  const showCta = Boolean(card.cta);
  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-3)] shadow-1"
      style={{
        backgroundImage: `url('${card.backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 flex h-full flex-col p-space-24 md:p-space-32">
        <div className="flex min-w-0 flex-1 flex-col">
          <h4 className="font-miletus font-heading-h4 text-[var(--text-1)]">
            {card.title}
          </h4>
          <p className="mt-space-8 font-miletus font-paragraph-16 text-[var(--text-3)]">
            {card.subtitle}
          </p>
          <ul className="mt-space-20 flex flex-1 flex-col gap-space-12">
            {card.bullets.map((bullet) => (
              <li key={bullet.text} className="flex items-start gap-space-12">
                <Image
                  src="/gpus/v5/circle-check-bg.png"
                  alt=""
                  width={20}
                  height={20}
                  className="mt-px shrink-0"
                  aria-hidden
                />
                <span className="font-miletus font-paragraph-16 text-[var(--text-1)]">
                  {bullet.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-space-24 flex flex-wrap items-center justify-between gap-space-16 border-t border-[var(--border-default)] pt-space-24">
          {showCta ? (
            <Button
              type="secondary"
              height={44}
              renderTag="link"
              link={card.cta?.href ?? "#"}
              elAttrs={{ target: "_blank", rel: "noopener noreferrer" }}
              className="px-[var(--space-20)]"
            >
              {card.cta?.label}
            </Button>
          ) : (
            <p className="font-miletus text-[var(--text-1)]">
              <span className="font-heading-h5">{card.price}</span>
              <span className="ml-1 font-paragraph-16 text-[var(--text-3)]">
                /GPU/hr
              </span>
            </p>
          )}
          <BadgeTag label={card.badge.label} />
        </div>
      </div>
    </article>
  );
}

function WorkloadSection({ section }: { section: WorkloadSectionData }) {
  return (
    <div>
      <h3 className="font-miletus font-heading-h4 text-[var(--text-1)] max-w-[430px]">
        {section.title}
      </h3>
      <p className="mt-[var(--space-16)] font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[430px]">
        {section.description}
      </p>
      <div className="mt-space-48 grid grid-cols-1 items-stretch gap-[40px] lg:grid-cols-2">
        {section.cards.map((card) => (
          <GpuCard key={`${card.title}-${card.subtitle}`} card={card} />
        ))}
      </div>
    </div>
  );
}

// Figma node 235:14287 — "Why Us" section
function WhyNovitaSection() {
  const features = createWhyNovitaFeatures();

  return (
    <div className="mt-space-80 pt-space-80 border-t border-[var(--border-2)] flex flex-col gap-space-48">
      {/* Section Eyebrow — border-b per Figma "Section Eyebrow" component */}
      <div className="border-b border-[var(--border-strong)] pb-[var(--space-8)]">
        <div className="flex items-center gap-[var(--space-8)]">
          <span
            className="size-2 shrink-0 rounded-[2px] bg-[var(--brand-1)]"
            aria-hidden
          />
          <span className="font-mono-14 uppercase text-[var(--text-2)]">
            WHY NOVITA
          </span>
        </div>
      </div>

      {/* Heading — Heading/H4 (28px) + Paragraph/18 */}
      <div className="max-w-[430px] flex flex-col gap-[var(--space-16)]">
        <h2 className="font-miletus font-heading-h4 text-[var(--text-1)]">
          Purpose-Built for AI Workloads
        </h2>
        <p className="font-miletus font-paragraph-18 text-[var(--text-3)]">
          Every feature designed to maximize GPU performance and minimize
          operational overhead.
        </p>
      </div>

      {/* Feature tiles — 4 equal columns, gap 16px, beige bg */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feat) => (
          <div
            key={feat.title}
            className="flex flex-col gap-[var(--space-24)] bg-[var(--gray-2)] p-[var(--space-24)]"
          >
            {/* Icon container: 36×36 dark square, rounded-[2px], 24×24 icon inside */}
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-[var(--gray-800)]">
              <Image
                src={feat.icon}
                alt=""
                width={24}
                height={24}
                aria-hidden
              />
            </div>
            <h3 className="font-miletus font-heading-h5 text-[var(--text-1)]">
              {feat.title}
            </h3>
            <p className="font-miletus font-paragraph-18 text-[var(--text-3)]">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GpuBareMetalPageContent() {
  const workloadSections = createWorkloadSections();

  return (
    <section
      className="max_width_container mx-web w-full pb-space-120 pt-space-24"
      aria-label="Solutions"
    >
      <SectionHeader />
      <div className="flex flex-col gap-space-80">
        {workloadSections.map((section, index) => (
          <div key={section.id} className="flex flex-col gap-space-48">
            {index > 0 ? <SectionEyebrow label="SOLUTIONS" /> : null}
            <WorkloadSection section={section} />
          </div>
        ))}
      </div>
      <WhyNovitaSection />
    </section>
  );
}
