import Footer from "@/app/components/footer/Footer";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import Header from "@/app/components/header/Header";
import { Metadata } from "next";
import QAndA from "./components/Q-and-A/QAndA";
import SupportLanguage from "./components/support-language/SupportLanguage";
import KeyFeature from "./components/key-features/KeyFeature";
import UsageExample from "./components/usage-example/UsageExample";
import VoiceLibrary from "./components/voice-library/VoiceLibrary";
import Playground from "./components/playground/Playground";

export const metadata: Metadata = {
  title: "AI Text to Speech Online | Captivating, Realistic, Voice Synthesis",
  description:
    "Discover the power of free AI Text to Speech API with Novita AI. Our online tool offers captivating, realistic voice synthesis for various applications. Explore our library of voices and enhance your content with natural-sounding audio.",
  keywords: [
    "text to speech, ai text to speech, text to speech free, ai voice text to speech, ai voice generator, text to speech api, tts api, best text to speech api, free text to speech api, novita ai, novita ai api",
  ],
};

export default function Pgae() {
  return (
    <div style={{ minWidth: 1230 }}>
      <Header />
      <Playground />
      <VoiceLibrary />
      <KeyFeature />
      <UsageExample />
      <SupportLanguage />
      <QAndA />
      <FooterBanner />
      <Footer />
    </div>
  );
}
