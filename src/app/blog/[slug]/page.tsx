import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import MDDocs from "@/components/ui/standard/md-docs";
import { CANONICAL_URL } from "@/constants/canonical";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";
import {
  formatPostDate,
  getAllSlugs,
  getPostBySlug,
  resolveMarkdownUrls,
} from "@/lib/blog";

// Prerender every article at build time (SSG) and refresh via ISR + the
// on-demand revalidate route. Articles added after a build render on first
// request (dynamicParams defaults to true).
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(props.params.slug);
  if (!post) {
    return { title: "Blog | Novita AI" };
  }
  return {
    title: post.title,
    description: post.description,
    alternates: getLocalizedMetadataAlternates(
      `${CANONICAL_URL.BLOG}/${post.slug}`,
      DEFAULT_LOCALE,
    ),
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function BlogArticlePage(props: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(props.params.slug);
  if (!post) notFound();

  const slugs = await getAllSlugs();
  const content = resolveMarkdownUrls(post.content, { knownSlugs: slugs });
  const date = formatPostDate(post.pubDate);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-light)]">
      <WebsiteNavbar />
      <main className="mx-auto w-full max-w-layout-content px-web pb-space-48 pt-[calc(var(--header-height)+var(--space-48))]">
        <Link
          href="/blog"
          className="text-paragraph-14 text-[var(--text-brand)] hover:underline"
        >
          ← Back to blog
        </Link>

        <header className="mt-space-20">
          <div className="flex flex-wrap items-center gap-space-8">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-[var(--fill-3)] px-space-12 py-space-4 text-paragraph-13 text-[var(--text-2)] hover:bg-[var(--fill-4)]"
              >
                {tag}
              </Link>
            ))}
          </div>
          <h1 className="mt-space-16 text-heading-h1 text-[var(--text-1)]">
            {post.title}
          </h1>
          <div className="mt-space-12 flex flex-wrap items-center gap-space-8 text-paragraph-14 text-[var(--text-4)]">
            {post.author ? <span>{post.author}</span> : null}
            {post.author && date ? <span>·</span> : null}
            {date ? <span>{date}</span> : null}
            {date && post.readingMinutes ? <span>·</span> : null}
            {post.readingMinutes ? (
              <span>{post.readingMinutes} min read</span>
            ) : null}
          </div>
        </header>

        {post.cover ? (
          <div className="relative mt-space-24 aspect-[16/9] w-full overflow-hidden rounded-12 bg-[var(--fill-3)]">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              sizes="(max-width: 1339px) 100vw, 1008px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <article className="mt-space-32">
          <MDDocs content={content} />
        </article>
      </main>
      <FooterSection />
    </div>
  );
}
