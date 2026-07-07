"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import styles from "./DateTimePicker.module.scss";
// import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { Calendar } from "@/components/ui/calendar-utc";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";

// Helpers to handle UTC display and local emission
const pad2 = (n: number) => String(n).padStart(2, "0");

const formatUTC = (date: Date, pattern: string): string => {
  if (!date) return "";
  // Support a minimal subset similar to Dayjs: YYYY, YY, MM, M, DD, D, HH, H, mm, m, ss, s
  const map: Record<string, string> = {
    YYYY: String(date.getUTCFullYear()),
    YY: String(date.getUTCFullYear()).slice(-2),
    MM: pad2(date.getUTCMonth() + 1),
    M: String(date.getUTCMonth() + 1),
    DD: pad2(date.getUTCDate()),
    D: String(date.getUTCDate()),
    HH: pad2(date.getUTCHours()),
    H: String(date.getUTCHours()),
    mm: pad2(date.getUTCMinutes()),
    m: String(date.getUTCMinutes()),
    ss: pad2(date.getUTCSeconds()),
    s: String(date.getUTCSeconds()),
  };
  // Replace tokens longest-first to avoid partial overlaps
  return Object.keys(map)
    .sort((a, b) => b.length - a.length)
    .reduce(
      (acc, token) => acc.replace(new RegExp(token, "g"), map[token]),
      pattern,
    );
};

