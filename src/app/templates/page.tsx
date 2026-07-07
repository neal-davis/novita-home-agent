import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import CatalogueItemList from "@/app/components/CatalogueItemList";
import ReadyStart from "@/app/components/pageComponents/ReadyStart";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import { getLandingPageTemplatesInServerEnv } from "@/api/config";
import styles from "./page.module.scss";

export const metadata = {};

function getLogo(name: string) {
  switch (name) {
    case "koboldcpp":
      return "/models/logo/koboldcpp-logo.png";
    case "FLUX.1-dev":
      return "/models/logo/svg/flux-logo.svg";
    case "Axolotl":
      return "/models/logo/axolotl-logo.png";
    case "Gemma-2-2b-it":
      return "/models/logo/svg/gemma-logo.svg";
    case "Facefusion v2.6.0":
      return "/models/logo/facefusion-logo.png";
    case "Stable Diffusion v1.8.0":
      return "/models/logo/stable-diffusion-logo.png";
    case "PyTorch v2.2.1":
      return "/models/logo/pytorch-logo.png";
    case "TensorFlow 2.7.0":
      return "/models/logo/tensorflow-logo.png";
    case "Ollama Open WebUI":
      return "/models/logo/svg/web-ui-logo.svg";
    case "Meta Llama 3.1 8B Instruct":
      return "/models/logo/svg/meta-logo.svg";
    case "MiniCPM-V-2_6":
      return "/models/logo/minicpm-logo.png";
    case "kohya-ss":
      return "/models/logo/kohya-logo.png";
    case "stable-diffusion-3-medium":
      return "/models/logo/stable-diffusion-logo.png";
    case "Qwen2-Audio-7B-Instruct":
      return "/models/logo/svg/qwen-logo.svg";
    default:
      return "/models/logo/default-model-logo.png";
  }
}

export default async function Page() {
  const modelList: LangdingPageTemplateSchema[] =
    await getLandingPageTemplatesInServerEnv();
  const data = (modelList || []).map((item) => ({
    ...item,
    logo: item.logo || getLogo(item.modelName || ""),
  }));

  return (
    <main className="relative max-w-full overflow-hidden">
      <Header />
      <div className={styles.container}>
        <div className="max_width_container">
          <h1 className={`${styles.title} mx-web`}>{"Template Catalogue"}</h1>
          <div className={`${styles.funcs_wrapper} mx-web`}>
            <CatalogueItemList data={data || []} />
          </div>
        </div>
      </div>
      <ReadyStart />
      <FooterBanner />
      <Footer />
    </main>
  );
}
