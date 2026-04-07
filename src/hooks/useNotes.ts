import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { DateRange } from "./useCalendar";

interface SavedNote {
  rangeKey: string;
  label: string;
  text: string;
  updatedAt: number;
}

const STORAGE_KEY = "wall-calendar-notes";

function getRangeKey(range: DateRange): string {
  return `${format(range.start, "yyyy-MM-dd")}_${format(range.end, "yyyy-MM-dd")}`;
}

function getRangeLabel(range: DateRange): string {
  return `${format(range.start, "MMM d")} – ${format(range.end, "MMM d, yyyy")}`;
}

function loadAllNotes(): SavedNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllNotes(notes: SavedNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function useNotes(range: DateRange | null) {
  const [text, setText] = useState("");
  const [allNotes, setAllNotes] = useState<SavedNote[]>(loadAllNotes);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Load note when range changes
  useEffect(() => {
    if (!range) {
      setText("");
      return;
    }
    const key = getRangeKey(range);
    const existing = allNotes.find((n) => n.rangeKey === key);
    setText(existing?.text ?? "");
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      if (!range) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const key = getRangeKey(range);
        const label = getRangeLabel(range);
        setAllNotes((prev) => {
          const filtered = prev.filter((n) => n.rangeKey !== key);
          const updated = value.trim()
            ? [...filtered, { rangeKey: key, label, text: value, updatedAt: Date.now() }]
            : filtered;
          saveAllNotes(updated);
          return updated;
        });
        if (value.trim()) {
          toast.success("Note saved", { duration: 1500 });
        }
      }, 800);
    },
    [range]
  );

  const pastNotes = allNotes
    .filter((n) => n.text.trim())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 10);

  return { text, handleChange, pastNotes };
}
