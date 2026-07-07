import Image from "next/image";
import Link from "next/link";
import { formatPostDate, type PostSummary } from "@/lib/blog";

interface PostCardProps {
  post: PostSummary;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const date = formatPostDate(post.pubDate);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-12 border border-[var(--border-default)] bg-white shadow-1 transition-shadow hover:shadow-3"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--fill-3)]">
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-paragraph-14 text-[var(--text-4)]">
            Novita AI
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-space-8 p-space-20">
        <div className="flex flex-wrap items-center gap-space-8">
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--fill-3)] px-space-8 py-space-2 text-paragraph-12 text-[var(--text-2)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2
          className={`line-clamp-2 text-[var(--text-1)] ${
            featured ? "text-heading-h4" : "text-heading-h5"
          }`}
        >
          {post.title}
        </h2>

        {post.description ? (
          <p className="line-clamp-3 text-paragraph-14 text-[var(--text-3)]">
            {post.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-space-8 pt-space-8 text-paragraph-13 text-[var(--text-4)]">
          {date ? <span>{date}</span> : null}
          {date && post.readingMinutes ? <span>·</span> : null}
          {post.readingMinutes ? (
            <span>{post.readingMinutes} min read</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
