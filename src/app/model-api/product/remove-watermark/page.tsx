import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Easily Remove Watermarks from Photos",
  description:
    "Novita AI - Tired of watermarked photos ruining your aesthetic? Novita AI uses AI to automatically detect and remove watermarks from images in seconds, leaving your photos pristine and share-worthy without a trace.",
  keywords: [
    "remove watermark, get rid of watermark, delete watermark, wipe watermark, erase watermark, unlock watermarked photos, watermark remover, AI watermark remova",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.REMOVE_WATERMARK}
      getStartedUrl={DOCS_URL.REMOVE_WATERMARK}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.REMOVE_WATERMARK}`}
    >
      <Case />
    </Layout>
  );
}
