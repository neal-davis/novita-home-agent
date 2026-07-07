/* eslint-disable react/no-unescaped-entities */

import styles from "../common.module.scss";

export default function Page() {
  return (
    <div>
      <h1 className={styles.h1}>
        Novita AI Dedicated Endpoints Service Level Agreement
      </h1>
      <p className={styles.update_date}>Policy date: May 7, 2024</p>
      <p className={styles.p}>
        Capitalized terms not defined in this Novita AI Dedicated Endpoints
        Service Level Agreement ("Terms") have the meanings set forth in the
        Dedicated Endpoints Agreement, between Novita AI and Customer.
      </p>

      <h2 className={`${styles.h2} ${styles.h2_big_space}`}>1. DEFINITIONS</h2>
      <p className={styles.p}>
        1.1. "Outage Period" is the number of downtime minutes resulting from an
        Unscheduled Service Outage.
      </p>
      <p className={styles.p}>
        1.2. "Scheduled Availability" means the total number of minutes in the
        current monthly billing period, minus any Customer Planned Downtime.
      </p>
      <p className={styles.p}>
        1.3. "Service Levels" means the service level commitments set forth in
        Section 2 of these Terms, and any other standards that Novita AI chooses
        to adhere to and by which it measures the level of service provided to
        Customer.
      </p>
      <p className={styles.p}>
        1.4. "Task" refers to the image, audio, video, or LLM generation tasks
        submitted by the Customer through the Novita AI Dedicated Endpoints Plan
        Service.
      </p>
      <div className={styles.p}>
        1.5. "Unscheduled Service Outage" means an interruption to the Service
        that was not previously communicated to Customer, and results in the
        failure of the Customer’s Task. Unscheduled Service Outages exclude any:
        <ul className={`${styles.ul} ${styles.no_list_style}`}>
          <li>(i) Customer Planned Downtime; and/or </li>
          <li>
            (ii) any downtime caused by an SLA exclusion listed in Section 3.1
            below.
          </li>
        </ul>
      </div>

      <h2 className={`${styles.h2} ${styles.h2_big_space}`}>
        2. SERVICE LEVEL COMMITMENT
      </h2>
      <p className={styles.p}>
        2.1. For Standard Dedicated Endpoints, the API service will serve
        Customer Tasks 98% of the time. For Pro Dedicated Endpoints, the API
        service will serve Customer Tasks 99.5% of the time.
      </p>
      <p className={styles.p}>
        2.2. Penalties. If the Service fails to meet the above service level
        commitments, Customer will receive a Refund Coupon from Novita AI as
        set-forth in Section 4 of these Terms (the "Refund Coupon").
      </p>

      <h2 className={`${styles.h2} ${styles.h2_big_space}`}>
        3. SLA EXCLUSIONS
      </h2>
      <p className={styles.p}>
        3.1. This SLA does not apply to any performance or availability issues:
      </p>
      <ul className={`${styles.ul} ${styles.no_list_style}`}>
        <li>
          (a) Due to events outside of Novita AI’s control, including but not
          limited to, Issues caused solely by:
          <ul className={`${styles.ul} ${styles.no_list_style}`}>
            <li>
              (i) Customer’s or its End Users’ hardware, software or
              connectivity issues;
            </li>
            <li>
              (ii) Customer’s Task contains illegal parameters which will lead
              to failure;
            </li>
            <li>
              (iii) acts or omissions of Customer, its employees, agents,
              contractors, or vendors;
            </li>
            <li>
              (iv) a third party gaining access to the Service by means of
              Customer’s Authorized Users’ accounts or equipment;{" "}
            </li>
          </ul>
        </li>
        <li>
          (b) Caused by Customer’s continued use of the Service after Novita AI
          has advised Customer to modify such use, if Customer did not modify
          its use as advised;
        </li>
        <li>
          (c) Occurring during beta and trial services, unless otherwise agreed
          to in writing by Novita AI.
        </li>
      </ul>

      <h2 className={`${styles.h2} ${styles.h2_big_space}`}>
        4. REFUND COUPON
      </h2>
      <p className={styles.p}>
        4.1. The amount and method of calculation of Refund Coupon Value is
        described below in Section 5.
      </p>
      <p className={styles.p}>
        4.2. Refund Coupon is Customer’s sole and exclusive remedy for any
        violation of the Service Levels.
      </p>
      <p className={styles.p}>
        4.3. The maximum Refund Coupon Value granted in any monthly billing
        period shall not exceed the Customer’s total Monthly Fees paid to Novita
        AI during that same period, under any circumstances.
      </p>
      <p className={styles.p}>
        4.4. Refund Coupon for this SLA will only be calculated against
        Customer’s fixed Monthly Fees.
      </p>

      <h2 className={`${styles.h2} ${styles.h2_big_space}`}>
        5. REFUND COUPON CALCULATION
      </h2>
      <p className={styles.p}>
        5.1. For any and each Outage Period experienced by Customer during a
        monthly billing period, Novita AI will provide a Refound Coupon
        calculated in accordance with the formula below that is applicable to
        the Customer’s success package:
      </p>
      <img
        src="/legal/refund_coupon.jpg"
        alt="refund coupon"
        style={{ height: 52, opacity: 0.85 }}
      />

      <h2 className={`${styles.h2} ${styles.h2_big_space}`}>6. METHODOLOGY</h2>
      <p className={styles.p}>
        6.1. Novita AI is not responsible for the comprehensive monitoring of
        Customer Tasks, and such responsibility lies with Customer. Novita AI
        will review and consider all supporting data on a reported Unscheduled
        Service Outage, provided to it by Customer provided that such data was
        obtained using a commercially reasonable independent measurement system
        used by Customer.
      </p>
      <p className={styles.p}>
        6.2. Novita AI will use all information reasonably available to it in
        order to calculate the Affected Customer Ratio during an Outage Period.
        This includes, but is not limited to, Novita AI’s analysis of service
        data immediately prior to the Outage Period, in order to estimate the
        ratio of Customer’s visitors who were affected during an Outage Period.
      </p>
    </div>
  );
}
