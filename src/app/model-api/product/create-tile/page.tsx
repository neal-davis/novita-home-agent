import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Create Seamless Patterns with Tile Generator",
  description:
    "Novita AI is a powerful online tool that allows you to generate images for creating seamless patterns and textures. Use our innovative tile generator to create repeating tiles, which can be used for fabrics, wallpapers, and various design projects.",
  keywords: [
    "Stable diffusion API , tile generator, seamless patterns, fabric design, wallpaper design, texture creation, repeating tiles, create mosaic tile, create tiled image",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.TILE}
      getStartedUrl={DOCS_URL.TILE}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.TILE}`}
    >
      <Case />
    </Layout>
  );
}
