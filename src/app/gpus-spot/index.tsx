import FirstPage from "./components/FirstPage";
import GPUPricing from "./components/GPUPricing";
import styles from "./index.module.scss";
import ReadyStart from "./components/ReadyStart";
import WhySpotInstances from "./components/WhySpotInstances";
import SpotLifeCycle from "./components/SpotLifeCycle";
import SpotAPI from "./components/SpotAPI";
import BestPractices from "./components/BestPractices";
import GPUSpotFeature from "./components/GPUSpotFeature";

export default function MainPageContent() {
  return (
    <div className={styles.container}>
      <FirstPage />
      <GPUPricing />
      <WhySpotInstances />
      <SpotLifeCycle />
      <GPUSpotFeature />
      <BestPractices />
      <SpotAPI />
      <ReadyStart />
    </div>
  );
}
