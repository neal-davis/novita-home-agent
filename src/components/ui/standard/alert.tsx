export default function Alert({
  title,
  content,
  className,
}: {
  title: string | React.ReactNode;
  content: (string | React.ReactNode)[];
  className?: string;
}) {
  return (
    <div
      className={`flex flex-row gap-2 px-4 py-3 rounded-md border-solid border-[1px] border-[var(--gray-2)] bg-[var(--gray-3)] ${className}`}
    >
      <span className="iconfont icon-notification"></span>
      <div className="font-small-console text-[var(--dark-2)]">
        {title && (
          <h2 className="font-subtle-medium text-black mb-2">{title}</h2>
        )}
        {content.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>
    </div>
  );
}
