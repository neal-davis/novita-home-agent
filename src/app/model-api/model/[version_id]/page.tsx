import Header from "@/app/components/header/Header";
import Detail from "./components/Detail";
import ModelNotFound from "./components/NotFound";

import styles from "./page.module.css";
import { getModelDetail } from "@/api/model";
import Footer from "@/app/components/footer/Footer";
import { Metadata } from "next";
import { model_not_list } from "./model_not_list";
import { redirect } from "next/navigation";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

const PRODUCT_NAME = "Novita AI";

export async function generateMetadata(props: {
  params: { version_id: string };
}): Promise<Metadata> {
  const arr = props.params.version_id.split("_");
  const version_id = arr[arr.length - 1];
  const modelDetail = await getModelDetail(Number(version_id));

  if (!modelDetail) {
    return {};
  }

  return {
    title: `${PRODUCT_NAME} model | Stable Diffusion ${modelDetail.model_name}`,
    description: `${PRODUCT_NAME} model | ${modelDetail.model_name}`,
    keywords: `Stable Diffusion ${modelDetail.model_name}`,
    alternates: getLocalizedMetadataAlternates(
      CANONICAL_URL.MODEL_API_MODEL + "/" + modelDetail.model_id,
    ),
  };
}

export default async function ModelDetail(props: {
  params: { version_id: string };
}) {
  const arr = props.params.version_id.split("_");
  const version_id = arr[arr.length - 1];
  const modelDetail = await getModelDetail(Number(version_id));
  const isNsfw =
    model_not_list.includes(version_id) ||
    modelDetail?.is_nsfw ||
    !modelDetail?.in_whitelist;
  // redirect to model list page if the model is nsfw
  if (isNsfw) {
    return redirect("/model-api/model");
  }
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.wrap}>
        {modelDetail ? (
          <Detail {...modelDetail} is_nsfw={isNsfw} />
        ) : (
          <ModelNotFound version_id={Number(version_id)} />
        )}
      </div>
      <Footer />
    </div>
  );
}
