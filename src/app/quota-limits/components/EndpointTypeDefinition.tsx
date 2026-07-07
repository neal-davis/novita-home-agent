import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function EndpointTypeDefinition() {
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
        Indicates whether the endpoint is public (shared infrastructure) or
        dedicated (exclusive resources). Rate limits and billing vary by type.
      </HoverCardContent>
    </HoverCard>
  );
}
export default EndpointTypeDefinition;
