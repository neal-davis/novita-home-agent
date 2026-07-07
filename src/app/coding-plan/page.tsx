import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import FirstPage from "./components/firstPage";
import PlanList from "./components/planList";
import WhyUs from "./components/whyUs";
import FAQ from "./components/faq";
import MoreQuestion from "./components/moreQuestion";
import styles from "./page.module.scss";
import CodingPlanGuard from "./components/CodingPlanGuard";
import { getBasicModelList, getBasicResourcePackSpecsList } from "@/api/coding-plan";

export default async function CodingPlan() {
  const basicResourcePackSpecsList = await getBasicResourcePackSpecsList();
  const basicModelList = await getBasicModelList();
  let baseModeList = [];
  if (basicResourcePackSpecsList.length > 0) {
    const baseSpecItem = basicResourcePackSpecsList[0];
    const labelText = (baseSpecItem?.deductRules || [])?.map((item: any) => item.displayName);
    const modelList = Array.from(new Set(labelText)) || [];
    baseModeList = modelList.map((item: any) => {
      const modelItem = basicModelList.find((model: any) => model?.id === item);
      if (modelItem && modelItem?.display_name) {
        return modelItem.display_name;
      } else {
        return item;
      }
    });
  }

  console.log("basicResourcePackSpecsList:", basicResourcePackSpecsList);
  return (
    <CodingPlanGuard>
      <main
        className={`relative max-w-full overflow-hidden ${styles.container}`}
      >
        <Header />
        <FirstPage />
        <PlanList className="pb-[80px]" />
        <WhyUs baseModeList={baseModeList} />
        <FAQ />
        <MoreQuestion />
        <Footer />
      </main>
    </CodingPlanGuard>
  );
}
