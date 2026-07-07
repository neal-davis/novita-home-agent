"use client";

import { useEffect, useMemo, useState } from "react";
import type { PostSummary } from "@/lib/blog";
import PostCard from "./PostCard";
import TagFilter from "./TagFilter";

interface BlogIndexProps {
  posts: PostSummary[];
  tags: Array<{ tag: string; count: number }>;
}

/**
 * Client-side tag filtering over a server-rendered post list.
 *
 * The initial render (no filter) is what gets prerendered into the static HTML,
 * so every post is SEO-visible. After hydration we honour a `?tag=` query (e.g.
 * from a tag chip on an article page) without opting the route out of static
 * generation the way `useSearchParams` would.
 */
export default function BlogIndex({ posts, tags }: BlogIndexProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const tag = new URLSearchParams(window.location.search).get("tag");
    if (tag) setActiveTag(tag);
  }, []);

  const filtered = useMemo(
    () =>
      activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts,
    [posts, activeTag],
  );
  const featured = activeTag ? [] : filtered.filter((post) => post.isSticky);
  const featuredSlugs = new Set(featured.map((post) => post.slug));
  const rest = filtered.filter((post) => !featuredSlugs.has(post.slug));

  return (
    <>
      <TagFilter
        tags={tags}
        activeTag={activeTag}
        onSelect={setActiveTag}
        className="mb-space-32"
      />

      {filtered.length === 0 ? (
        <p className="py-space-48 text-paragraph-16 text-[var(--text-3)]">
          No articles found.
        </p>
      ) : (
        <>
          {featured.length > 0 ? (
            <section className="mb-space-40 grid gap-space-24 md:grid-cols-2">
              {featured.map((post) => (
                <PostCard key={post.slug} post={post} featured />
              ))}
            </section>
          ) : null}
          <section className="grid gap-space-24 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </section>
        </>
      )}
    </>
  );
}
