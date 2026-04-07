import { useState, useEffect, useCallback, useRef } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { FileText, CalendarDays, RotateCcw } from "lucide-react";
import type { DateRange } from "@/hooks/useCalendar";

const STORAGE_KEY = "wall-calendar-quick-notes";

interface QuickNote {
  key: string;    // "YYYY-MM-DD_YYYY-MM-DD"
  label: string;
  text: string;
  updatedAt: number;
}

function loadNotes(): QuickNote[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveNotes(notes: QuickNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function makeLabel(from: string, to: string): string {
  try {
    const f = parseISO(from);
    if (from === to) return format(f, "MMM d");
    return `${format(f, "MMM d")} – ${format(parseISO(to), "MMM d")}`;
  } catch {
    return from;
  }
}

interface QuickNotesProps {
  selectedRange?: DateRange | null;
}

export function QuickNotes({ selectedRange }: QuickNotesProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [text, setText] = useState("");
  const [allNotes, setAllNotes] = useState<QuickNote[]>(loadNotes);
  const [saved, setSaved] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const rangeKey   = `${fromDate}_${toDate}`;
  const rangeLabel = makeLabel(fromDate, toDate);

  // Load saved note when date range changes
  useEffect(() => {
    const existing = allNotes.find((n) => n.key === rangeKey);
    setText(existing?.text ?? "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey]);

  // Auto-save on text changes (debounced 700ms)
  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      setSaved(false);
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => {
        setAllNotes((prev) => {
          const filtered = prev.filter((n) => n.key !== rangeKey);
          const updated = value.trim()
            ? [...filtered, { key: rangeKey, label: rangeLabel, text: value, updatedAt: Date.now() }]
            : filtered;
          saveNotes(updated);
          return updated;
        });
        if (value.trim()) setSaved(true);
      }, 700);
    },
    [rangeKey, rangeLabel]
  );

  // Sync "from" date — ensure toDate >= fromDate
  const handleFromChange = (val: string) => {
    setFromDate(val);
    if (val > toDate) setToDate(val);
  };

  // Apply the calendar's currently dragged selection
  const applyCalendarRange = () => {
    if (!selectedRange) return;
    const f = format(selectedRange.start, "yyyy-MM-dd");
    const t = format(selectedRange.end, "yyyy-MM-dd");
    setFromDate(f);
    setToDate(t);
    toast(`Notes for ${makeLabel(f, t)}`, { duration: 1500 });
  };

  // Recent notes (other than the current range)
  const recentNotes = allNotes
    .filter((n) => n.key !== rangeKey && n.text.trim())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-electric-blue/70 flex-shrink-0" />
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Quick Notes
        </h4>
        {saved && (
          <span className="ml-auto text-[9px] text-green-500 font-medium animate-pulse">
            Saved
          </span>
        )}
      </div>

      {/* Date range inputs */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="block text-[9px] uppercase tracking-wide text-muted-foreground/50 mb-0.5">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFromChange(e.target.value)}
              className="w-full text-[10px] bg-muted/40 border border-border rounded-lg px-2 py-1.5
                text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wide text-muted-foreground/50 mb-0.5">
              To
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full text-[10px] bg-muted/40 border border-border rounded-lg px-2 py-1.5
                text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
          </div>
        </div>

        {/* Use calendar selection button — shown when calendar has a selection */}
        {selectedRange && (
          <button
            onClick={applyCalendarRange}
            className="w-full flex items-center gap-1.5 text-[10px] font-medium
              text-electric-blue/70 hover:text-electric-blue
              bg-electric-blue/5 hover:bg-electric-blue/10
              border border-electric-blue/15 hover:border-electric-blue/30
              rounded-lg px-2.5 py-1.5 transition-all duration-150"
          >
            <CalendarDays className="w-3 h-3" />
            Use calendar selection
          </button>
        )}
      </div>

      {/* Active range label */}
      <p className="text-[11px] font-semibold text-foreground/80 -mb-1">
        {rangeLabel}
      </p>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`Notes for ${rangeLabel}…`}
        rows={5}
        className="w-full text-xs bg-muted/30 border border-border rounded-xl p-3
          resize-none text-foreground placeholder:text-muted-foreground/35
          focus:outline-none focus:ring-2 focus:ring-ring
          transition-all duration-200 leading-relaxed"
      />

      {/* Recent notes */}
      {recentNotes.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <RotateCcw className="w-2.5 h-2.5 text-muted-foreground/30" />
            <h5 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/35">
              Recent
            </h5>
          </div>
          {recentNotes.map((note) => {
            const [f, t] = note.key.split("_");
            return (
              <button
                key={note.key}
                onClick={() => { setFromDate(f); setToDate(t || f); }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-muted/50
                  transition-colors group border border-transparent hover:border-border/50"
              >
                <p className="text-[10px] font-semibold text-electric-blue/80 group-hover:text-electric-blue">
                  {note.label}
                </p>
                <p className="text-[9px] text-muted-foreground/50 group-hover:text-muted-foreground truncate mt-0.5">
                  {note.text.slice(0, 55)}{note.text.length > 55 ? "…" : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
