import { UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PartnerTag({
  size = 12,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1 items-center bg-common-gray-3 text-common-dark-1 rounded px-[6px]",
        className,
      )}
    >
      <UsersRound size={size} />
      <p className="leading-none" style={{ fontSize: `${size}px` }}>
        Partner
      </p>
    </div>
  );
}
