import { format } from "date-fns";
import type { DateRange } from "@/hooks/useCalendar";

interface NoteEntry {
  rangeKey: string;
  label: string;
  text: string;
  updatedAt: number;
}

interface NotesPanelProps {
  range: DateRange | null;
  rangeLabel: string | null;
  text: string;
  onChange: (value: string) => void;
  pastNotes: NoteEntry[];
  onRestoreRange: (rangeKey: string) => void;
}

export function NotesPanel({
  range,
  rangeLabel,
  text,
  onChange,
  pastNotes,
  onRestoreRange,
}: NotesPanelProps) {
  return (
    <div className="bg-warm-gray dark:bg-card p-5 flex flex-col h-full min-h-[300px] md:min-h-0">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
        Notes
      </h3>

      {rangeLabel ? (
        <p className="text-sm font-semibold text-foreground mb-3">{rangeLabel}</p>
      ) : (
        <p className="text-sm text-muted-foreground mb-3">
          Select a date range to add notes
        </p>
      )}

      <div className="relative flex-1 mb-4">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          disabled={!range}
          placeholder={range ? "Write your notes here..." : "Select dates first..."}
          className="notes-ruled w-full h-full min-h-[120px] md:min-h-[160px] resize-none bg-transparent border border-border rounded-lg p-3 pt-4 text-sm leading-8 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Notes for selected date range"
        />
      </div>

      {pastNotes.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Recent Notes
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {pastNotes.map((note) => (
              <button
                key={note.rangeKey}
                onClick={() => onRestoreRange(note.rangeKey)}
                className="w-full text-left px-3 py-2 rounded-md bg-card dark:bg-secondary hover:bg-accent/10 transition-colors group"
              >
                <span className="text-[11px] font-semibold text-electric-blue">
                  {note.label}
                </span>
                <p className="text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">
                  {note.text.slice(0, 60)}{note.text.length > 60 ? "…" : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
