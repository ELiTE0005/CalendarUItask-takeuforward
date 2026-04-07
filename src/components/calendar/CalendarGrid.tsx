import { useRef, useEffect, useCallback } from "react";
import { format, isSameDay, isSameMonth } from "date-fns";
import { getHolidaysForMonth } from "@/data/holidays";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface CalendarGridProps {
  month: Date;
  days: Date[];
  focusedDate: Date | null;
  isDragging: boolean;
  getDayState: (date: Date) => {
    inMonth: boolean;
    today: boolean;
    weekend: boolean;
    isStart: boolean;
    isEnd: boolean;
    isInRange: boolean;
  };
  onPointerDown: (date: Date) => void;
  onPointerEnter: (date: Date) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent, date: Date) => void;
}

export function CalendarGrid({
  month,
  days,
  focusedDate,
  isDragging,
  getDayState,
  onPointerDown,
  onPointerEnter,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
}: CalendarGridProps) {
  const holidays = getHolidaysForMonth(month.getMonth());
  const holidayMap = new Map(holidays.map((h) => [h.day, h.name]));
  const gridRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Focus management for keyboard nav
  useEffect(() => {
    if (focusedDate) {
      const key = focusedDate.toISOString();
      const btn = buttonRefs.current.get(key);
      btn?.focus();
    }
  }, [focusedDate]);

  const setButtonRef = useCallback((date: Date, el: HTMLButtonElement | null) => {
    const key = date.toISOString();
    if (el) buttonRefs.current.set(key, el);
    else buttonRefs.current.delete(key);
  }, []);

  return (
    <div
      className="px-3 md:px-5 pb-4 pt-2 select-none"
      ref={gridRef}
      onPointerDown={(e) => {
        // Capture ALL pointer events on this container even when cursor
        // leaves the grid — this is what makes drag reliable.
        gridRef.current?.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!isDragging) return;
        // Hit-test the element under the cursor regardless of which element
        // currently has pointer capture. This never misses cells even at
        // high pointer speed or when moving through inter-cell gaps.
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const btn = el?.closest('[data-date]') as HTMLElement | null;
        if (btn?.dataset.date) {
          onPointerEnter(new Date(btn.dataset.date));
        }
      }}
      onPointerUp={onPointerUp}
      onPointerLeave={() => { if (isDragging) onPointerCancel(); }}
      style={{ touchAction: "none" }}
    >
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1" role="row">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            role="columnheader"
            className={`text-center text-[11px] font-semibold tracking-wider py-2 ${
              i === 0 || i === 6 ? "text-electric-blue" : "text-muted-foreground"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7" role="grid" aria-label="Calendar dates">
        {days.map((date) => {
          const state = getDayState(date);
          const dayNum = date.getDate();
          const inMonth = isSameMonth(date, month);
          const holiday = inMonth ? holidayMap.get(dayNum) : undefined;
          const isFocused = focusedDate && isSameDay(date, focusedDate);

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
              data-date={date.toISOString()}
              ref={(el) => setButtonRef(date, el)}
              className={classes}
              onPointerDown={(e) => {
                e.preventDefault();
                onPointerDown(date);
              }}
              onKeyDown={(e) => onKeyDown(e, date)}
              aria-label={ariaLabel}
              tabIndex={isFocused ? 0 : inMonth && state.today ? 0 : -1}
              role="gridcell"
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
