import Header from "@/app/components/header/Header";
import styles from "./page.module.css";
import ModelList from "./components/modelList/modelList";
import { getModels } from "@/api/model";
import { MODEL_LIST_PAGE_SIZE } from "@/constants/constants";

export default async function ModelPage() {
  let result: {
    models: any[];
    nextCursor: string;
    fetchId?: number | undefined;
  } = { models: [], nextCursor: "" };
  try {
    result = await getModels({
      pageSize: MODEL_LIST_PAGE_SIZE,
      pageIndex: 0,
      filter: {
        in_whitelist: true,
        source: "civitai",
      },
    });
  } catch (e) {
    console.log("🚀 getModels error", e);
  }
  return (
    <div className={styles.page_container}>
      <h1 className={styles.c_title}>Welcome to Novita AI model page</h1>
      <Header />
      <div className={styles.wrap}>
        <ModelList type="link" initModelList={result.models} />
      </div>
    </div>
  );
}
