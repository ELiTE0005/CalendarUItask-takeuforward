import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Moon, Sun, CalendarDays, Bell, FileText } from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
import { SpiralBinding } from "./SpiralBinding";
import { HeroImagePanel } from "./HeroImagePanel";
import { CalendarGrid } from "./CalendarGrid";
import { NotesPanel } from "./NotesPanel";
import { MiniMonth } from "./MiniMonth";
import { OrbitalClock } from "@/components/ui/orbital-clock";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WeatherBackground, WeatherBadge } from "@/components/ui/WeatherBackground";
import { WeatherWidget } from "@/components/ui/WeatherWidget";
import { useWeather } from "@/hooks/useWeather";
import { QuickNotes } from "./QuickNotes";

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
  } = useCalendar();
  const [isDark, setIsDark] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const weather = useWeather();

  // Touch swipe (calendar tab only)
  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Prevent swipe-to-change-month if dragging on the calendar grid
      const target = e.target as HTMLElement | null;
      if (target?.closest('.calendar-day-btn') || target?.closest('[role="grid"]')) {
        return;
      }

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

  /* ── The shared calendar card (used in both mobile & desktop) ── */
  const CalendarCard = (
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
        <div className="hidden sm:block w-32">
          <MiniMonth month={prevMonth} />
        </div>

        <div className="flex items-center gap-2">
          <WeatherBadge mood={weather.mood} temperature={weather.temperature} loading={weather.loading} />
          <button
            onClick={goPrev}
            className="p-2 rounded-full hover:bg-accent/10 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <ThemeToggle isDark={isDark} onToggle={setIsDark} />

          <button
            onClick={goNext}
            className="p-2 rounded-full hover:bg-accent/10 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="hidden sm:block w-32">
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
  );

  return (
    <div
      className="bg-background transition-colors duration-300 relative"
      ref={containerRef}
    >
      {/* ── Weather animated background ── */}
      <WeatherBackground mood={weather.mood} isDark={isDark} />

      {/* ═══════════════════════════════════════
          DESKTOP layout (md+): unchanged 3-col
          ═══════════════════════════════════════ */}
      <div className="hidden md:flex md:min-h-screen md:items-center md:justify-center md:p-8">
        <div className="w-full max-w-6xl flex flex-row gap-0">
          {/* Left: Reminders + Weather */}
          <div className="w-[320px] flex-shrink-0 flex flex-col rounded-l-xl overflow-hidden border border-r-0 border-border shadow-lg bg-card z-10">
            <div className="flex-1 overflow-hidden">
              <NotesPanel />
            </div>
            <div className="px-4 py-4 flex-shrink-0 border-t border-border/50 max-h-[300px]">
              <WeatherWidget weather={weather} />
            </div>
          </div>

          {/* Center: Calendar */}
          {CalendarCard}

          {/* Right: Clock + Quick Notes */}
          <div className="w-[250px] flex-shrink-0 flex flex-col rounded-r-xl overflow-hidden border border-l-0 border-border shadow-lg bg-card z-10">
            <div className="flex flex-col items-center px-4 pt-6 pb-14 gap-3 border-b border-border/50 flex-shrink-0">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Local Time</p>
              <OrbitalClock />
              <p className="text-[10px] text-muted-foreground tracking-widest font-mono"></p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
              <QuickNotes selectedRange={selectedRange} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MOBILE layout (<md): vertically stacked
          ═══════════════════════════════════════ */}
      <div className="md:hidden flex flex-col w-full px-4 py-8 gap-6 relative z-10">
        
        {/* Top: The Main Calendar Component */}
        <div className="w-full bg-card border border-border shadow-2xl rounded-xl">
          {CalendarCard}
        </div>

        {/* Middle: Weather & Quick Notes & Clock */}
        <div className="w-full bg-card border border-border shadow-lg rounded-xl overflow-hidden flex flex-col">
          <div className="flex flex-col items-center px-4 pt-8 pb-10 gap-3 border-b border-border/50 bg-card">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Local Time</p>
            <OrbitalClock />
            <p className="text-[10px] text-muted-foreground tracking-widest font-mono"></p>
          </div>
          <div className="p-4 border-b border-border/50">
            <WeatherWidget weather={weather} />
          </div>
          <div className="p-4 bg-muted/5">
            <QuickNotes selectedRange={selectedRange} />
          </div>
        </div>

        {/* Bottom: The Reminders Section */}
        <div className="w-full bg-card border border-border shadow-lg rounded-xl overflow-hidden min-h-[500px] flex flex-col mb-10">
          <NotesPanel />
        </div>
      </div>
    </div>
  );
}