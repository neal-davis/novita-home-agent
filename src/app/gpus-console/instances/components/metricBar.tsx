import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";

export default function MetricBar({
  data,
  className,
  descClassName = "",
}: {
  data: any;
  className?: string;
  descClassName?: string;
}) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {data.map((item: any, index: number) => (
          <div key={index} className="w-full flex items-center gap-2">
            {item?.tooltip ? (
              <Tooltip title={item.tooltip} placement="top">
                <span
                  className={`font-small-console cursor-pointer ${className}`}
                >
                  {item.name}
                </span>
              </Tooltip>
            ) : (
              <span className={`font-small-console ${className}`}>
                {item.name}
              </span>
            )}

            <div className="w-full h-[6px] bg-[var(--gray-1)] rounded-[20px] relative">
              <div
                className={`absolute top-0 left-0 h-full bg-[var(--brand-1)] rounded-[20px]`}
                style={{ width: `${Math.min(Number(item.value || 0), 100)}%` }}
              ></div>
            </div>
            <span
              className={`font-small-console-medium text-left min-w-[50px] ${descClassName} ${
                Number(Number(item.value || 0).toFixed(2)) <= 0
                  ? "!text-[var(--dark-2)]"
                  : "text-[var(--brand-1)]"
              }`}
            >
              {Math.min(Number(item.value || 0), 100).toFixed(2)}%
              {item?.desc && (
                <span className="text-[var(--dark-2)] ml-1">({item.desc})</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
