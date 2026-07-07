import type { ReactNode } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function createSteps() {
  return [
    {
      step: 1,
      sectionGap: "gap-[25px]",
      title: "Pick your model",
      description:
        "Search 50K+ models from Hugging Face, or paste your private repo URL.",
      models: [
        "OCR Models: PaddleOCR、GOT-OCR、...",
        "Reranker Models: BGE-Reranker、...",
        "LLM Models: DeepSeek、GLM、...",
      ] as const,
    },
    {
      step: 2,
      sectionGap: "gap-[13px]",
      title: "Choose your GPU",
      description:
        "See the recommended GPU for your model. Pick the one that fits your budget.",
      gpus: [
        { name: "RTX 4090 · $0.61/hr", selected: false },
        { name: "H100 · $1.99/hr", selected: true },
        { name: "H200 · $2.99/hr", selected: false },
      ] as const,
    },
    {
      step: 3,
      sectionGap: "gap-[35px]",
      title: "Deploy",
      description:
        "Your endpoint is live in minutes. OpenAI-compatible URL ready to use.",
    },
  ] as const;
}

const stepCardBase =
  "flex min-h-0 min-w-0 flex-col rounded-4 border border-[var(--border-1)] bg-[var(--fill-white)] p-[25px] shadow-[0px_1px_1px_rgba(15,23,42,0.04)]";

function StepIndex({ n }: { n: number }) {
  return (
    <div className="flex h-6 w-full shrink-0 items-center">
      <p className="whitespace-nowrap font-mono-14 text-[var(--element-mid-em)]">
        {String(n).padStart(3, "0")}
      </p>
    </div>
  );
}

function StepTitle({ children }: { children: ReactNode }) {
  return (
    <p className="shrink-0 whitespace-nowrap font-miletus font-heading-h5 text-[var(--text-1)]">
      {children}
    </p>
  );
}

function StepDescription({ children }: { children: ReactNode }) {
  return (
    <p className="w-full max-w-[358px] shrink-0 font-paragraph-18 text-[var(--element-mid-em)]">
      {children}
    </p>
  );
}

export default function DedicatedEndpointWorkflow() {
  const steps = createSteps();

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
              Workflow
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-start py-4">
          <div className="flex max-w-[430px] flex-col gap-4">
            <h2 className="whitespace-nowrap font-miletus font-heading-h4 text-[var(--text-1)]">
              Deploy in 3 Steps
            </h2>
            <p className="font-paragraph-18 text-[var(--text-3)]">
              Everything you need to deploy, scale, and manage AI inference in
              production.
            </p>
          </div>
        </div>

        {/* Figma 730:34782 — row gap 20px; cards rounded-4, border-1, p 25 */}
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Step 1 */}
          <div className={cn(stepCardBase, steps[0].sectionGap)}>
            <StepIndex n={steps[0].step} />
            <StepTitle>{steps[0].title}</StepTitle>
            <StepDescription>{steps[0].description}</StepDescription>
            <div className="flex w-full min-w-0 flex-col gap-3">
              <div className="flex h-9 w-full min-w-0 shrink-0 items-center gap-2 rounded-4 border border-[var(--border-1)] bg-[var(--fill-white)] px-[17px]">
                <Search
                  className="size-[14px] shrink-0 text-[var(--text-4)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="min-w-0 truncate font-mono-14 uppercase text-[var(--text-4)]">
                  Search models... e.g. Qwen2.5-7B
                </span>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-1">
                {steps[0].models.map((m) => (
                  <div
                    key={m}
                    className="flex min-h-[34.5px] w-full min-w-0 items-center justify-between rounded-8 px-3 py-2"
                  >
                    <span className="min-w-0 break-words font-mono-14 text-[var(--text-1)]">
                      {m}
                    </span>
                    <Plus
                      className="size-[13px] shrink-0 text-[var(--text-2)]"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={cn(stepCardBase, steps[1].sectionGap)}>
            <StepIndex n={steps[1].step} />
            <StepTitle>{steps[1].title}</StepTitle>
            <StepDescription>{steps[1].description}</StepDescription>
            <div className="flex w-full min-w-0 flex-col gap-4">
              <div className="flex flex-col gap-2">
                {steps[1].gpus.map((g) => (
                  <div
                    key={g.name}
                    className={cn(
                      "flex h-[41px] w-full min-w-0 shrink-0 items-center justify-between rounded-4 border px-[17px]",
                      g.selected
                        ? "border-[var(--brand-1)] bg-[var(--brand-3)]"
                        : "border-[var(--border-1)] bg-[var(--fill-white)]",
                    )}
                  >
                    <span className="min-w-0 truncate font-mono-14 uppercase text-[var(--text-1)]">
                      {g.name}
                    </span>
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                        g.selected
                          ? "border-[var(--brand-1)] bg-[var(--brand-1)]"
                          : "border-[var(--text-4)] bg-transparent",
                      )}
                      aria-hidden
                    >
                      {g.selected ? (
                        <span className="size-1.5 rounded-full bg-[var(--white)]" />
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex h-[46px] min-w-0 shrink-0 items-center justify-between rounded-4 border border-[var(--border-1)] bg-[var(--fill-white)] px-[17px]">
                <span className="shrink-0 font-mono-14 uppercase text-[var(--text-1)]">
                  Replicas
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-4 border border-[var(--border-1)] bg-[var(--fill-white)]"
                    aria-hidden
                  >
                    <Minus
                      className="size-[11px] text-[var(--text-2)]"
                      strokeWidth={1.5}
                    />
                  </span>
                  <span className="w-5 shrink-0 text-center font-mono-14 uppercase text-[var(--text-1)]">
                    1
                  </span>
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-4 border border-[var(--border-1)] bg-[var(--fill-white)]"
                    aria-hidden
                  >
                    <Plus
                      className="size-[11px] text-[var(--text-2)]"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 — Figma 730:34857 */}
          <div className={cn(stepCardBase, steps[2].sectionGap)}>
            <StepIndex n={steps[2].step} />
            <StepTitle>{steps[2].title}</StepTitle>
            <StepDescription>{steps[2].description}</StepDescription>
            <div className="w-full min-w-0">
              <div
                className="flex h-[98px] w-full min-w-0 flex-col overflow-hidden rounded-[10px] border border-[var(--fill-3)] bg-[var(--text-1)] p-px"
                role="presentation"
              >
                <div className="flex h-8 w-full shrink-0 items-center justify-between border-b border-[var(--alpha-light-20)] px-[14px] pb-[9px] pt-2">
                  <span className="font-mono-14 uppercase text-[var(--text-4)]">
                    Endpoint
                  </span>
                  <div className="flex h-[15px] shrink-0 items-center gap-1.5">
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-[var(--brand-0)]"
                      aria-hidden
                    />
                    <span className="text-[10px] font-normal leading-[15px] tracking-[0.12px] text-[var(--brand-0)]">
                      Live
                    </span>
                  </div>
                </div>
                <div className="flex h-[63.75px] shrink-0 flex-col items-start gap-0 px-[14px] pt-[14px]">
                  <div className="h-[17.875px] w-full shrink-0">
                    <p className="font-mono-14 uppercase text-[var(--text-3)] whitespace-nowrap">
                      POST
                    </p>
                  </div>
                  <div className="h-[17.875px] min-w-0 w-full shrink-0 overflow-hidden">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap font-mono-14 uppercase text-[var(--text-4)]">
                      api.example.com/v1/chat/completions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
