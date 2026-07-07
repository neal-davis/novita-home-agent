/**
 * Section eyebrow component - green dot + label with divider line
 * Used as the section header pattern across the sandbox page
 */
export default function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex w-full min-w-0 items-center gap-2 border-b border-border-strong pb-2">
        <span className="h-2 w-2 rounded-full bg-[var(--brand-0)]" />
        <span className="font-mono-13 uppercase text-[var(--dark-2)]">
          {label}
        </span>
      </div>
    </div>
  );
}
