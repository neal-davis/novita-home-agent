import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function SelectRefreshInterval({
  onSelect,
  onRefresh,
  className,
}: {
  onSelect: (member: any | null) => void;
  onRefresh: any;
  className?: string;
}) {
  const [filterMember, setFilterMember] = useState<any | null | undefined>({
    label: "15s",
    value: 15,
  });
  const [filterMemberOpen, setFilterMemberOpen] = useState(false);
  const [allTemplates] = useState<any[]>([
    {
      label: "Off",
      value: 0,
    },
    {
      label: "15s",
      value: 15,
    },
    {
      label: "30s",
      value: 30,
    },
    {
      label: "1m",
      value: 60,
    },
  ]);

  const [nowDate, setNowDate] = useState(new Date().getTime());
  const [startDate, setStartDate] = useState(new Date().getTime());
  const timerHandler = useRef<any>();
  useEffect(() => {
    if (filterMember?.value > 0) {
      timerHandler.current = setInterval(() => {
        if (filterMember?.value > 0) {
          const nowDateStrap = new Date().getTime();
          setNowDate(nowDateStrap);
          console.log(filterMember?.value, Math.round((nowDateStrap - startDate) / 1000));
          if (
            filterMember?.value > 0 &&
            filterMember?.value -
              Math.round((nowDateStrap - startDate) / 1000) <=
              0
          ) {
            onRefresh && onRefresh();
            setStartDate(nowDateStrap);
          }
        } else {
          const nowDateStrap = new Date().getTime();
          setNowDate(nowDateStrap);
          setStartDate(nowDateStrap);
        }
      }, 1000);
    } else {
      if (timerHandler.current) {
        clearInterval(timerHandler.current);
      }
    }
    return () => {
      if (timerHandler.current) {
        clearInterval(timerHandler.current);
      }
    };
  }, [filterMember, onRefresh, startDate, nowDate]);

  return (
    <Popover open={filterMemberOpen} onOpenChange={setFilterMemberOpen}>
      <PopoverTrigger
        className={cn(
          "w-fit !border-none !bg-transparent !p-0 h-8 flex flex-row items-center justify-center",
          className,
        )}
      >
        <span className="!flex flex-row items-center justify-center">
          <span className="text-[var(--dark-1)] mr-[6px]">Auto-refresh</span>
          <span className="text-[var(--red-1)] mr-[6px] w-[20px]">
            {filterMember?.value > 0
              ? Math.max(
                  Math.min(
                    filterMember?.value,
                    filterMember?.value -
                      Math.round((nowDate - startDate) / 1000),
                  ),
                  0,
                ).toFixed(0) + "s"
              : filterMember?.label || "/"}
          </span>
          {/* <span className="text-[var(--red-1)] mr-[6px]">
            {filterMember?.label}
          </span> */}
          <img
            className="inline-block cursor-pointer hover:opacity-50"
            src="/sandbox/console/upDown.svg"
            alt=""
            width={16}
            height={16}
          />
        </span>
        {/* <ChevronDown size={16} className="opacity-50 ml-1" /> */}
      </PopoverTrigger>
      <PopoverContent align="start" className="min-w-[136px] w-fit p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {allTemplates.map((m: any) => (
                <CommandItem
                  className="flex flex-col items-start py-2"
                  key={m.value}
                  value={`${m.value}`}
                  onSelect={() => {
                    setFilterMember({
                      value: m.value,
                      label: m.label,
                    });
                    setFilterMemberOpen(false);
                    onSelect({
                      value: m.value,
                      label: m.label,
                    });
                    // if (m.value <= 0) {
                    const nowDateStrap = new Date().getTime();
                    setNowDate(nowDateStrap);
                    setStartDate(nowDateStrap);
                    // }
                  }}
                >
                  <div className="flex w-full justify-start items-center gap-2">
                    <div className="flex items-center gap-1 ml-2">
                      {m.value === filterMember?.value ? (
                        <Check size={16} className="ml-auto" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span>{m.label}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
