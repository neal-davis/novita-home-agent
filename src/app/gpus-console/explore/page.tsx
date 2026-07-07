import { Metadata } from "next";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";
import Section from "./components/section";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Novita AI GPU Marketplace - Deploy GPU Instances Seamlessly",
    description:
      "Rent GPUs from Novita AI's GPU marketplace, customize your own deployment and launch an instance. 4090, A100, L40, 3090 are available. Pay for what you use.",
    alternates: getLocalizedMetadataAlternates(
      "https://novita.ai/gpus-console/explore",
    ),
  };
}

export default function Page() {
  return <Section />;
}
