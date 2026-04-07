import { useState, useCallback, useMemo, useRef } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addDays,
  subDays,
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
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
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

  // Drag-to-select handlers
  const handlePointerDown = useCallback(
    (date: Date) => {
      // Clicking on a selected start/end deselects
      if (selectedRange) {
        if (isSameDay(date, selectedRange.start) || isSameDay(date, selectedRange.end)) {
          setSelectedRange(null);
          setDragStart(null);
          setDragEnd(null);
          setIsDragging(false);
          return;
        }
      }
      setDragStart(date);
      setDragEnd(date);
      setSelectedRange(null);
      setIsDragging(true);
    },
    [selectedRange]
  );

  const handlePointerEnter = useCallback(
    (date: Date) => {
      if (isDragging && dragStart) {
        setDragEnd(date);
      }
    },
    [isDragging, dragStart]
  );

  const handlePointerUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd) {
      const start = isBefore(dragEnd, dragStart) ? dragEnd : dragStart;
      const end = isAfter(dragEnd, dragStart) ? dragEnd : dragStart;
      setSelectedRange({ start, end });
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd]);

  const handlePointerCancel = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, date: Date) => {
      let next: Date | null = null;

      switch (e.key) {
        case "ArrowRight":
          next = addDays(date, 1);
          break;
        case "ArrowLeft":
          next = subDays(date, 1);
          break;
        case "ArrowDown":
          next = addDays(date, 7);
          break;
        case "ArrowUp":
          next = subDays(date, 7);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handlePointerDown(date);
          // Immediately finalize as a single-day select on Enter/Space
          setSelectedRange({ start: date, end: date });
          setIsDragging(false);
          setDragStart(null);
          setDragEnd(null);
          return;
        default:
          return;
      }

      e.preventDefault();
      if (next) {
        setFocusedDate(next);
        // If the next date is outside current month view, navigate
        if (!isSameMonth(next, currentMonth)) {
          if (isAfter(next, endOfMonth(currentMonth))) {
            setDirection(1);
            setCurrentMonth(startOfMonth(next));
          } else {
            setDirection(-1);
            setCurrentMonth(startOfMonth(next));
          }
        }

        // If shift is held, extend range selection via keyboard
        if (e.shiftKey) {
          if (!selectedRange) {
            setSelectedRange({ start: date, end: next });
          } else {
            const anchor = selectedRange.start;
            const s = isBefore(next, anchor) ? next : anchor;
            const en = isAfter(next, anchor) ? next : anchor;
            setSelectedRange({ start: s, end: en });
          }
        }
      }
    },
    [currentMonth, selectedRange, handlePointerDown]
  );

  const getDayState = useCallback(
    (date: Date) => {
      const inMonth = isSameMonth(date, currentMonth);
      const today = isToday(date);
      const weekend = isWeekend(date);

      let isStart = false;
      let isEnd = false;
      let isInRange = false;

      // Show committed range
      if (selectedRange) {
        isStart = isSameDay(date, selectedRange.start);
        isEnd = isSameDay(date, selectedRange.end);
        isInRange =
          !isStart &&
          !isEnd &&
          isAfter(date, selectedRange.start) &&
          isBefore(date, selectedRange.end);
      }
      // Show drag preview
      else if (isDragging && dragStart && dragEnd) {
        const rs = isBefore(dragEnd, dragStart) ? dragEnd : dragStart;
        const re = isAfter(dragEnd, dragStart) ? dragEnd : dragStart;
        isStart = isSameDay(date, rs);
        isEnd = isSameDay(date, re) && !isSameDay(rs, re);
        isInRange =
          !isSameDay(date, rs) &&
          !isSameDay(date, re) &&
          isAfter(date, rs) &&
          isBefore(date, re);
      }

      return { inMonth, today, weekend, isStart, isEnd, isInRange };
    },
    [currentMonth, selectedRange, isDragging, dragStart, dragEnd]
  );

  const rangeLabel = useMemo(() => {
    if (selectedRange) {
      if (isSameDay(selectedRange.start, selectedRange.end)) {
        return format(selectedRange.start, "MMM d, yyyy");
      }
      return `${format(selectedRange.start, "MMM d")} – ${format(selectedRange.end, "MMM d, yyyy")}`;
    }
    if (isDragging && dragStart && dragEnd) {
      const s = isBefore(dragEnd, dragStart) ? dragEnd : dragStart;
      const e = isAfter(dragEnd, dragStart) ? dragEnd : dragStart;
      return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
    }
    return null;
  }, [selectedRange, isDragging, dragStart, dragEnd]);

  return {
    currentMonth,
    calendarDays,
    selectedRange,
    focusedDate,
    direction,
    isDragging,
    goNext,
    goPrev,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown,
    getDayState,
    rangeLabel,
    setSelectedRange,
    setPendingStart: setDragStart,
    setCurrentMonth,
    setDirection,
    setFocusedDate,
  };
}
