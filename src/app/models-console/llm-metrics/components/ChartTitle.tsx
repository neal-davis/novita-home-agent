import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function ChartTitle({
  title,
  help,
}: {
  title: string;
  help?: React.ReactNode;
}) {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <div className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-black px-0">
            <span className="hover:underline">{title}</span>
          </span>
          <span className="iconfont icon-badge-help"></span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="text-sm">{help}</div>
      </HoverCardContent>
    </HoverCard>
  );
}
