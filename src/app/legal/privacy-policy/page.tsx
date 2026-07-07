/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { SUPPORT_EMAIL_LINK } from "@/constants/urls";
import { PRIVACY_EMAIL } from "@/constants/legal";
import CookieSettingsLink from "@/app/components/consent/CookieSettingsLink";
import styles from "../common.module.scss";
import { Metadata } from "next";
import { CANONICAL_URL } from "@/constants/canonical";

export const metadata: Metadata = {
  alternates: {
    canonical: CANONICAL_URL.LEGAL_PRIVACY_POLICY,
  },
};

export default function Page() {
  return (
    <div>
      <h1 className={styles.h1}>Privacy Policy</h1>
      <p className={styles.update_date}>
        Effective date: May 13, 2026
        <br />
        Last updated: May 13, 2026
      </p>
      <p className={styles.p}>
        Novita AI (together with our affiliates, "we", "our" or "us") respect
        your privacy and are strongly committed to keeping secure any
        information we obtain from you or about you.
      </p>
      <p className={styles.p}>
        This Privacy Policy describes our practices with respect to Personal
        Information we collect from or about you when you use our website and
        services (collectively, "Services"). This Privacy Policy does not apply
        to content that we process on behalf of customers while providing
        services. Our use of that data is governed by our customer agreements
        covering access to and use of those offerings.
      </p>

      {/* 1 */}
      <h2 className={styles.h2}>Personal Information We Collect</h2>
      <p className={styles.p}>
        We collect information that alone or in combination with other
        information in our possession could be used to identify you ("Personal
        Information") as follows:
      </p>

      <h2 className={styles.h2}>Personal Information You Provide</h2>
      <p className={styles.p}>
        We may collect Personal Information if you create an account to use our
        Services or communicate with us as follows:
      </p>
      <ul className={styles.ul}>
        <li>
          <strong>Account Information:</strong> When you create an account with
          us, we will collect information associated with your account,
          including your name, contact information, account credentials, payment
          card information, and transaction history (collectively, "Account
          Information").
        </li>
        <li>
          <strong>User Content:</strong> When you use our Services, we may
          collect Personal Information that is included in the content you
          provide to our Services, such as file uploads, documents, images,
          product interaction data, or feedback (collectively referred to as
          "Content"). This collection is necessary for you to use our products
          as intended.
        </li>
        <li>
          <strong>Communication Information:</strong> If you communicate with
          us, we may collect your name, contact information, and the contents of
          any messages you send ("Communication Information").
        </li>
      </ul>

      <h2 className={styles.h2}>
        Personal Information We Receive Automatically From Your Use of the
        Services
      </h2>
      <p className={styles.p}>
        When you visit, use, and interact with the Services, we may receive the
        following information about your visit, use, or interactions ("Technical
        Information"):
      </p>
      <ul className={styles.ul}>
        <li>
          <strong>Log Data:</strong> Information that your browser automatically
          sends whenever you use our website ("log data"). Log data includes
          your Internet Protocol address, browser type and settings, the date
          and time of your request, and how you interacted with our website.
        </li>
        <li>
          <strong>Usage Data:</strong> We may automatically collect information
          about your use of the Services, such as the types of content that you
          view or engage with, the features you use and the actions you take, as
          well as your time zone, country, the dates and times of access, user
          agent and version, type of computer or mobile device, computer
          connection, IP address, and the like.
        </li>
        <li>
          <strong>Device Information:</strong> Includes the name of the device,
          operating system, and browser you are using. Information collected may
          depend on the type of device you use and its settings.
        </li>
        <li>
          <strong>Cookies:</strong> We use cookies to operate and administer our
          Services, and improve your experience on it. A "cookie" is a piece of
          information sent to your browser by a website you visit. You can set
          your browser to accept all cookies, to reject all cookies, or to
          notify you whenever a cookie is offered so that you can decide each
          time whether to accept it. However, refusing a cookie may in some
          cases preclude you from using, or negatively affect the display or
          function of, a website or certain areas or features of a website. For
          more information, see our{" "}
          <Link href="/legal/cookie-policy">Cookie Policy</Link>.
        </li>
        <li>
          <strong>Analytics:</strong> We may use a variety of online analytics
          products that use cookies to help us analyze how users use our
          Services and enhance your experience when you use the Services.
        </li>
      </ul>

      <h2 className={styles.h2}>
        Categories of Personal Information Collected (CCPA Disclosure)
      </h2>
      <p className={styles.p}>
        In accordance with the California Consumer Privacy Act (CCPA) as amended
        by the California Privacy Rights Act (CPRA), we have collected the
        following categories of personal information from consumers within the
        last twelve (12) months:
      </p>
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[var(--fill-4)]">
              <th className="text-left p-3 border border-[var(--border)] text-[var(--dark-1)] font-semibold w-1/4">
                Category
              </th>
              <th className="text-left p-3 border border-[var(--border)] text-[var(--dark-1)] font-semibold">
                Examples
              </th>
              <th className="text-left p-3 border border-[var(--border)] text-[var(--dark-1)] font-semibold w-24">
                Collected
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                title: "Identifiers",
                description:
                  "Real name, alias, postal address, unique personal identifier, online identifier, Internet Protocol address, email address, account name, or other similar identifiers",
                label: "YES",
              },
              {
                title:
                  "Personal information categories listed in the California Customer Records statute",
                description:
                  "Name, signature, Social Security number, physical characteristics or description, address, telephone number, passport number, driver's license or state identification card number, insurance policy number, education, employment, employment history, bank account number, credit card number, debit card number, or any other financial information, medical information, or health insurance information",
                label: "YES",
              },
              {
                title:
                  "Protected classification characteristics under California or federal law",
                description:
                  "Age (40 years or older), race, color, ancestry, national origin, citizenship, religion or creed, marital status, medical condition, physical or mental disability, sex (including gender, gender identity, gender expression, pregnancy or childbirth and related medical conditions), sexual orientation, veteran or military status, genetic information (including familial genetic information)",
                label: "NO",
              },
              {
                title: "Commercial information",
                description:
                  "Records of personal property, products or services purchased, obtained, or considered, or other purchasing or consuming histories or tendencies",
                label: "YES",
              },
              {
                title: "Biometric information",
                description:
                  "Genetic, physiological, behavioral, and biological characteristics, or activity patterns used to extract a template or other identifier or identifying information, such as fingerprints, faceprints, and voiceprints, iris or retina scans, keystroke, gait, or other physical patterns, and sleep, health, or exercise data",
                label: "NO",
              },
              {
                title: "Internet or other similar network activity",
                description:
                  "Browsing history, search history, information on a consumer's interaction with a website, application, or advertisement",
                label: "YES",
              },
              {
                title: "Geolocation data",
                description: "Physical location or movements",
                label: "NO",
              },
              {
                title: "Sensory data",
                description:
                  "Audio, electronic, visual, thermal, olfactory, or similar information",
                label: "NO",
              },
              {
                title: "Professional or employment-related information",
                description:
                  "Current or past job history or performance evaluations",
                label: "NO",
              },
              {
                title: "Non-public education information",
                description:
                  "Education records directly related to a student maintained by an educational institution or party acting on its behalf, such as grades, transcripts, class lists, student schedules, student identification codes, student financial information, or student disciplinary records",
                label: "NO",
              },
              {
                title: "Inferences drawn from other personal information",
                description:
                  "Profile reflecting a person's preferences, characteristics, psychological trends, predispositions, behavior, attitudes, intelligence, abilities, and aptitudes",
                label: "YES",
              },
            ].map((row, i) => (
              <tr key={i} className="border-b border-[var(--border)]">
                <td className="p-3 border border-[var(--border)] text-[var(--dark-1)] align-top font-semibold">
                  {row.title}
                </td>
                <td className="p-3 border border-[var(--border)] text-[var(--dark-1)] align-top">
                  {row.description}
                </td>
                <td className="p-3 border border-[var(--border)] text-[var(--dark-1)] align-top font-medium">
                  {row.label}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2 */}
      <h2 className={styles.h2}>How We Use Personal Information</h2>
      <p className={styles.p}>
        The Personal Information will not be used for model training. Its
        primary purposes are as follows:
      </p>
      <ul className={styles.ul}>
        <li>To provide, administer, maintain and/or analyze the Services;</li>
        <li>To improve our Services and conduct research;</li>
        <li>To communicate with you;</li>
        <li>
          To prevent fraud, criminal activity, or misuses of our Services, and
          to ensure the security of our IT systems, architecture and networks;
        </li>
        <li>
          To comply with legal obligations and legal process and to protect our
          rights, privacy, safety, or property, and/or that of our affiliates,
          you, or other third parties.
        </li>
      </ul>

      <h2 className={styles.h2}>
        Business or Commercial Purposes for Collecting Personal Information
      </h2>
      <p className={styles.p}>
        We collect and use your personal information for the following business
        or commercial purposes:
      </p>
      <ul className={styles.ul}>
        <li>
          <strong>Providing Services:</strong> To provide, maintain, and improve
          our Services, including to process transactions and authenticate
          users.
        </li>
        <li>
          <strong>Communication:</strong> To communicate with you about your
          account, our Services, and promotional offers.
        </li>
        <li>
          <strong>Security:</strong> To detect, investigate, and prevent
          fraudulent transactions and other illegal activities and protect the
          rights and property of Novita AI and others.
        </li>
        <li>
          <strong>Compliance:</strong> To comply with legal obligations and
          respond to lawful requests from government authorities.
        </li>
        <li>
          <strong>Personalization:</strong> To personalize your experience and
          deliver content and product offerings relevant to your interests.
        </li>
        <li>
          <strong>Research and Development:</strong> To conduct research and
          analysis to improve our Services and develop new products and
          features.
        </li>
      </ul>

      <h2 className={styles.h2}>Aggregated or De-Identified Information</h2>
      <p className={styles.p}>
        We may aggregate or de-identify Personal Information and use the
        aggregated information to analyze the effectiveness of our Services, to
        improve and add features to our Services, to conduct research and for
        other similar purposes. In addition, from time to time, we may analyze
        the general behavior and characteristics of users of our Services and
        share aggregated information like general user statistics with third
        parties, publish such aggregated information or make such aggregated
        information generally available. We may collect aggregated information
        through the Services, through cookies, and through other means described
        in this Privacy Policy. We will maintain and use de-identified
        information in anonymous or de-identified form and we will not attempt
        to reidentify the information.
      </p>

      {/* 3 */}
      <h2 className={styles.h2}>Disclosure of Personal Information</h2>
      <p className={styles.p}>
        In certain circumstances, we may provide your Personal Information to
        third parties without further notice to you, unless required by the law:
      </p>

      <h2 className={styles.h2}>
        Categories of Third Parties with Whom We Share Personal Information
      </h2>
      <p className={styles.p}>
        We share your personal information with the following categories of
        third parties:
      </p>
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[var(--fill-4)]">
              <th className="text-left p-3 border border-[var(--border)] text-[var(--dark-1)] font-semibold">
                Category of Third Party
              </th>
              <th className="text-left p-3 border border-[var(--border)] text-[var(--dark-1)] font-semibold">
                Purpose of Sharing
              </th>
              <th className="text-left p-3 border border-[var(--border)] text-[var(--dark-1)] font-semibold">
                Categories of Personal Information Shared
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                title: "Service Providers",
                description:
                  "To assist us in meeting business operations needs",
                label:
                  "All categories listed above as needed for specific services",
              },
              {
                title: "Analytics Providers",
                description: "To analyze usage and improve our Services",
                label: "Identifiers, Internet activity, Usage data",
              },
              {
                title: "Payment Processors",
                description: "To process payments",
                label: "Account Information, Payment information",
              },
              {
                title: "Cloud Storage Providers",
                description: "To store data securely",
                label: "All categories as needed",
              },
              {
                title: "Legal and Regulatory Authorities",
                description: "To comply with legal obligations",
                label: "As required by law",
              },
            ].map((row, i) => (
              <tr key={i} className="border-b border-[var(--border)]">
                <td className="p-3 border border-[var(--border)] text-[var(--dark-1)] align-top font-semibold">
                  {row.title}
                </td>
                <td className="p-3 border border-[var(--border)] text-[var(--dark-1)] align-top">
                  {row.description}
                </td>
                <td className="p-3 border border-[var(--border)] text-[var(--dark-1)] align-top">
                  {row.label}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className={styles.h2}>Specific Disclosures</h2>
      <ul className={styles.ul}>
        <li>
          <strong>Vendors and Service Providers:</strong> To assist us in
          meeting business operations needs and to perform certain services and
          functions, we may provide Personal Information to vendors and service
          providers, including providers of hosting services, cloud services,
          and other information technology services providers, event management
          services, email communication software and email newsletter services,
          and web analytics services. Pursuant to our instructions, these
          parties will access, process, or store personal information only in
          the course of performing their duties to us.
        </li>
        <li>
          <strong>Business Transfers:</strong> If we are involved in strategic
          transactions, reorganization, bankruptcy, receivership, or transition
          of service to another provider (collectively a "Transaction"), your
          Personal Information and other information may be disclosed in the
          diligence process with counterparties and others assisting with the
          Transaction and transferred to a successor or affiliate as part of
          that Transaction along with other assets.
        </li>
        <li>
          <strong>Legal Requirements:</strong> If required to do so by law or in
          the good faith belief that such action is necessary to (i) comply with
          a legal obligation, including to meet national security or law
          enforcement requirements, (ii) protect and defend our rights or
          property, (iii) prevent fraud, (iv) act in urgent circumstances to
          protect the personal safety of users of the Services, or the public,
          or (v) protect against legal liability.
        </li>
        <li>
          <strong>Affiliates:</strong> We may disclose Personal Information to
          our affiliates, meaning an entity that controls, is controlled by, or
          is under common control with us. Our affiliates may use the Personal
          Information we share in a manner consistent with this Privacy Policy.
        </li>
      </ul>

      <h2 className={styles.h2}>International Data Transfers</h2>
      <p className={styles.p}>
        We may transfer Personal Information to countries outside your country
        or region, including the United States. Where required by applicable
        law, we use appropriate safeguards such as Standard Contractual Clauses,
        the EU-U.S. Data Privacy Framework where applicable to participating
        providers, and other legally recognized transfer mechanisms. Additional
        information about cookies and providers is available in our{" "}
        <Link href="/legal/cookie-policy">Cookie Policy</Link>.
      </p>

      <h2 className={styles.h2}>Sale or Sharing of Personal Information</h2>
      <p className={styles.p}>
        We do not sell your personal information for monetary consideration.
        However, under the CCPA, "sale" is broadly defined to include making
        personal information available to third parties for monetary or other
        valuable consideration. We may share personal information with third
        parties for purposes such as analytics and advertising, which may be
        considered a "sale" under CCPA.
      </p>
      <p className={styles.p}>
        In the preceding 12 months, we have shared the following categories of
        personal information with third parties for business purposes:
      </p>
      <ul className={styles.ul}>
        <li>Identifiers</li>
        <li>Internet or other electronic network activity information</li>
        <li>Geolocation data</li>
      </ul>

      {/* 4 */}
      <h2 className={styles.h2}>Your Rights and Choices</h2>

      <h2 className={styles.h2}>California Consumer Privacy Rights</h2>
      <p className={styles.p}>
        If you are a California resident, you have the following rights under
        the California Consumer Privacy Act (CCPA):
      </p>
      <ul className={styles.ul}>
        <li>
          <strong>Right to Know:</strong> You have the right to request that we
          disclose certain information to you about our collection and use of
          your personal information over the past 12 months.
        </li>
        <li>
          <strong>Right to Delete:</strong> You have the right to request that
          we delete any of your personal information that we collected from you
          and retained, subject to certain exceptions.
        </li>
        <li>
          <strong>Right to Correct:</strong> You have the right to request
          correction of inaccurate personal information that we maintain about
          you.
        </li>
        <li>
          <strong>Right to Opt-Out of Sale/Sharing:</strong> You have the right
          to direct us to not sell or share your personal information to third
          parties.
        </li>
        <li>
          <strong>Right to Limit Use of Sensitive Personal Information:</strong>{" "}
          You have the right to limit the use and disclosure of your sensitive
          personal information.
        </li>
        <li>
          <strong>Right to Non-Discrimination:</strong> We will not discriminate
          against you for exercising any of your CCPA rights.
        </li>
      </ul>

      <h2 className={styles.h2}>How to Exercise Your Rights</h2>
      <p className={styles.p}>
        To exercise your rights under CCPA, please submit a verifiable consumer
        request to us by either:
      </p>
      <ul className={styles.ul}>
        <li>
          Emailing us at:{" "}
          <strong>
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
          </strong>
        </li>
        <li>
          Calling our toll-free number:{" "}
          <strong>1-800-NOVITA-AI (1-800-668-4822)</strong>
        </li>
      </ul>
      <p className={styles.p}>
        Only you, or someone legally authorized to act on your behalf, may make
        a verifiable consumer request related to your personal information. You
        may only make a verifiable consumer request for access or data
        portability twice within a 12-month period.
      </p>
      <p className={styles.p}>
        We cannot respond to your request or provide you with personal
        information if we cannot verify your identity or authority to make the
        request and confirm the personal information relates to you. We will
        only use personal information provided in a verifiable consumer request
        to verify the requestor's identity or authority to make the request.
      </p>

      <h2 className={styles.h2}>Response Timing and Format</h2>
      <p className={styles.p}>
        We endeavor to respond to a verifiable consumer request within
        forty-five (45) days of its receipt. If we require more time (up to 90
        days), we will inform you of the reason and extension period in writing.
      </p>
      <p className={styles.p}>
        Any disclosures we provide will only cover the 12-month period preceding
        the verifiable consumer request's receipt. The response we provide will
        also explain the reasons we cannot comply with a request, if applicable.
      </p>

      <h2 className={styles.h2}>Other Jurisdictional Rights</h2>
      <p className={styles.p}>
        Depending on your location, individuals in the EEA, the UK, and across
        the globe may have certain statutory rights in relation to their
        Personal Information. For example, you may have the right to:
      </p>
      <ul className={styles.ul}>
        <li>Access your Personal Information.</li>
        <li>Delete your Personal Information.</li>
        <li>Correct or update your Personal Information.</li>
        <li>Transfer your Personal Information elsewhere.</li>
        <li>
          Withdraw your consent to the processing of your Personal Information
          where we rely on consent as the legal basis for processing.
        </li>
        <li>
          Object to or restrict the processing of your Personal Information
          where we rely on legitimate interests as the legal basis for
          processing.
        </li>
      </ul>
      <p className={styles.p}>
        You can exercise some of these rights through your Account. If you are
        unable to exercise your rights through your account, please send your
        request to:{" "}
        <strong>
          <a href={`mailto:${SUPPORT_EMAIL_LINK}`}>{SUPPORT_EMAIL_LINK}</a>
        </strong>
        .
      </p>

      {/* 5 */}
      <h2 className={styles.h2}>
        Do Not Sell or Share My Personal Information
      </h2>
      <p className={styles.p}>
        If you are a California resident, you have the right to opt-out of the
        "sale" or "sharing" of your personal information. To exercise this
        right, you may:
      </p>
      <ul className={styles.ul}>
        <li>
          Click the "Do Not Sell or Share My Personal Information" link on our
          website footer
        </li>
        <li>Submit a request through our Privacy Rights Portal</li>
        <li>
          Email us at{" "}
          <strong>
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
          </strong>
        </li>
      </ul>
      <p className={styles.p}>
        We will process your opt-out request within 15 business days. Once you
        opt-out, we will wait at least 12 months before asking you to opt-in to
        the sale of your personal information.
      </p>
      <CookieSettingsLink className="mt-3 inline-flex rounded border border-[var(--border)] px-4 py-2 font-subtle-medium text-[var(--dark-1)] hover:bg-[var(--fill-4)]">
        Open Cookie Settings
      </CookieSettingsLink>

      {/* 6 */}
      <h2 className={styles.h2}>Children&apos;s Privacy</h2>
      <p className={styles.p}>
        Our Service is not directed to children who are under the age of 18. We
        do not knowingly collect Personal Information from children under the
        age of 18. If you have reason to believe that a child under the age of
        18 has provided Personal Information to us through the Service please
        email us at:{" "}
        <strong>
          <a href={`mailto:${SUPPORT_EMAIL_LINK}`}>{SUPPORT_EMAIL_LINK}</a>
        </strong>
        . We will investigate any notification and, if appropriate, delete the
        Personal Information from our systems.
      </p>
      <p className={styles.p}>
        <strong>Special Notice for California Minors:</strong> If you are under
        16 years of age, reside in California, and have a registered account
        with our Services, you have the right to request removal of unwanted
        content that you publicly post on the Services. To request removal of
        such content, please contact us using the contact information provided
        below and include a detailed description of the content. Please be aware
        that such a request does not ensure complete or comprehensive removal of
        the content posted, and the law may not require removal in certain
        circumstances.
      </p>

      {/* 7 */}
      <h2 className={styles.h2}>Links to Other Websites</h2>
      <p className={styles.p}>
        The Service may contain links to other websites not operated or
        controlled by us, including social media services ("Third Party Sites").
        The information that you share with Third Party Sites will be governed
        by the specific privacy policies and terms of service of the Third Party
        Sites and not by this Privacy Policy. By providing these links we do not
        imply that we endorse or have reviewed these sites. Please contact the
        Third Party Sites directly for information on their privacy practices
        and policies.
      </p>

      {/* 8 */}
      <h2 className={styles.h2}>Security and Retention</h2>

      <h2 className={styles.h2}>Security Measures</h2>
      <p className={styles.p}>
        We implement commercially reasonable technical, administrative, and
        organizational measures to protect Personal Information both online and
        offline from loss, misuse, and unauthorized access, disclosure,
        alteration, or destruction. However, no Internet or email transmission
        is ever fully secure or error free. In particular, email sent to or from
        us may not be secure. Therefore, you should take special care in
        deciding what information you send to us via the Service or email. In
        addition, we are not responsible for circumvention of any privacy
        settings or security measures contained on the Service, or third party
        websites.
      </p>

      <h2 className={styles.h2}>Data Retention</h2>
      <p className={styles.p}>
        We retain your Personal Information for only as long as we need in order
        to provide our Service to you, or for other legitimate business purposes
        such as resolving disputes, safety and security reasons, or complying
        with our legal obligations. How long we retain Personal Information will
        depend on a number of factors, such as the amount, nature, and
        sensitivity of the information, the potential risk of harm from
        unauthorized use or disclosure, our purpose for processing the
        information, and any legal requirements.
      </p>
      <p className={styles.p}>
        <strong>Specific Retention Periods:</strong>
      </p>
      <ul className={styles.ul}>
        <li>
          Account Information: Retained for as long as your account is active
          plus 7 years for legal and tax purposes
        </li>
        <li>
          Transaction History: Retained for 7 years for accounting and tax
          compliance
        </li>
        <li>
          Communication Information: Retained for 3 years from last
          communication
        </li>
        <li>
          Technical Information: Retained for 2 years for security and analytics
          purposes
        </li>
      </ul>
      <p className={styles.p}>
        We may also anonymize or de-identify your Personal Information (so that
        it can no longer be associated with you) for research or statistical
        purposes, as described above, in which case we may use this information
        indefinitely without further notice to you.
      </p>

      {/* 9 */}
      <h2 className={styles.h2}>Changes to the Privacy Policy</h2>
      <p className={styles.p}>
        We may change this Privacy Policy at any time. When we do, we will post
        an updated version on this page, unless another type of notice is
        required by applicable law. By continuing to use our Service or
        providing us with Personal Information after we have posted an updated
        Privacy Policy, or notified you by other means, you consent to the
        revised Privacy Policy.
      </p>
      <p className={styles.p}>
        <strong>Annual Review:</strong> We review this privacy policy at least
        once every 12 months and update it as necessary to reflect changes in
        our data practices or legal requirements.
      </p>

      {/* 10 */}
      <h2 className={styles.h2}>How to Contact Us</h2>
      <p className={styles.p}>
        If you have any questions or concerns about this Privacy Policy or our
        data practices, please contact us:
      </p>
      <p className={styles.p}>
        <strong>
          Email:{" "}
          <a href={`mailto:${SUPPORT_EMAIL_LINK}`}>{SUPPORT_EMAIL_LINK}</a>
        </strong>
      </p>
      <p className={styles.p}>
        If you have any questions or concerns not already addressed in this
        Privacy Policy, please contact us using the information above.
      </p>
    </div>
  );
}
