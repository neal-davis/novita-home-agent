import type { Metadata } from "next";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { CANONICAL_URL } from "@/constants/canonical";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";
import { getAllPosts, getAllTags } from "@/lib/blog";
import BlogIndex from "./components/BlogIndex";

// Static (SSG) + ISR: prerendered at build with the full post list in the HTML
// (SEO-visible); tag filtering happens client-side in BlogIndex.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog | Novita AI",
    description:
      "Product news, partnerships and research from Novita AI — guides, integrations and deep dives on AI inference.",
    alternates: getLocalizedMetadataAlternates(
      CANONICAL_URL.BLOG,
      DEFAULT_LOCALE,
    ),
  };
}

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([getAllPosts(), getAllTags()]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-light)]">
      <WebsiteNavbar />
      <main className="mx-auto w-full max-w-layout-content px-web pb-space-48 pt-[calc(var(--header-height)+var(--space-48))]">
        <header className="mb-space-32">
          <h1 className="text-heading-h1 text-[var(--text-1)]">Blog</h1>
          <p className="mt-space-12 max-w-2xl text-paragraph-18 text-[var(--text-3)]">
            Product news, partnerships and research from Novita AI.
          </p>
        </header>

        <BlogIndex posts={posts} tags={tags} />
      </main>
      <FooterSection />
    </div>
  );
}
