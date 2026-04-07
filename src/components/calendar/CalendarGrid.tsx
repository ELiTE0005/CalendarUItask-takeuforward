import { format, isSameMonth } from "date-fns";
import { getHolidaysForMonth } from "@/data/holidays";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface CalendarGridProps {
  month: Date;
  days: Date[];
  getDayState: (date: Date) => {
    inMonth: boolean;
    today: boolean;
    weekend: boolean;
    isStart: boolean;
    isEnd: boolean;
    isInRange: boolean;
  };
  onDateClick: (date: Date) => void;
  onDateHover: (date: Date) => void;
  onMouseLeave: () => void;
}

export function CalendarGrid({
  month,
  days,
  getDayState,
  onDateClick,
  onDateHover,
  onMouseLeave,
}: CalendarGridProps) {
  const holidays = getHolidaysForMonth(month.getMonth());
  const holidayMap = new Map(holidays.map((h) => [h.day, h.name]));

  return (
    <div className="px-3 md:px-5 pb-4 pt-2" onMouseLeave={onMouseLeave}>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-[11px] font-semibold tracking-wider py-2 ${
              i === 0 || i === 6 ? "text-electric-blue" : "text-muted-foreground"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((date) => {
          const state = getDayState(date);
          const dayNum = date.getDate();
          const inMonth = isSameMonth(date, month);
          const holiday = inMonth ? holidayMap.get(dayNum) : undefined;

          const classes = [
            "calendar-day-btn",
            !state.inMonth && "is-dimmed",
            state.today && "is-today",
            state.weekend && "is-weekend",
            state.isStart && "is-start",
            state.isEnd && "is-end",
            state.isInRange && "is-in-range",
            state.isInRange && state.isStart && "is-range-start",
            state.isInRange && state.isEnd && "is-range-end",
          ]
            .filter(Boolean)
            .join(" ");

          const ariaLabel = `${format(date, "MMMM d, yyyy")}${
            state.isStart ? ", selected, start of range" : ""
          }${state.isEnd ? ", selected, end of range" : ""}${
            state.isInRange ? ", in selected range" : ""
          }${state.today ? ", today" : ""}${holiday ? `, ${holiday}` : ""}`;

          const btn = (
            <button
              key={date.toISOString()}
              className={classes}
              onClick={() => onDateClick(date)}
              onMouseEnter={() => onDateHover(date)}
              aria-label={ariaLabel}
              tabIndex={inMonth ? 0 : -1}
            >
              <span className="relative z-10">{dayNum}</span>
              {holiday && <span className="holiday-dot" />}
            </button>
          );

          if (holiday) {
            return (
              <Tooltip key={date.toISOString()}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {holiday}
                </TooltipContent>
              </Tooltip>
            );
          }

          return btn;
        })}
      </div>
    </div>
  );
}
