import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import { Info } from "./Info";
import { Partners } from "./Partners";
import { Questions } from "./Questions";
import { Recommend } from "./Recommend";
import { AffiliateExperience } from "./AffiliateExperience";
import styles from "./GridBackground.module.scss";

export function AffiliateNewPage() {
  return (
    <div className="min-h-screen bg-white max-w-full overflow-hidden">
      <Header />
      <main>
        <div className={styles.gridBackground}>
          <AffiliateExperience />
        </div>
        <Info />
        <Partners />
        <Questions />
        <Recommend />
      </main>
      <Footer />
    </div>
  );
}
