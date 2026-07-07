"use client";

interface TagFilterProps {
  tags: Array<{ tag: string; count: number }>;
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
  className?: string;
}

const PILL_BASE =
  "rounded-full px-space-16 py-space-6 text-paragraph-14 transition-colors";
const PILL_ACTIVE = "bg-[var(--text-1)] text-white";
const PILL_IDLE =
  "bg-[var(--fill-3)] text-[var(--text-2)] hover:bg-[var(--fill-4)]";

export default function TagFilter({
  tags,
  activeTag,
  onSelect,
  className,
}: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-space-8 ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`${PILL_BASE} ${activeTag === null ? PILL_ACTIVE : PILL_IDLE}`}
        aria-pressed={activeTag === null}
      >
        All
      </button>
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(tag)}
          className={`${PILL_BASE} ${activeTag === tag ? PILL_ACTIVE : PILL_IDLE}`}
          aria-pressed={activeTag === tag}
        >
          {tag} <span className="text-[var(--text-4)]">({count})</span>
        </button>
      ))}
    </div>
  );
}
