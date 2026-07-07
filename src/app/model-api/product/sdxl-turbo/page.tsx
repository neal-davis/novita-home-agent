import Case from "./Case";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Unleash the Power of SDXL Turbo: Revolutionizing AI Image Generation",
  description:
    "SDXL Turbo revolutionizes image generation with its cutting-edge distillation technology, delivering state-of-the-art performance. It takes a significant leap forward by generating high-quality images in just a single step, eliminating the need for the traditional 50-step process.",
  keywords: [
    "SDXL Turbo, SDXL, Text to image, stable-diffusion-turbo, Text to Image, AI image creator, text to image generator, ai art generator",
  ],
};

export default function Page() {
  return (
    <Layout metadata={metadata}>
      <Case />
    </Layout>
  );
}