const getUTCStartOfDayFromInstant = (instant: Date): Date => {
  return new Date(
    Date.UTC(
      instant.getUTCFullYear(),
      instant.getUTCMonth(),
      instant.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
};

const utcToCalendarDate = (utcDate: Date): Date => {
  // Convert a UTC date (00:00 UTC) into a calendar local date instance
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    0,
    0,
    0,
    0,
  );
};

const calendarDateToUTC = (calendarDate: Date): Date => {
  // Treat a calendar-chosen local date as a UTC day
  return new Date(
    Date.UTC(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      calendarDate.getDate(),
      0,
      0,
      0,
      0,
    ),
  );
};

const utcToLocal = (utcDate: Date): Date => {
  // Represent the same UTC midnight instant as a JS Date
  const ms = Date.UTC(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds(),
    utcDate.getUTCMilliseconds(),
  );
  return new Date(ms);
};

function createQuickRanges() {
  return [
    {
      label: "5M",
      getRange: () => {
        const from = dayjs().subtract(5, "minute").toDate();
        const to = dayjs().toDate();
        return { from, to };
      },
    },
    {
      label: "10M",
      getRange: () => {
        const from = dayjs().subtract(10, "minute").toDate();
        const to = dayjs().toDate();
        return { from, to };
      },
    },
    {
      label: "30M",
      getRange: () => {
        const from = dayjs().subtract(30, "minute").toDate();
        const to = dayjs().toDate();
        return { from, to };
      },
    },
    {
      label: "1H",
      getRange: () => {
        const from = dayjs().subtract(1, "hour").toDate();
        const to = dayjs().toDate();
        return { from, to };
      },
    },
    {
      label: "3H",
      getRange: () => {
        const from = dayjs().subtract(3, "hour").toDate();
        const to = dayjs().toDate();
        return { from, to };
      },
    },
    {
      label: "12H",
      getRange: () => {
        const from = dayjs().subtract(12, "hour").toDate();
        const to = dayjs().toDate();
        return { from, to };
      },
    },
    {
      label: "1D",
      getRange: () => {
        const from = dayjs().subtract(1, "day").toDate();
        const to = dayjs().toDate();
        return { from, to };
      },
    },
    {
      label: "3D",
      getRange: () => {
        const from = dayjs().subtract(3, "day").toDate();
        const to = dayjs().toDate();
        return { from, to };
      },
    },
    {
      label: "7D",
      getRange: () => {
        const from = dayjs().subtract(7, "day").toDate();
        const to = dayjs().toDate();
        return { from, to };
      },
    },
  ];
}

export function DateTimePicker({
  range,
  format = "MM/DD/YYYY HH:mm:ss",
  onChange,
}: {
  range: DateRange | undefined;
  format?: string;
  onChange?: (date: DateRange | undefined) => void;
}) {
  const quickRanges = createQuickRanges();
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("00:00");

  useEffect(() => {
    if (range?.from) {
      const hours = pad2(range.from.getUTCHours());
      const minutes = pad2(range.from.getUTCMinutes());
      setFromTime(`${hours}:${minutes}`);
    }
    if (range?.to) {
      const hours = pad2(range.to.getUTCHours());
      const minutes = pad2(range.to.getUTCMinutes());
      setToTime(`${hours}:${minutes}`);
    }
  }, [range]);

  const utcStart = range?.from
    ? getUTCStartOfDayFromInstant(range.from)
    : undefined;
  const utcEnd = range?.to ? getUTCStartOfDayFromInstant(range.to) : undefined;
  const selectedRangeForCalendar: DateRange | undefined = utcStart
    ? ({
        from: utcToCalendarDate(utcStart),
        to: utcEnd ? utcToCalendarDate(utcEnd) : undefined,
      } as DateRange)
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="bg-white font-tt-mono"
          style={{
            letterSpacing: "unset",
          }}
        >
          {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
          <span className="mr-[10px] text-[var(--dark-4)]">UTC+0</span>
          <span className="w-[1px] h-[12px] mr-[10px] bg-[var(--gray-1)]"></span>
          {range ? (
            <div>
              <span>{range.from ? formatUTC(range.from, format) : ""}</span>
              <span className="px-2">-</span>
              <span>{range.to ? formatUTC(range.to, format) : ""}</span>
            </div>
          ) : (
            <span className="text-common-dark-3">Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[560px]">
        <div className="flex flex-col gap-2 items-center">
          <h6 className={styles.sub_title}>Quick Select:</h6>
          <div className={styles.tag_container}>
            {quickRanges.map((range) => (
              <Button
                variant="ghost"
                key={range.label}
                onClick={() => onChange?.(range.getRange())}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        <h6 className={styles.sub_title}>Date picker:</h6>
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selectedRangeForCalendar as any}
          onSelect={(value) => {
            if (value) {
              const fromUTC = value.from
                ? calendarDateToUTC(value.from)
                : undefined;
              const toUTC = value.to ? calendarDateToUTC(value.to) : undefined;
              const fromLocal = fromUTC ? utcToLocal(fromUTC) : undefined;
              const toLocal = toUTC ? utcToLocal(toUTC) : undefined;
              if (fromLocal) {
                const [fh, fm] = fromTime.split(":").map((s) => Number(s));
                fromLocal.setHours(fh || 0, fm || 0, 0, 0);
              }
              if (toLocal) {
                const [th, tm] = toTime.split(":").map((s) => Number(s));
                toLocal.setHours(th || 0, tm || 0, 0, 0);
              }
              if (!fromLocal && !toLocal) {
                onChange?.(undefined);
              } else if (fromLocal) {
                onChange?.({ from: fromLocal, to: toLocal });
              } else {
                onChange?.(undefined);
              }
            }
          }}
          disabled={[
            {
              before: dayjs().subtract(14, "day").toDate(),
              after: dayjs().toDate(),
            },
          ]}
        />
        <div className="w-full flex gap-5">
          <div className="w-full flex items-center gap-2">
            <span className="font-medium text-sm pl-2">Start Time:</span>
            <Input
              type="time"
              className="text-xs border-gray-300 rounded-md w-auto"
              onChange={(e) => {
                setFromTime(e.target.value);
              }}
              value={fromTime}
            />
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="font-medium text-sm pl-2">End Time:</span>
            <Input
              type="time"
              className="text-xs border-gray-300 rounded-md w-auto"
              onChange={(e) => {
                setToTime(e.target.value);
              }}
              value={toTime}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
