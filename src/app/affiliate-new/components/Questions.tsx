"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useI18nSubscription } from "@/i18n/provider";

interface FaqItem {
  title: string;
  answer: string[];
}

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load
// time instead of re-evaluating per render.
function getFaqList(): FaqItem[] {
  return [
    {
      title: "How does the Novita affiliate program work?",
      answer: [
        "Once you join the program, you'll get a unique affiliate link. When someone signs up and tops up credits through your link, you'll earn 10% commission on their credit spend for up to 180 days.",
      ],
    },
    {
      title:
        "Do I need a website or blog to be part of the Novita affiliate program?",
      answer: [
        "No, a website or blog isn't required. You can share your affiliate link through social media, newsletters, YouTube, online communities, or anywhere you engage with your audience.",
      ],
    },
    {
      title:
        "If a customer clicks my link but buys later without the link, do I still get commission?",
      answer: [
        "Yes. We use a 60-day cookie to track referrals. If a customer makes a purchase within those 60 days after visiting Novita AI, you'll still get a commission for that sale.",
      ],
    },
    {
      title: "When do I receive my rewards?",
      answer: [
        "Ongoing commissions are calculated based on your referrals' monthly usage during their first 180 days. Please note that commissions will only be paid out once your referred users collectively generate at least $50 in revenue for Novita AI.",
      ],
    },
    {
      title: "Where can I find Affiliate Terms of Service?",
      answer: [
        "The Novita Affiliate Terms of Service can be found on the sign-up page of the Novita Affiliate Program. After clicking on the 'Join now' button, you can access and review the terms of service before completing the sign-up process.",
      ],
    },
    {
      title: "Are there any restrictions on the affiliate program?",
      answer: [
        "Commissions are earned only on spending within the first 180 days after a user signs up. Self-referrals and any referral manipulation are strictly prohibited and may lead to account suspension. Commissions are also only valid for non-discounted credit top-ups. Any purchases made using coupons, discounts, or promotional codes are not eligible. Novita AI Baremetal products are excluded from the affiliate program.",
      ],
    },
    {
      title: "Have more questions?",
      answer: [
        "If you have more questions, you can reach out to us at iris.yang@novita.ai",
      ],
    },
  ];
}

export function Questions() {
  useI18nSubscription();
  const faqList = getFaqList();
  const [showMore, setShowMore] = useState<string>("");

  const toggleFaq = (title: string) => {
    setShowMore(showMore === title ? "" : title);
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large green circles */}
        <div className="absolute top-0 right-0 w-[847px] h-[836px] translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full border border-[var(--brand-1)] rounded-full opacity-20"></div>
        </div>
        <div className="absolute top-0 left-0 w-[847px] h-[862px] -translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full border border-[var(--brand-1)] rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max_width_container relative z-10">
        <div className="mx-web">
          <div className="flex justify-center">
            <div className="w-full space-y-8">
              {/* Main heading */}
              <h2 className="text-3xl lg:text-5xl font-semibold text-[var(--dark-1)] leading-[1em] tracking-[-2%] text-center">
                Frequently Asked Questions
              </h2>

              {/* FAQ Items */}
              <div className="w-full flex flex-col items-stretch space-y-6">
                {faqList.map((item: FaqItem, index: number) => (
                  <div
                    key={index}
                    className="w-full border border-[var(--gray-1)] rounded-lg"
                  >
                    {/* FAQ Title */}
                    <div
                      className={`bg-[var(--gray-3)] rounded-lg min-h-[68px] px-6 lg:px-8 py-4 flex justify-between items-center cursor-pointer transition-all duration-200 ${
                        showMore === item.title
                          ? "rounded-b-none border-b border-[var(--gray-1)]"
                          : ""
                      }`}
                      onClick={() => toggleFaq(item.title)}
                    >
                      <div className="text-[var(--dark-1)] font-semibold text-sm lg:text-base pr-4">
                        {item.title}
                      </div>
                      <ChevronDownIcon
                        className={`w-5 h-5 text-[var(--dark-1)] transition-transform duration-200 flex-shrink-0 ${
                          showMore === item.title ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* FAQ Content */}
                    {showMore === item.title && (
                      <div className="px-6 lg:px-8 py-6 text-[var(--dark-4)] flex flex-col items-start space-y-3">
                        {item.answer.map((ans: string, idx: number) => (
                          <div
                            key={idx}
                            className="text-sm lg:text-base leading-[1.6]"
                          >
                            {ans}
                          </div>
                        ))}
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
