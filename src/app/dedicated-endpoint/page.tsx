import type { Metadata } from "next";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { NOVITA_URL } from "@/constants/urls";
import DedicatedEndpointPageContent from "./components/DedicatedEndpointPageContent";

export const metadata: Metadata = {
  title: "Dedicated Endpoints | Novita AI",
  description:
    "Dedicated AI inference endpoints with predictable latency, custom models, and managed deployment on Novita AI.",
};

export default function DedicatedEndpointPage() {
  return (
    <main className="relative max-w-full overflow-x-clip bg-[var(--surface)]">
      <WebsiteNavbar />
      <DedicatedEndpointPageContent />
      <FooterSection getStartedHref={NOVITA_URL.MODEL_API_CONSOLE_LLM_DE} />
    </main>
  );
}
