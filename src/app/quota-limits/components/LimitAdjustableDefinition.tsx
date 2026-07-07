import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function LimitAdjustableDefinition() {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <span
          className="iconfont icon-badge-help ml-2"
          style={{ color: "var(--dark-3)" }}
        ></span>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-64 max-w-64 whitespace-pre-wrap font-subtle"
        style={{ color: "var(--dark-2)" }}
      >
        Indicates whether this rate limit can be increased or decreased upon
        request.
      </HoverCardContent>
    </HoverCard>
  );
}
export default LimitAdjustableDefinition;
