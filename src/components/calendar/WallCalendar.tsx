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
import { QuickNotes } from "./QuickNotes";

type MobileTab = "calendar" | "reminders" | "notes";

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
  const [mobileTab, setMobileTab] = useState<MobileTab>("calendar");
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch swipe (calendar tab only)
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
      className="bg-background transition-colors duration-300"
      ref={containerRef}
    >

      {/* ═══════════════════════════════════════
          DESKTOP layout (md+): unchanged 3-col
          ═══════════════════════════════════════ */}
      <div className="hidden md:flex md:min-h-screen md:items-center md:justify-center md:p-8">
        <div className="w-full max-w-6xl flex flex-row gap-0">
          {/* Left: Reminders */}
          <div className="w-[320px] flex-shrink-0 rounded-l-xl overflow-hidden border border-r-0 border-border shadow-lg flex">
            <NotesPanel />
          </div>

          {/* Center: Calendar */}
          {CalendarCard}

          {/* Right: Clock + Quick Notes */}
          <div className="w-[250px] flex-shrink-0 flex flex-col rounded-r-xl overflow-hidden border border-l-0 border-border shadow-lg bg-card">
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
          MOBILE layout (<md): full-screen tabs
          ═══════════════════════════════════════ */}
      <div className="md:hidden flex flex-col" style={{ height: "100dvh" }}>

        {/* Tab content — fills all available space above the tab bar */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">

            {/* ── CALENDAR TAB ── */}
            {mobileTab === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto"
              >
                <div className="min-h-full bg-card border border-border shadow-2xl">
                  {CalendarCard}
                </div>
              </motion.div>
            )}

            {/* ── REMINDERS TAB ── */}
            {mobileTab === "reminders" && (
              <motion.div
                key="reminders"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 overflow-hidden flex flex-col">
                  <NotesPanel />
                </div>
              </motion.div>
            )}

            {/* ── NOTES TAB ── */}
            {mobileTab === "notes" && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto bg-card"
              >
                {/* Mini clock header */}
                <div className="flex flex-col items-center px-4 pt-8 pb-14 gap-3 border-b border-border/50 bg-card">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Local Time</p>
                  <OrbitalClock />
                </div>
                {/* Quick notes */}
                <div className="px-4 py-5">
                  <QuickNotes selectedRange={selectedRange} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── BOTTOM TAB BAR ── */}
        <nav className="flex-shrink-0 flex items-stretch border-t border-border bg-card/95 backdrop-blur-md"
             style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {(
            [
              { id: "calendar",   label: "Calendar",   icon: CalendarDays },
              { id: "reminders",  label: "Reminders",  icon: Bell },
              { id: "notes",      label: "Notes",      icon: FileText },
            ] as { id: MobileTab; label: string; icon: React.ElementType }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMobileTab(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200
                ${mobileTab === id
                  ? "text-electric-blue"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
                }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${mobileTab === id ? "scale-110" : ""}`} />
              {label}
              {/* Active indicator dot */}
              <span className={`w-1 h-1 rounded-full transition-all duration-200 ${mobileTab === id ? "bg-electric-blue opacity-100" : "opacity-0"}`} />
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}