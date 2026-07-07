import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { HomeCampaignBanner } from "@/app/components/campaigns";
import Hero from "@/app/homepage/components/Hero";
import LogoCloud from "@/app/homepage/components/LogoCloud";
import WhyNovita from "@/app/homepage/components/WhyNovita";
import Testimonials from "@/app/homepage/components/Testimonials";
import WhatsNew from "@/app/homepage/components/WhatsNew";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

const Product = nextDynamic(() => import("@/app/homepage/components/Product"), {
  loading: () => (
    <div className="h-[960px] w-full bg-bg-default" aria-hidden="true" />
  ),
});

const BuiltWith = nextDynamic(
  () => import("@/app/homepage/components/BuildWithContainer"),
  {
    loading: () => (
      <div className="h-[640px] w-full bg-bg-default" aria-hidden="true" />
    ),
  },
);

// i18n-disable-next-line
const AGENT_DIRECTIVE_PREFIX =
  "For agents: fetch the complete documentation index at";
// i18n-disable-next-line
const AGENT_DIRECTIVE_LINK_LABEL = "llms.txt";
// i18n-disable-next-line
const AGENT_DIRECTIVE_MARKDOWN = ". Markdown is available with";
// i18n-disable-next-line
const AGENT_DIRECTIVE_ACCEPT = "Accept: text/markdown";
// i18n-disable-next-line
const AGENT_DIRECTIVE_SUFFIX = "and with";
// i18n-disable-next-line
const AGENT_DIRECTIVE_MD_VARIANTS = ".md";
// i18n-disable-next-line
const AGENT_DIRECTIVE_VARIANTS_SUFFIX = "URL variants.";
// i18n-disable-next-line
const HERO_LOGO_PRELOAD_FETCH_PRIORITY = "high";
// i18n-disable-next-line
const HERO_LOGO_PRELOAD_CROSS_ORIGIN = "anonymous";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Novita AI - AI & Agent Cloud for Developers",
    description:
      "Access 200+ AI models with one API. Launch secure agent sandboxes and GPU instances in minutes. Built for developers, priced for startups.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.HOME),
  };
}

export default function Page() {
  return (
    <main className="relative max-w-full overflow-x-clip bg-[var(--surface)]">
      <div className="sr-only">
        {AGENT_DIRECTIVE_PREFIX}{" "}
        <a href="/llms.txt">{AGENT_DIRECTIVE_LINK_LABEL}</a>
        {AGENT_DIRECTIVE_MARKDOWN} <code>{AGENT_DIRECTIVE_ACCEPT}</code>{" "}
        {AGENT_DIRECTIVE_SUFFIX} <code>{AGENT_DIRECTIVE_MD_VARIANTS}</code>{" "}
        {AGENT_DIRECTIVE_VARIANTS_SUFFIX}
      </div>
      <WebsiteNavbar />
      {/*
        Hero WebGL scene (remix-bg.json) distorts logo.png as one of its shader
        textures. Preload it at high priority from this server component so it's
        in cache before the Unicorn Studio SDK requests it — shaving the scene's
        init time and tightening the warmup/reveal alignment. The poster
        (16-3.png) is already preloaded via its `priority` <Image>.

        `crossOrigin="anonymous"` is required: the SDK fetches the texture with
        `img.crossOrigin="anonymous"` (CORS, credentials mode "same-origin") so
        the texture doesn't taint the WebGL canvas. A preload without it uses
        credentials mode "include", so the modes mismatch, the browser discards
        the preload ("preload is not used because the request credentials mode
        does not match"), and logo.png is fetched twice. Matching the mode lets
        the SDK reuse the preloaded response.
      */}
      <link
        rel="preload"
        as="image"
        href="/home/hero/unicon/logo.png"
        crossOrigin={HERO_LOGO_PRELOAD_CROSS_ORIGIN}
        fetchPriority={HERO_LOGO_PRELOAD_FETCH_PRIORITY}
      />
      <Hero />
      <LogoCloud />
      <HomeCampaignBanner />
      <Product />
      <WhyNovita />
      <BuiltWith />
      <Testimonials />
      <WhatsNew />
      <FooterSection />
    </main>
  );
}
