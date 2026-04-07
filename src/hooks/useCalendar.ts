import { useState, useCallback, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  isAfter,
  isBefore,
  isWeekend,
  format,
} from "date-fns";

export interface DateRange {
  start: Date;
  end: Date;
}

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  const handleDateClick = useCallback(
    (date: Date) => {
      // If we have a completed range and click on start or end, deselect
      if (selectedRange) {
        if (isSameDay(date, selectedRange.start) || isSameDay(date, selectedRange.end)) {
          setSelectedRange(null);
          setPendingStart(null);
          return;
        }
      }

      if (!pendingStart) {
        // First click: set start
        setPendingStart(date);
        setSelectedRange(null);
      } else {
        // Second click: set end
        const start = isBefore(date, pendingStart) ? date : pendingStart;
        const end = isAfter(date, pendingStart) ? date : pendingStart;
        setSelectedRange({ start, end });
        setPendingStart(null);
      }
    },
    [pendingStart, selectedRange]
  );

  const handleDateHover = useCallback(
    (date: Date) => {
      if (pendingStart) {
        setHoveredDate(date);
      }
    },
    [pendingStart]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredDate(null);
  }, []);

  const getDayState = useCallback(
    (date: Date) => {
      const inMonth = isSameMonth(date, currentMonth);
      const today = isToday(date);
      const weekend = isWeekend(date);

      let isStart = false;
      let isEnd = false;
      let isInRange = false;

      if (selectedRange) {
        isStart = isSameDay(date, selectedRange.start);
        isEnd = isSameDay(date, selectedRange.end);
        isInRange =
          !isStart &&
          !isEnd &&
          isAfter(date, selectedRange.start) &&
          isBefore(date, selectedRange.end);
      } else if (pendingStart) {
        isStart = isSameDay(date, pendingStart);
        if (hoveredDate && !isSameDay(hoveredDate, pendingStart)) {
          const rangeStart = isBefore(hoveredDate, pendingStart) ? hoveredDate : pendingStart;
          const rangeEnd = isAfter(hoveredDate, pendingStart) ? hoveredDate : pendingStart;
          isEnd = isSameDay(date, rangeEnd) && !isSameDay(rangeStart, rangeEnd);
          isStart = isSameDay(date, rangeStart);
          isInRange =
            !isSameDay(date, rangeStart) &&
            !isSameDay(date, rangeEnd) &&
            isAfter(date, rangeStart) &&
            isBefore(date, rangeEnd);
        }
      }

      return { inMonth, today, weekend, isStart, isEnd, isInRange };
    },
    [currentMonth, selectedRange, pendingStart, hoveredDate]
  );

  const rangeLabel = useMemo(() => {
    if (selectedRange) {
      return `${format(selectedRange.start, "MMM d")} – ${format(selectedRange.end, "MMM d, yyyy")}`;
    }
    if (pendingStart) {
      return `${format(pendingStart, "MMM d, yyyy")} – ...`;
    }
    return null;
  }, [selectedRange, pendingStart]);

  return {
    currentMonth,
    calendarDays,
    selectedRange,
    pendingStart,
    direction,
    goNext,
    goPrev,
    handleDateClick,
    handleDateHover,
    handleMouseLeave,
    getDayState,
    rangeLabel,
    setSelectedRange,
    setPendingStart,
    setCurrentMonth,
    setDirection,
  };
}
