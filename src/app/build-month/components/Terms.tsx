"use client";

import styles from "./Terms.module.scss";
import { useI18nSubscription } from "@/i18n/provider";

interface TermItem {
  title: string;
  content: string[] | { text?: string; items?: string[] }[];
}

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load
// time instead of re-evaluating per render.
function getTermsData(): TermItem[] {
  return [
    {
      title: "1. Eligibility & Scope",
      content: [
        "The 20% discount applies only to eligible pay-as-you-go products listed on the official Pricing Page.",
        "Subscription plans, spot instances, reserved clusters, and enterprise contract pricing are excluded unless explicitly stated.",
        "Partner or special-license models, newly released models, and premium or limited-edition GPU SKUs may be excluded or priced differently.",
      ],
    },
    {
      title: "2. GPU Instance Discount Rules",
      content: [
        "The GPU discount applies only to the first GPU instance launched under a billing account during the Promotion period.",
        "That first instance retains the discounted rate for as long as it remains running.",
        "Any additional instances—whether new, relaunched, or created after stopping/terminating an instance—are billed at standard pricing.",
        "Instance resize, region migration, or change of instance type is considered a new instance and does not retain promotional pricing.",
      ],
    },
    {
      title: "3. Usage Timing & Billing",
      content: [
        "Discounts apply only to usage incurred during the Promotion window.",
        "Usage occurring after 11:59 PM PST on December 31, 2025 will be billed at standard pricing, regardless of when the job or request was initiated.",
        "Multi-hour inference, generation, or streaming tasks receive promotional pricing only for the portion that occurs within the Promotion window.",
        "All usage is billed based on actual consumption and is non-refundable.",
        "A valid payment method must be maintained throughout the Promotion; failed or overdue payments may invalidate promotional pricing.",
      ],
    },
    {
      title: "4. Combining Discounts",
      content: [
        "This Promotion cannot be combined with any other coupons, credits, or promotional offers.",
        "If multiple discounts exist for the same product, the lower rate will apply.",
        "Discounts cannot be applied retroactively to past usage or invoices.",
      ],
    },
    {
      title: "5. Capacity, Availability & Changes",
      content: [
        "Promotional pricing does not guarantee availability of any specific model, SKU, or GPU type.",
        "Capacity may be limited or vary by region. Novita AI may redirect users to alternative SKUs or regions if resources are unavailable.",
        "Eligible products and discount rates are subject to change at any time without prior notice.",
      ],
    },
    {
      title: "6. Fair Use & Abuse Prevention",
      content: [
        {
          text: "Novita AI may restrict or revoke promotional pricing for accounts exhibiting abuse or abnormal activity, including but not limited to:",
          items: [
            "mass account creation",
            "automated attempts to exploit discounted capacity",
            "reselling or reallocating discounted resources",
            "behavior that threatens system stability or violates platform policies",
          ],
        },
        {
          text: "Related accounts (shared billing, payment methods, or organization ownership) may be treated as a single entity for discount eligibility.",
        },
      ],
    },
    {
      title: "7. Payment, Chargebacks & Disputes",
      content: [
        "Accounts with active chargebacks, unpaid balances, or unresolved billing disputes may lose access to promotional pricing.",
        "Promotional pricing will not be reinstated once removed.",
      ],
    },
    {
      title: "8. Modification or Suspension",
      content: [
        "Novita AI reserves the right to interpret, modify, or suspend the Promotion at any time for operational, financial, or security reasons, including capacity constraints or vendor pricing changes.",
      ],
    },
    {
      title: "9. Acceptance of Terms",
      content: [
        "Participation in this Promotion constitutes acceptance of these Terms & Restrictions and all associated platform policies.",
      ],
    },
  ];
}

const TermSection = ({ item }: { item: TermItem }) => {
  const hasNestedContent = item.content.some(
    (c) => typeof c === "object" && ("text" in c || "items" in c),
  );

  if (hasNestedContent) {
    return (
      <div className={styles.section_item}>
        <h3 className={styles.section_title}>{item.title}</h3>
        <ul className={styles.list}>
          {item.content.map((content, idx) => {
            if (typeof content === "string") {
              return <li key={idx}>{content}</li>;
            }
            return (
              <li key={idx}>
                {content.text && (
                  <div className={styles.introText}>{content.text}</div>
                )}
                {content.items && (
                  <ul className={styles.bulletList}>
                    {content.items.map((listItem, listIdx) => (
                      <li key={listIdx}>{listItem}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const isSingleParagraph = item.content.length === 1;

  return (
    <div className={styles.section_item}>
      <h3 className={styles.section_title}>{item.title}</h3>
      {isSingleParagraph ? (
        <p>{item.content[0] as string}</p>
      ) : (
        <ul className={styles.list}>
          {item.content.map((listItem, idx) => (
            <li key={idx}>{listItem as string}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export function Terms() {
  useI18nSubscription();
  const TERMS_DATA = getTermsData();
  return (
    <section className={styles.terms_container}>
      <div className={`max_width_container ${styles.content}`}>
        <div className="mx-web">
          <div className={styles.contentWrapper}>
            <h3 className={styles.heading}>Terms & Restrictions</h3>

            <div className={styles.termsContent}>
              <div className={styles.termsInner}>
                <p>
                  The Build Month promotion (&quot;Promotion&quot;) is valid
                  from November 24, 2025 through December 31, 2025, at 11:59 PM
                  PST. By participating, you agree to the following terms:
                </p>

                {TERMS_DATA.map((item, index) => (
                  <TermSection key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
