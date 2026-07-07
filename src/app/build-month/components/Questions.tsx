"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import styles from "./Questions.module.scss";
import { useI18nSubscription } from "@/i18n/provider";

interface FaqItem {
  title: string;
  answer: (string | React.ReactNode)[];
}

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load
// time instead of re-evaluating per render.
function getFaqList(): FaqItem[] {
  return [
    {
      title: "When does the Build Month sale end?",
      answer: ["The sale runs until December 31, 2025, at 11:59 PM PST."],
    },
    {
      title: "Which products participate in the sale?",
      answer: [
        <>
          Most Model APIs, GPU Instances, and Agent Sandbox runtimes are
          eligible for the 20% discount. Some newly released models or
          limited-availability GPUs may have different rates or may not
          participate. Check the{" "}
          <Link href="/pricing" className={styles.link}>
            Pricing Page
          </Link>{" "}
          for product-specific details.
        </>,
      ],
    },
    {
      title: "Is there a minimum purchase required?",
      answer: [
        "No. The discount applies to all eligible pay-as-you-go usage, with no minimum spend.",
      ],
    },
    {
      title: "How long does the discount last?",
      answer: [
        "The 20% discount applies to usage during the entire Build Month period.",
        "GPU Instance discounts apply only to the first instance you launch during the campaign period.",
        "That instance will continue receiving the discounted rate as long as it remains running.",
        "If the instance is stopped or terminated — or if you launch any additional instances — those future runs will be billed at the standard (non-discounted) price.",
      ],
    },
    {
      title: "Can I combine this discount with other promotions?",
      answer: [
        "No. This offer cannot be combined with other promotions or existing discounts. If multiple discounts are available for the same product, the lower rate will apply. (Good news — this is our best pricing of the year.)",
      ],
    },
    {
      title: "Is the discount applicable to subscriptions or spot instances?",
      answer: [
        "No. The 20% discount applies only to pay-as-you-go usage and does not apply to subscription-based or spot instance pricing.",
      ],
    },
    {
      title: "Are there any usage limits during the sale?",
      answer: [
        "No additional limits apply during the promotion. Standard usage quotas and rate limits remain the same. Enterprise customers may request higher limits through our sales team.",
      ],
    },
    {
      title: "What payment methods are accepted?",
      answer: [
        "We accept all major credit cards (Visa, MasterCard, and American Express). Enterprise clients may also request invoice billing.",
      ],
    },
    {
      title: "Do you offer refunds if I'm not satisfied?",
      answer: [
        "No. Pay-as-you-go usage is billed according to actual consumption and is non‑refundable.",
      ],
    },
  ];
}

export function Questions() {
  useI18nSubscription();
  const faqList = getFaqList();
  const [showMore, setShowMore] = useState<string>(faqList[0].title);

  const toggleFaq = (title: string) => {
    setShowMore(showMore === title ? "" : title);
  };

  return (
    <section className={`${styles.container} black-friday-questions-section`}>
      {/* Anchor point for scroll navigation with offset */}
      <div id="questions" className={styles.scroll_anchor} />

      {/* Content */}
      <div className={`max_width_container ${styles.content}`}>
        <div className="mx-web">
          <div className="flex justify-center">
            <div className="w-full space-y-8">
              {/* Main heading */}
              <h3 className={styles.heading}>Frequently Asked Questions</h3>
              <p className={styles.subtitle}>
                Everything you need to know about our Build Month
              </p>

              {/* FAQ Items */}
              <div className={styles.faqContainer}>
                {faqList.map((item: FaqItem, index: number) => (
                  <div key={index} className={styles.faqItem}>
                    {/* FAQ Title */}
                    <div
                      className={`${styles.faqTitle} ${
                        showMore === item.title ? styles.expanded : ""
                      }`}
                      onClick={() => toggleFaq(item.title)}
                    >
                      <div className={styles.faqTitleText}>{item.title}</div>
                      <ChevronDownIcon
                        className={`${styles.chevronIcon} ${
                          showMore === item.title ? styles.rotated : ""
                        }`}
                      />
                    </div>

                    {/* FAQ Content */}
                    {showMore === item.title && (
                      <div className={styles.faqContent}>
                        {item.answer.map(
                          (ans: string | React.ReactNode, idx: number) => (
                            <div key={idx} className={styles.faqAnswer}>
                              {ans}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
