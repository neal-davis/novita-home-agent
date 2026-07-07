"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TimePreset = {
  label: string;
  ms: number;
  value: string;
};

function createTimePresetGroups(): Array<{
  presets: TimePreset[];
  unit: string;
}> {
  return [
    {
      unit: "minutes",
      presets: [
        { value: "5m", label: "Last 5 minutes", ms: 5 * 60 * 1000 },
        { value: "15m", label: "Last 15 minutes", ms: 15 * 60 * 1000 },
        { value: "30m", label: "Last 30 minutes", ms: 30 * 60 * 1000 },
      ],
    },
    {
      unit: "hours",
      presets: [
        { value: "1h", label: "Last 1 hour", ms: 60 * 60 * 1000 },
        { value: "3h", label: "Last 3 hours", ms: 3 * 60 * 60 * 1000 },
        { value: "6h", label: "Last 6 hours", ms: 6 * 60 * 60 * 1000 },
        { value: "12h", label: "Last 12 hours", ms: 12 * 60 * 60 * 1000 },
        { value: "24h", label: "Last 24 hours", ms: 24 * 60 * 60 * 1000 },
      ],
    },
    {
      unit: "days",
      presets: [
        { value: "2d", label: "Last 2 days", ms: 2 * 24 * 60 * 60 * 1000 },
        { value: "7d", label: "Last 7 days", ms: 7 * 24 * 60 * 60 * 1000 },
      ],
    },
  ];
}

// Format date as YY/MM/DD (UTC+0)
const formatDateShort = (date: Date) => {
  const yy = date.getUTCFullYear().toString().slice(2);
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = date.getUTCDate().toString().padStart(2, "0");
  return `${yy}/${mm}/${dd}`;
};

