import { useCallback, useState, useEffect, useRef } from "react";
// Force HMR re-mount
import { AnimatePresence, motion } from "framer-motion";
import { addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
import { useNotes } from "@/hooks/useNotes";
import { SpiralBinding } from "./SpiralBinding";
import { HeroImagePanel } from "./HeroImagePanel";
import { CalendarGrid } from "./CalendarGrid";
import { NotesPanel } from "./NotesPanel";
import { MiniMonth } from "./MiniMonth";

export function WallCalendar() {
  const {
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
    setPendingStart,
    setCurrentMonth,
    setDirection,
  } = useCalendar();

  const { text, handleChange, pastNotes } = useNotes(selectedRange);
  const [isDark, setIsDark] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch swipe
  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(diff) > 60) {
        if (diff > 0) goPrev();
        else goNext();
      }
    },
    [goNext, goPrev]
  );

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleRestoreRange = useCallback(
    (rangeKey: string) => {
      const [startStr, endStr] = rangeKey.split("_");
      const start = parseISO(startStr);
      const end = parseISO(endStr);
      setSelectedRange({ start, end });
      setPendingStart(null);
      setCurrentMonth(start);
    },
    [setSelectedRange, setPendingStart, setCurrentMonth]
  );

  const prevMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);

  const pageVariants = {
    enter: (dir: number) => ({
      rotateX: dir > 0 ? 90 : -90,
      opacity: 0,
      transformPerspective: 1200,
    }),
    center: {
      rotateX: 0,
      opacity: 1,
      transformPerspective: 1200,
    },
    exit: (dir: number) => ({
      rotateX: dir > 0 ? -90 : 90,
      opacity: 0,
      transformPerspective: 1200,
    }),
  };

  return (
    <div
      className="min-h-screen flex items-start md:items-center justify-center p-4 md:p-8 bg-background transition-colors duration-300"
      ref={containerRef}
    >
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-0 md:gap-0">
        {/* Notes panel - left on desktop, bottom on mobile */}
        <div className="hidden md:flex md:w-[280px] md:flex-shrink-0 rounded-l-xl overflow-hidden border border-r-0 border-border shadow-lg">
          <NotesPanel
            range={selectedRange}
            rangeLabel={rangeLabel}
            text={text}
            onChange={handleChange}
            pastNotes={pastNotes}
            onRestoreRange={handleRestoreRange}
          />
        </div>

        {/* Main calendar card */}
        <div
          className="flex-1 rounded-xl md:rounded-l-none overflow-hidden shadow-2xl bg-card border border-border"
          style={{ boxShadow: "var(--calendar-shadow)" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Spiral binding */}
          <SpiralBinding />

          {/* Navigation bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-card">
            <div className="hidden sm:block w-20">
              <MiniMonth month={prevMonth} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-foreground" />
                ) : (
                  <Moon className="w-4 h-4 text-foreground" />
                )}
              </button>

              <button
                onClick={goNext}
                className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="hidden sm:block w-20">
              <MiniMonth month={nextMonth} />
            </div>
          </div>

          {/* Animated calendar content */}
          <div className="relative overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentMonth.toISOString()}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                style={{ transformOrigin: "top center" }}
              >
                <HeroImagePanel month={currentMonth} />
                <CalendarGrid
                  month={currentMonth}
                  days={calendarDays}
                  focusedDate={focusedDate}
                  isDragging={isDragging}
                  getDayState={getDayState}
                  onPointerDown={handlePointerDown}
                  onPointerEnter={handlePointerEnter}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  onKeyDown={handleKeyDown}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Notes panel - mobile (bottom) */}
        <div className="md:hidden mt-4 rounded-xl overflow-hidden border border-border shadow-lg">
          <NotesPanel
            range={selectedRange}
            rangeLabel={rangeLabel}
            text={text}
            onChange={handleChange}
            pastNotes={pastNotes}
            onRestoreRange={handleRestoreRange}
          />
        </div>
      </div>
    </div>
  );
}
