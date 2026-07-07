import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

function TierQuotaInfo({ data }: { data: { tier: string; quota: number }[] }) {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <Button variant="link" className="p-0 !text-sm">
          Details
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-50 flex flex-col gap-2">
        {(data || []).map((item, index) => (
          <span key={index} className="font-subtle block">
            <span
              className="font-subtle min-w-[42px] inline-block"
              style={{ color: "var(--dark-1)" }}
            >
              {item.tier}
              <span className="font-subtle ml-[2px]">:</span>
            </span>
            <span style={{ color: "var(--dark-2)" }}>{item.quota}</span>
          </span>
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}
export default TierQuotaInfo;
