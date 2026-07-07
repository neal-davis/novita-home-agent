import { redirect } from "next/navigation";
import { BlackFridayHero } from "./components/BlackFridayHero";
import { Products } from "./components/Products";
import Partners from "@/app/mainpage/components/Partners";
import { Questions } from "./components/Questions";
import { Terms } from "./components/Terms";
import { Help } from "./components/help";
import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import getCampaignConfig from "@/config/campaign";
import styles from "./page.module.scss";

export const metadata = {
  title: "Build Month 2025 - Build More, Spend Less | Novita AI",
  description:
    "The Best Deals for Developers. Ship AI models and agents faster with up to 20% OFF on all Novita Cloud services. Build Month 2025: 11/24 ~ 12/31, 2025, at 11:59 PM PST",
};

export default function BlackFridayPage() {
  const campaign = getCampaignConfig();

  // Redirect to homepage if campaign is not enabled
  if (!campaign.enabled) {
    redirect("/");
  }

  return (
    <div className={styles.container}>
      <Header hideNavigation hideNotice />
      <BlackFridayHero />
      <Products />
      {/* Trusted by section */}
      <div className={styles.trusted_by_section}>
        <div className="max_width_container">
          <div className="px-web">
            <h3 className={styles.section_title}>
              Trusted by Leading AI Companies
            </h3>
            <p className={styles.section_description}>
              Join thousands of developers building on Novita
            </p>
            <Partners
              needTag={false}
              containerClassName={styles.partners_container}
            />
          </div>
        </div>
      </div>
      <Questions />
      <Terms />
      <Help />
      <Footer className="!border-t-0" />
    </div>
  );
}
