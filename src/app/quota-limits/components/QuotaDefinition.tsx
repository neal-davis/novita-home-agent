import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const QUOTA_LIMIT_DEFINITION = {
  RPM: "Requests Per Minute",
  TPM: "Tokens Per Minute",
  IPM: "Images Per Minute",
};

function QuotaDefinition() {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <span
          className="iconfont icon-badge-help ml-2"
          style={{ color: "var(--dark-3)" }}
        ></span>
      </HoverCardTrigger>
      <HoverCardContent className="w-50 flex flex-col gap-2">
        {Object.entries(QUOTA_LIMIT_DEFINITION).map(([key, value]) => (
          <span key={key} className="font-subtle block">
            <span
              className="font-subtle-medium min-w-[42px] inline-block"
              style={{ color: "var(--dark-1)" }}
            >
              {key}
              <span className="font-subtle mr-2">:</span>
            </span>
            <span style={{ color: "var(--dark-2)" }}>{value}</span>
          </span>
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}
export default QuotaDefinition;