// Format time as HH:MM:SS (UTC+0)
const formatTime = (date: Date) => {
  const hh = date.getUTCHours().toString().padStart(2, "0");
  const mm = date.getUTCMinutes().toString().padStart(2, "0");
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

// Parse time string to hours, minutes, seconds
const parseTime = (timeStr: string): [number, number, number] => {
  const parts = timeStr.split(":").map(Number);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
};

interface TimeRange {
  type: "preset" | "custom";
  value: string;
  label: string;
  startTime?: number;
  endTime?: number;
}

interface MultiDimensionalTimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function MultiDimensionalTimeRangePicker({
  value,
  onChange,
}: MultiDimensionalTimeRangePickerProps) {
  const [open, setOpen] = useState(false);

  // Calendar state
  const [viewDate, setViewDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Get calendar data (UTC+0)
  const calendarData = useMemo(() => {
    const year = viewDate.getUTCFullYear();
    const month = viewDate.getUTCMonth();

    const firstDay = new Date(Date.UTC(year, month, 1));
    const startDay = new Date(firstDay);
    const dayOfWeek = firstDay.getUTCDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDay.setUTCDate(startDay.getUTCDate() - daysToSubtract);

    const days: Date[] = [];
    const current = new Date(startDay);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return { year, month, days };
  }, [viewDate]);

  const isCurrentMonth = (date: Date) =>
    date.getUTCMonth() === calendarData.month;

  const isSelected = (date: Date) => {
    if (
      startDate &&
      date.toUTCString().slice(0, 16) === startDate.toUTCString().slice(0, 16)
    )
      return true;
    if (
      endDate &&
      date.toUTCString().slice(0, 16) === endDate.toUTCString().slice(0, 16)
    )
      return true;
    return false;
  };

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const isFutureDate = (date: Date) => {
    const now = new Date();
    // Compare using UTC timestamps at day level
    const dateUTC = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    );
    const nowUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    return dateUTC > nowUTC;
  };

  const handleDateClick = (date: Date) => {
    // Don't allow selecting future dates
    if (isFutureDate(date)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const navigateMonth = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setUTCMonth(newDate.getUTCMonth() + delta);
    setViewDate(newDate);
  };

  const timePresetGroups = createTimePresetGroups();

  const handlePresetSelect = (preset: TimePreset) => {
    onChange({
      type: "preset",
      value: preset.value,
      label: preset.label,
    });
    setOpen(false);
  };

  const handleApplyCustom = () => {
    if (!startDate || !endDate) return;

    // Use smart defaults for empty time inputs
    const now = new Date();
    const finalStartTime = startTime.trim() || "00:00:00";

    // For end time: if selecting today and no input, use current time; otherwise use end of day
    let finalEndTime = endTime.trim();
    if (!finalEndTime) {
      const isToday =
        endDate.getUTCFullYear() === now.getUTCFullYear() &&
        endDate.getUTCMonth() === now.getUTCMonth() &&
        endDate.getUTCDate() === now.getUTCDate();
      finalEndTime = isToday ? formatTime(now) : "23:59:59";
    }

    const [sh, sm, ss] = parseTime(finalStartTime);
    const [eh, em, es] = parseTime(finalEndTime);

    // Create timestamps using UTC+0
    const start = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
        sh,
        sm,
        ss,
        0,
      ),
    );

    const end = new Date(
      Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate(),
        eh,
        em,
        es,
        999,
      ),
    );

    const label = `${formatDateShort(start)} ${finalStartTime} - ${formatDateShort(end)} ${finalEndTime}`;

    onChange({
      type: "custom",
      value: "custom",
      label,
      startTime: start.getTime(),
      endTime: end.getTime(),
    });
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      if (value.type === "custom" && value.startTime && value.endTime) {
        setStartDate(new Date(value.startTime));
        setEndDate(new Date(value.endTime));
        setStartTime(formatTime(new Date(value.startTime)));
        setEndTime(formatTime(new Date(value.endTime)));
      } else {
        setStartDate(null);
        setEndDate(null);
        setStartTime("");
        setEndTime("");
      }
    }
  }, [open, value]);

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[200px] w-auto h-8 px-3 font-small text-[var(--dark-1)] border-[var(--gray-2)] justify-between"
        >
          <span>{value.label}</span>
          <ChevronDown className="w-4 h-4 text-[var(--dark-3)] ml-2 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-[var(--gray-2)]"
        align="start"
        sideOffset={4}
      >
        <div className="flex">
          {/* Left panel: Presets grouped by unit */}
          <div className="w-[180px] border-r border-[var(--gray-2)] py-2">
            <div className="max-h-[320px] overflow-y-auto">
              {timePresetGroups.map((group, groupIndex) => (
                <div key={group.unit}>
                  {groupIndex > 0 && (
                    <div className="mx-3 my-1.5 border-t border-[var(--gray-2)]" />
                  )}
                  {group.presets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      className={cn(
                        "w-full text-left px-3 py-1.5 font-small transition-colors",
                        value.type === "preset" && value.value === preset.value
                          ? "bg-[var(--gray-3)] text-[var(--dark-1)] font-medium"
                          : "text-[var(--dark-2)] hover:bg-[var(--gray-3)] hover:text-[var(--dark-1)]",
                      )}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Calendar */}
          <div className="w-[280px] p-3">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                className="p-0.5 hover:bg-[var(--gray-3)] rounded transition-colors"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="w-4 h-4 text-[var(--dark-2)]" />
              </button>
              <span className="font-small font-medium text-[var(--dark-1)]">
                {calendarData.year} /{" "}
                {String(calendarData.month + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                className="p-0.5 hover:bg-[var(--gray-3)] rounded transition-colors"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="w-4 h-4 text-[var(--dark-2)]" />
              </button>
            </div>

            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center font-small text-[var(--dark-3)] py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarData.days.map((date, index) => {
                const selected = isSelected(date);
                const inRange = isInRange(date);
                const currentMonth = isCurrentMonth(date);
                const isFuture = isFutureDate(date);

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={isFuture}
                    className={cn(
                      "w-8 h-8 rounded font-small transition-colors",
                      !currentMonth && "text-[var(--dark-4)]",
                      isFuture &&
                        "text-[var(--dark-4)] cursor-not-allowed opacity-40",
                      currentMonth &&
                        !selected &&
                        !inRange &&
                        !isFuture &&
                        "text-[var(--dark-1)] hover:bg-[var(--gray-3)]",
                      selected && !isFuture && "bg-[var(--brand-0)] text-white",
                      inRange &&
                        !selected &&
                        !isFuture &&
                        "bg-[var(--brand-3)] text-[var(--dark-1)]",
                    )}
                    onClick={() => handleDateClick(date)}
                  >
                    {date.getUTCDate()}
                  </button>
                );
              })}
            </div>

            {/* Time inputs */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="font-small text-[var(--dark-3)] mb-1 block">
                  Start {startDate ? formatDateShort(startDate) : ""}
                </label>
                <Input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="00:00:00"
                  className="h-7 font-small text-[var(--dark-1)] border-[var(--gray-2)]"
                />
              </div>
              <div>
                <label className="font-small text-[var(--dark-3)] mb-1 block">
                  End {endDate ? formatDateShort(endDate) : ""}
                </label>
                <Input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder={
                    endDate &&
                    endDate.getUTCFullYear() === new Date().getUTCFullYear() &&
                    endDate.getUTCMonth() === new Date().getUTCMonth() &&
                    endDate.getUTCDate() === new Date().getUTCDate()
                      ? "Current time"
                      : "23:59:59"
                  }
                  className="h-7 font-small text-[var(--dark-1)] border-[var(--gray-2)]"
                />
              </div>
            </div>

            {/* Apply button */}
            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                className="h-7 px-3 font-small bg-[var(--dark-1)] hover:bg-[var(--dark-2)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleApplyCustom}
                disabled={!startDate || !endDate}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type { TimeRange };

export const TIME_RANGE_MS: Record<string, number> = {
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "3h": 3 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "2d": 2 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};
