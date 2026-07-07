"use client";

import { cn } from "@/lib/utils";

type SkeletonProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  active?: boolean;
  loading?: boolean;
  paragraph?: {
    rows?: number;
    width?: string | number | Array<string | number>;
  };
  title?: React.HTMLAttributes<HTMLDivElement>["title"] | boolean;
};

function Skeleton({
  className,
  children,
  active: _active,
  loading,
  paragraph,
  title: _title,
  ...props
}: SkeletonProps) {
  if (loading === false) {
    return <>{children}</>;
  }

  if (paragraph?.rows && paragraph.rows > 1) {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: paragraph.rows }).map((_, index) => (
          <div
            key={index}
            className="h-4 animate-pulse rounded-md bg-muted-light"
            style={{
              width: Array.isArray(paragraph.width)
                ? paragraph.width[index]
                : paragraph.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted-light", className)}
      {...props}
    />
  );
}

function SkeletonButton({
  className,
  block,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  block?: boolean;
}) {
  return (
    <Skeleton
      className={cn("h-8 rounded-md", block ? "w-full" : "w-24", className)}
      {...props}
    />
  );
}

Skeleton.Button = SkeletonButton;

export { Skeleton };
