import Image from "next/image";
import { cn } from "@/lib/utils";
import LinkWithAuthority from "@/app/components/LinkWithAuthority";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { NOVITA_URL } from "@/constants/urls";

const CATALOG_CHEVRON = "/dedicated-endpoint/model-catalog-chevron.svg";

const CATALOG_MODELS: readonly {
  modelId: string;
  name: string;
  org: string;
  tag: "reasoning" | "chat";
}[] = [
  {
    modelId: "deepseek/deepseek-r1-0528",
    name: "DeepSeek R1",
    org: "DeepSeek",
    tag: "reasoning",
  },
  {
    modelId: "deepseek/deepseek-v3-0324",
    name: "DeepSeek V3",
    org: "DeepSeek",
    tag: "chat",
  },
  {
    modelId: "meta-llama/llama-4-maverick-17b-128e-instruct-fp8",
    name: "Llama 4 Maverick",
    org: "Meta",
    tag: "chat",
  },
  {
    modelId: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    org: "Meta",
    tag: "chat",
  },
  {
    modelId: "qwen/qwen-2.5-72b-instruct",
    name: "Qwen2.5 72B",
    org: "Alibaba",
    tag: "chat",
  },
  {
    modelId: "qwen/qwen3-32b-fp8",
    name: "QwQ 32B",
    org: "Alibaba",
    tag: "reasoning",
  },
  {
    modelId: "mistralai/mistral-nemo",
    name: "Mistral Large",
    org: "Mistral AI",
    tag: "chat",
  },
  {
    modelId: "google/gemma-3-27b-it",
    name: "Gemma 3 27B",
    org: "Google",
    tag: "chat",
  },
  {
    modelId: "microsoft/phi-4",
    name: "Phi-4 14B",
    org: "Microsoft",
    tag: "chat",
  },
];

/** 卡片规格对齐 Figma 720:34302（Chat）、720:34288（Reasoning） */
function CatalogModelCard({
  modelId,
  name,
  org,
  tag,
}: (typeof CATALOG_MODELS)[number]) {
  const isReasoning = tag === "reasoning";
  const href = `${NOVITA_URL.MODEL_API_CONSOLE_LLM_DE}?modelId=${encodeURIComponent(
    modelId,
  )}`;

  return (
    <LinkWithAuthority
      href={href}
      loginRequired
      className={cn(
        "flex w-full min-h-[67px] items-center justify-between",
        "rounded-4 border border-[var(--border-1)] bg-[var(--fill-white)]",
        "px-[17px] py-[15px]",
        "transition-colors hover:border-[var(--border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-0)] focus-visible:ring-offset-2",
      )}
    >
      <div className="flex min-h-[36.5px] min-w-0 flex-1 items-center gap-3">
        <div
          className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden"
          aria-hidden
        >
          <ModelLogo modelName={name} size={32} className="object-contain" />
        </div>
        <div className="flex min-w-0 flex-col">
          <p className="line-clamp-1 font-paragraph-16 text-[var(--text-1)]">
            {name}
          </p>
          <p className="line-clamp-1 font-paragraph-13 text-[var(--text-3)]">
            {org}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-2",
          isReasoning ? "h-[21px]" : "h-[19px]",
        )}
      >
        {isReasoning ? (
          <span className="inline-flex h-[21px] min-w-0 items-center justify-center rounded-[4px] border border-[var(--brand-3)] bg-[var(--brand-3)] px-[6px] font-mono-12 uppercase text-[var(--brand-1)]">
            Reasoning
          </span>
        ) : (
          <span className="inline-flex h-[19px] min-w-0 items-center justify-center rounded-[4px] bg-[var(--fill-4)] px-[6px] font-mono-12 uppercase text-[var(--text-1)]">
            Chat
          </span>
        )}
        <Image
          src={CATALOG_CHEVRON}
          alt=""
          width={14}
          height={14}
          unoptimized
          className="size-3.5 shrink-0 object-contain"
          aria-hidden
        />
      </div>
    </LinkWithAuthority>
  );
}

export default function DedicatedEndpointModelCatalog() {
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
              Catalog
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-4 py-4">
          <h2 className="w-full min-w-0 font-miletus font-heading-h4 text-[var(--text-1)] md:whitespace-nowrap">
            Deploy Popular Open-Source Models
          </h2>
          <p className="max-w-[430px] font-paragraph-18 text-[var(--text-3)]">
            One-click deploy the most popular LLMs, or bring your own Hugging
            Face model.
          </p>
        </div>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
          {CATALOG_MODELS.map((model) => (
            <li key={model.name}>
              <CatalogModelCard {...model} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
