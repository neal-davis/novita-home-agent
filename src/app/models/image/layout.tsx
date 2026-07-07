import type { Metadata } from "next";
import Page from "./page";
import PlaygroundHeader from "@/app/components/header/PlaygroundHeader";
import styles from "./page.module.scss";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";
const META = {
  title: "Novita AI Playground - Chat, Generate Images and Videos for Free",
  description:
    "Try Novita AI Model APIs for free. Explore the full spectrum of AI APIs tailored for image, video, audio, and LLM applications. Pay for what you use.",
  images: [
    {
      url: "https://novita.ai/models/models-social-thumbnail.png",
      alt: "Novita Models",
    },
  ],
  siteName: "Novita AI",
};

const metadata: Metadata = {
  title: META.title,
  description: META.description,
  openGraph: {
    title: META.title,
    description: META.description,
    siteName: META.siteName,
    images: META.images,
  },
  twitter: {
    title: META.title,
    description: META.description,
    site: META.siteName,
    images: META.images,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...metadata,
    alternates: getLocalizedMetadataAlternates(
      CANONICAL_URL.MODEL_API_PLAYGROUND,
    ),
  };
}

export default async function PlaygroundLayout() {
  return (
    <section>
      <main className={`flex h-screen flex-col ${styles.playground_wrapper}`}>
        <PlaygroundHeader />
        <Page />
      </main>
    </section>
  );
}
