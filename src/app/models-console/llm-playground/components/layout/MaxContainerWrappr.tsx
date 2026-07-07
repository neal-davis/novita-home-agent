import { cn } from "@/lib/utils";
// import { PLAYGROUND_MAX_CONTENT_WIDTH } from "../../constants";

export function MaxContainerWrapper({
  children,
  className,
  width = undefined,
}: {
  children: React.ReactNode;
  className?: string;
  width?: number; // px
}) {
  return (
    <div
      className={cn("mx-auto w-full px-6", className)}
      style={{
        maxWidth: width !== undefined ? width : "100%",
      }}
    >
      {children}
    </div>
  );
}
