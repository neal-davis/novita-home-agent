"use client";

import { X } from "lucide-react";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./index.module.scss";

interface RuleProps {
  onClose?: () => void;
}

export default function Rule({ onClose }: RuleProps) {
  return (
    <div className={styles.rule_container}>
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className={styles.close_button}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Title */}
      <h2 className={styles.title}>Terms of Service</h2>

      {/* Activity Terms Section */}
      <div className={styles.section}>
        <h3 className={styles.section_title}>Activity Terms</h3>
        <ol className={styles.ordered_list}>
          <li>
            Non-Refundable: Resource packages are non-refundable. Unused quotas
            do not qualify for refunds. We recommend selecting subscription
            plans and cycles based on your usage needs.
          </li>
          <li>
            Activation & Usage:
            <ol>
              <li>Packages activate immediately upon purchase.</li>
              <li>Usage is deducted from the resource package first.</li>
              <li>
                When package quota is exhausted, charges apply to your cash
                account.
              </li>
            </ol>
          </li>
          <li>
            Subscription Model:
            <ol>
              <li>
                Auto-renewing monthly subscription.
              </li>
              <li>Subscription can be canceled anytime.</li>
              <li>
                Validity: 1 calendar month from purchase date, expiring on the
                corresponding date of the following month.
              </li>
            </ol>
          </li>
          <li>Scope: Applicable to general API scenarios.</li>
          <li>
            Management: View package details in Console → Billing →
            Coding Plan.
          </li>
          <li>Agreement: Participation implies acceptance of Novita&apos;s.</li>
          <li>
            Interpretation: Novita reserves the right to interpret these terms
            within legally permissible limits.
          </li>
        </ol>
      </div>

      {/* Product Specifications Section */}
      <div className={styles.section}>
        <h3 className={styles.section_title}>Product Specifications</h3>
        <div className={styles.content}>
          <p className={styles.paragraph}>1. Scope & Calculation</p>
          <ul className={styles.bullet_list}>
            <li>
              Cross-Model Flexibility: Supports flexible deduction across models
              and billing items.
            </li>
            <li>
              Base Rate: DeepSeek V3.2 output price ($0.4/Mt) serves as the
              standard unit price.{" "}
              <a
                href={NOVITA_URL.PRICING}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                https://novita.ai/pricing
              </a>
            </li>
            <li>
              Deduction Coefficients: Adjusted based on model-specific
              input/output value differences. Formula
              <strong>: Deduction Amount = Actual Usage × Coefficient</strong>
            </li>
          </ul>
          <p className={styles.paragraph}>2. Billing Rules</p>
          <ul className={styles.bullet_list}>
            <li>
              Scope & Expiry: Ensure package validity and eligible models.
            </li>
            <li>
              Fallback Billing:
              <ul>
                <li>
                  Usage of non-specified models triggers pay-as-you-go billing.
                </li>
                <li>
                  Package exhaustion automatically switches to real-time
                  standard rates for the model used.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
