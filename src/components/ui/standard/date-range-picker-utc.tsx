"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  parse,
  addSeconds,
  subDays,
  addDays,
  subWeeks,
  subMonths,
} from "date-fns";
import debounce from "lodash/debounce";
import clsx from "clsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar-utc";
import styles from "./date-range-picker-utc.module.scss";
import { enUS } from "date-fns/locale";
const commonDateRangePicker = {
  today: "Today",
  past7days: "Past 7 Days",
  lastweek: "Last Week",
  lastmonth: "Last Month",
  thisweek: "This Week",
  thismonth: "This Month",
  pickADate: "Pick a Date",
  startPlaceholder: "Start Date",
  endPlaceholder: "End Date",
};
const getUTCStartOfDayFromInstant = (date: Date): Date => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
};
const getUTCStartOfWeekMonday = (dateUTC: Date): Date => {
  const dow = dateUTC.getUTCDay();
  const offset = (dow + 6) % 7;
  const startMs = dateUTC.getTime() - offset * 24 * 60 * 60 * 1000;
  return getUTCStartOfDayFromInstant(new Date(startMs));
};
const getUTCEndOfWeekSunday = (dateUTC: Date): Date => {
  const start = getUTCStartOfWeekMonday(dateUTC);
  const endMs = start.getTime() + 6 * 24 * 60 * 60 * 1000;
  return getUTCStartOfDayFromInstant(new Date(endMs));
};
const getUTCStartOfMonth = (dateUTC: Date): Date => {
  return new Date(
    Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), 1, 0, 0, 0, 0),
  );
};
const getUTCEndOfMonth = (dateUTC: Date): Date => {
  const nextMonthFirst = new Date(
    Date.UTC(
      dateUTC.getUTCFullYear(),
      dateUTC.getUTCMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    ),
  );
  const endMs = nextMonthFirst.getTime() - 24 * 60 * 60 * 1000;
  return new Date(endMs);
};
const utcToLocal = (utcDate: Date): Date => {
  const ms = Date.UTC(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    0,
    0,
    0,
    0,
  );
  return new Date(ms);
};
const formatUTC = (utcDate: Date, dateFormat: string): string => {
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth();
  const date = utcDate.getUTCDate();
  let formatted = dateFormat;
  formatted = formatted.replace(/yyyy/g, String(year));
  formatted = formatted.replace(/yy/g, String(year).slice(-2));
  const monthStr = String(month + 1).padStart(2, "0");
  formatted = formatted.replace(/MM/g, monthStr);
  formatted = formatted.replace(/M/g, String(month + 1));
  const dateStr = String(date).padStart(2, "0");
  formatted = formatted.replace(/dd/g, dateStr);
  formatted = formatted.replace(/d/g, String(date));
  return formatted;
};
const parseUTC = (dateString: string, dateFormat: string): Date => {
  const parsed = parse(dateString, dateFormat, new Date());
  if (isNaN(parsed.getTime())) {
    return parsed;
  }
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const date = parsed.getDate();
  return new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
};
const utcToCalendarDate = (utcDate: Date): Date => {
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth();
  const date = utcDate.getUTCDate();
  return new Date(year, month, date, 0, 0, 0, 0);
};
const calendarDateToUTC = (calendarDate: Date): Date => {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const date = calendarDate.getDate();
  return new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
};
interface DateRangePickerProps {
  startTime: Date | undefined;
  endTime: Date | undefined;
  dateFormat?: string;
  allowEmpty?: boolean;
  onChange: (dates: { from: Date | undefined; to: Date | undefined }) => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: React.ComponentProps<typeof Calendar>["disabled"];
  quickSelectList?: (
    | "today"
    | "past7days"
    | "lastweek"
    | "lastmonth"
    | "thisweek"
    | "thismonth"
  )[];
}
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startTime,
  endTime,
  dateFormat = "MM/dd/yyyy",
  onChange,
  className,
  style,
  quickSelectList,
  allowEmpty,
  disabled,
}) => {
  const utcStartTime = useMemo(
    () => (startTime ? getUTCStartOfDayFromInstant(startTime) : undefined),
    [startTime],
  );
  const utcEndTime = useMemo(
    () => (endTime ? getUTCStartOfDayFromInstant(endTime) : undefined),
    [endTime],
  );
  const [open, setOpen] = useState(false);
  const [inputStartTime, setInputStartTime] = useState(
    utcStartTime ? formatUTC(utcStartTime, dateFormat) : "",
  );
  const [inputEndTime, setInputEndTime] = useState(
    utcEndTime ? formatUTC(utcEndTime, dateFormat) : "",
  );
  useEffect(() => {
    setInputStartTime(utcStartTime ? formatUTC(utcStartTime, dateFormat) : "");
    setInputEndTime(utcEndTime ? formatUTC(utcEndTime, dateFormat) : "");
  }, [utcStartTime, utcEndTime, dateFormat]);
  const debouncedOnChange = useMemo(
    () =>
      debounce((utcDates: { from: Date | undefined; to: Date | undefined }) => {
        const localDates = {
          from: utcDates.from ? utcToLocal(utcDates.from) : undefined,
          to: utcDates.to ? utcToLocal(utcDates.to) : undefined,
        };
        onChange(localDates);
      }, 1500),
    [onChange],
  );
  const handleInputClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation();
      setOpen(true);
      setTimeout(() => (e.target as HTMLInputElement).focus(), 200);
    },
    [],
  );
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
      if (type === "start") {
        setInputStartTime(e.target.value);
        const parsedDate = parseUTC(e.target.value, dateFormat);
        if (!isNaN(parsedDate.getTime())) {
          debouncedOnChange({
            from: parsedDate,
            to: utcEndTime,
          });
        } else {
          debouncedOnChange({
            from: utcStartTime,
            to: utcEndTime,
          });
        }
      } else {
        setInputEndTime(e.target.value);
        const parsedDate = parseUTC(e.target.value, dateFormat);
        if (!isNaN(parsedDate.getTime())) {
          debouncedOnChange({
            from: utcStartTime,
            to: parsedDate,
          });
        } else {
          debouncedOnChange({
            from: utcStartTime,
            to: utcEndTime,
          });
        }
      }
    },
    [utcStartTime, utcEndTime, dateFormat, debouncedOnChange],
  );
  const handleQuickSelect = useCallback(
    (item: string) => {
      setOpen(false);
      const utcNow = getUTCStartOfDayFromInstant(new Date());
      let from = utcNow;
      let to = utcNow;
      switch (item) {
        case "today":
          break;
        case "past7days":
          from = subDays(utcNow, 6);
          to = utcNow;
          // Adjust to ensure the displayed local calendar range is exactly 7 days
          {
            const fromCal = utcToCalendarDate(from);
            const toCal = utcToCalendarDate(to);
            const startLocalMidnight = new Date(
              fromCal.getFullYear(),
              fromCal.getMonth(),
              fromCal.getDate(),
              0,
              0,
              0,
              0,
            );
            const endLocalMidnight = new Date(
              toCal.getFullYear(),
              toCal.getMonth(),
              toCal.getDate(),
              0,
              0,
              0,
              0,
            );
            const msPerDay = 24 * 60 * 60 * 1000;
            const diffInclusive =
              Math.round(
                (endLocalMidnight.getTime() - startLocalMidnight.getTime()) /
                  msPerDay,
              ) + 1;
            if (diffInclusive > 7) {
              from = addDays(from, diffInclusive - 7);
            } else if (diffInclusive < 7) {
              from = subDays(from, 7 - diffInclusive);
            }
          }
          break;
        case "lastweek":
          {
            const lastWeekRef = subWeeks(utcNow, 1);
            const start = getUTCStartOfWeekMonday(lastWeekRef);
            const end = getUTCEndOfWeekSunday(lastWeekRef);
            from = start;
            to = addSeconds(end, 1);
          }
          break;
        case "lastmonth":
          {
            const lastMonthRef = subMonths(utcNow, 1);
            const start = getUTCStartOfMonth(lastMonthRef);
            const end = getUTCEndOfMonth(lastMonthRef);
            from = start;
            to = addSeconds(end, 1);
          }
          break;
        case "thisweek":
          {
            const start = getUTCStartOfWeekMonday(utcNow);
            const end = getUTCEndOfWeekSunday(utcNow);
            from = start;
            to = addSeconds(end, 1);
          }
          break;
        case "thismonth":
          {
            const start = getUTCStartOfMonth(utcNow);
            const end = getUTCEndOfMonth(utcNow);
            from = start;
            to = addSeconds(end, 1);
          }
          break;
        default:
          break;
      }
      onChange({
        from: utcToLocal(from),
        to: utcToLocal(to),
      });
    },
    [onChange],
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={clsx(
          "w-[300px] justify-start text-left font-normal",
          !utcStartTime && "text-muted-foreground",
          styles.date_button,
          open ? styles.date_button_active : "",
          (!utcStartTime || !utcEndTime) &&
            !open &&
            !allowEmpty &&
            styles.date_button_warning,
          className,
        )}
        style={style}
      >
        <span className="font-subtle-demibold text-[var(--dark-4)] shrink-0">
          UTC+0
        </span>
        <span className="w-[1px] h-[12px] ml-[10px] bg-[var(--gray-1)] shrink-0"></span>
        {open || (utcStartTime && utcEndTime) ? (
          <>
            <input
              type="text"
              value={inputStartTime}
              placeholder={"Start Date"}
              className={styles.date_input}
              onClick={handleInputClick}
              onChange={(e) => handleInputChange(e, "start")}
            />
            <span
              className="iconfont icon-calendar-right mx-1"
              style={{ fontSize: 18 }}
            ></span>
            <input
              type="text"
              value={inputEndTime}
              className={styles.date_input}
              placeholder={"End Date"}
              onClick={handleInputClick}
              onChange={(e) => handleInputChange(e, "end")}
            ></input>
          </>
        ) : (
          <span className={allowEmpty ? "ml-[10px]" : styles.empty_date_tips}>
            {"Pick a Date"}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-1000" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={
            utcStartTime ? utcToCalendarDate(utcStartTime) : undefined
          }
          today={utcToCalendarDate(getUTCStartOfDayFromInstant(new Date()))}
          selected={{
            from: utcStartTime ? utcToCalendarDate(utcStartTime) : undefined,
            to: utcEndTime ? utcToCalendarDate(utcEndTime) : undefined,
          }}
          onSelect={(range) => {
            onChange({
              from: range?.from
                ? utcToLocal(calendarDateToUTC(range.from))
                : undefined,
              to: range?.to
                ? utcToLocal(calendarDateToUTC(range.to))
                : undefined,
            });
          }}
          numberOfMonths={2}
          locale={enUS}
          disabled={disabled}
        />
        <div className={styles.date_footer}>
          {(
            quickSelectList || [
              "today",
              "past7days",
              "lastweek",
              "lastmonth",
              "thisweek",
              "thismonth",
            ]
          ).map((item) => (
            <span key={item} onClick={() => handleQuickSelect(item)}>
              {commonDateRangePicker[item]}
            </span>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
export default DateRangePicker;
