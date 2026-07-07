import React from "react";
import Link from "next/link";
import { SUPPORT_EMAIL_LINK } from "@/constants/urls";
import styles from "./FAQ.module.scss";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How much can I earn in vouchers?",
    answer:
      "Each user can earn up to a total of $500 in vouchers through our referral program.",
  },
  {
    question: "What can the vouchers be used for?",
    answer: "These vouchers are exclusively redeemable for all LLM APIs.",
  },
  {
    question: "Do the vouchers expire?",
    answer: "Yes. Each new voucher expires 90 days from the date it is issued.",
  },
];

const faqData2: FAQItem[] = [
  {
    question: "How do I use the voucher?",
    answer:
      "Your voucher is immediately available for use on LLM APIs—no need to top up your balance or apply a voucher code. Simply start making calls to the LLM APIs.",
  },
];

const FAQ: React.FC = () => {
  return (
    <div className="max_width_container">
      <div className={`${styles.faq} mx-web`}>
        <h3>FAQ</h3>
        <main>
          {faqData.map((item, index) => (
            <div className={styles.faq_item} key={index}>
              <p className={styles.question}>{item.question}</p>
              <p className={styles.answer}>{item.answer}</p>
            </div>
          ))}
          <div className={styles.faq_item}>
            <p className={styles.question}>
              Are there any usage limits with the vouchers?
            </p>
            <p className={styles.answer}>
              API calls made using voucher credits may operate under lower rate
              limits, depending on demand. For higher limits, please contact us
              at{" "}
              <Link
                href={`mailto:${SUPPORT_EMAIL_LINK}`}
                target="_blank"
                className={styles.link}
              >
                support@novita.ai
              </Link>
              .
            </p>
          </div>
          {faqData2.map((item, index) => (
            <div className={styles.faq_item} key={`2-${index}`}>
              <p className={styles.question}>{item.question}</p>
              <p className={styles.answer}>{item.answer}</p>
            </div>
          ))}

          <p className={styles.note}>
            Note: Vouchers are non-transferable, cannot be used to top up a
            user’s balance on Novita, and cannot be redeemed for cash.
            Additional terms may apply, and Novita AI reserves the right to
            modify or discontinue this offer at any time.
          </p>
        </main>
      </div>
    </div>
  );
};

export default FAQ;
