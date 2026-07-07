import Footer from "@/app/components/footer/Footer";
import Header from "@/app/components/header/Header";
import styles from "./page.module.css";
import NotFound from "@/app/not-found";
import ImgGeneration from "./components/ImgGeneration";

import { Metadata } from "next";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

const fetchUrl = "https://novita.ai/image-config.json";
const PRODUCT_NAME = "Novita AI";

export async function generateMetadata(props: {
  params: { keyword: string };
}): Promise<Metadata> {
  const keyword = props.params.keyword;
  const res = await fetch(fetchUrl, {
    cache: "no-cache",
  });
  const configJson = await res.json();

  if (!Array.isArray(configJson?.data)) {
    return {
      title: `${PRODUCT_NAME} image | 404`,
      description: `${PRODUCT_NAME} image page`,
    };
  }

  const pageData = configJson.data.find((one: any) => one.urlSlug === keyword);
  if (!pageData) {
    return {
      title: `${PRODUCT_NAME} image | 404`,
      description: `${PRODUCT_NAME} image page`,
    };
  }

  return {
    title: `${PRODUCT_NAME} | ${pageData.title}`,
    description: `${PRODUCT_NAME} | ${pageData.title}`,
    keywords: `${PRODUCT_NAME}, Stable Diffusion, ai art generator, ${pageData.title}`,
    alternates: getLocalizedMetadataAlternates(
      CANONICAL_URL.MODEL_API_IMAGE + "/" + pageData.urlSlug,
    ),
  };
}

export default async function Page(props: { params: { keyword: string } }) {
  const keyword = props.params.keyword;
  const res = await fetch(fetchUrl, {
    cache: "no-cache",
  });
  const configJson = await res.json();

  if (!Array.isArray(configJson?.data)) {
    return <NotFound />;
  }

  const pageData = configJson.data.find((one: any) => one.urlSlug === keyword);
  if (!pageData) {
    return <NotFound />;
  }

  return (
    <main className="relative max-w-full overflow-hidden">
      <Header />
      <div className={styles.page_wrap}>
        <div className="page_wrap">
          <ImgGeneration imgList={pageData.list} title={pageData.title} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
