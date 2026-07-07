"use client";

import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SUPPORT_EMAIL_LINK } from "@/constants/urls";
import {
  createDedicatedEndpointFaqItems,
  type DedicatedEndpointFaqItem,
} from "../data/dedicatedEndpointFaq";

const mailtoSupport = `mailto:${SUPPORT_EMAIL_LINK}`;

type Props = {
  items?: DedicatedEndpointFaqItem[];
};

export default function DedicatedEndpointFaq({
  items = createDedicatedEndpointFaqItems(),
}: Props) {
  return (
    <section className="bg-[var(--gray-50)] px-[var(--spacing-layout-x)] pt-0 pb-[72px] md:pb-[96px] xl:px-[124px] lg:pb-[120px]">
      <div className="mx-auto flex w-full max-w-layout-content min-w-0 flex-col gap-10">
        <div className="flex w-full min-h-[33px] flex-col justify-end border-b border-[var(--border-strong)] pt-0 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-[2px] bg-[var(--brand-0)]"
              aria-hidden
            />
            <p className="font-mono-14 text-[var(--text-2)] uppercase">FAQ</p>
          </div>
        </div>

        <h2 className="w-full min-w-0 max-w-full font-miletus font-heading-h4 text-[var(--text-1)]">
          Frequently Asked Questions
        </h2>

        <div className="overflow-hidden rounded-[14px] border border-[var(--border-2)] bg-[var(--fill-white)] p-px shadow-[0px_1px_2px_0px_var(--alpha-dark-4)]">
          {items.map((item, index) => (
            <Collapsible
              key={item.id}
              defaultOpen={index === 0}
              className="border-b border-[var(--border-3)] last:border-b-0"
            >
              <CollapsibleTrigger className="flex w-full min-h-0 items-center justify-between gap-4 px-6 py-4 text-left font-paragraph-15-medium text-[var(--text-1)] outline-none transition-[color] hover:bg-[var(--fill-5)] focus-visible:ring-2 focus-visible:ring-[var(--brand-0)] focus-visible:ring-offset-2 [&[data-state=open]>svg]:rotate-180">
                <span className="min-w-0 flex-1 pr-2">{item.question}</span>
                <ChevronDown
                  className="size-4 shrink-0 text-[var(--text-3)] transition-transform duration-200"
                  strokeWidth={2}
                  aria-hidden
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden">
                <div className="max-w-[720px] px-6 pb-5 pt-0">
                  <p className="font-paragraph-15 text-[var(--text-3)]">
                    {item.answer}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <p className="text-center font-paragraph-12 leading-4 text-[var(--text-2)]">
          Still have questions?{" "}
          <a
            href={mailtoSupport}
            className="text-[var(--green-600)] underline-offset-2 hover:underline"
          >
            Contact support
          </a>
        </p>
      </div>
    </section>
  );
}
