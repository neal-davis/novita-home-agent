import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Loading({
  className,
  color,
  spinSize,
  children,
}: {
  className?: string;
  color?: string;
  spinSize?: number;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute w-full h-full top-0 left-0 bg-white/50 flex flex-col gap-6 justify-center items-center",
        className,
      )}
    >
      <Loader2 color={color} className="animate-spin" size={spinSize} />
      {children}
    </div>
  );
}
