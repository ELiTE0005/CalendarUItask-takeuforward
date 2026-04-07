import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";

interface MiniMonthProps {
  month: Date;
}

export function MiniMonth({ month }: MiniMonthProps) {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="text-center">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
        {format(month, "MMM yyyy")}
      </p>
      <div className="grid grid-cols-7 gap-0">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[8px] text-muted-foreground/60 font-medium">
            {d}
          </span>
        ))}
        {days.map((d) => (
          <span
            key={d.toISOString()}
            className={`text-[9px] leading-4 ${
              !isSameMonth(d, month) ? "opacity-20" : isToday(d) ? "font-bold text-electric-blue" : "text-muted-foreground"
            }`}
          >
            {d.getDate()}
          </span>
        ))}
      </div>
    </div>
  );
}
