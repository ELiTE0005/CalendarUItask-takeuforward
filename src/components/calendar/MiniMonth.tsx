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
    <div className="rounded-lg border border-border/60 bg-muted/40 backdrop-blur-sm px-2 py-2 text-center shadow-sm">
      {/* Month label */}
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
        {format(month, "MMM")}{" "}
        <span className="opacity-60">{format(month, "yyyy")}</span>
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-0.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span
            key={i}
            className="text-[8px] font-semibold text-muted-foreground/50 text-center leading-4"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const inMonth = isSameMonth(d, month);
          const today = isToday(d);
          return (
            <span
              key={d.toISOString()}
              className={`
                text-[9px] leading-[18px] text-center rounded-full mx-auto w-[18px] h-[18px] flex items-center justify-center
                ${!inMonth ? "opacity-15 text-muted-foreground" : today ? "bg-electric-blue text-white font-bold" : "text-muted-foreground/80"}
              `}
            >
              {d.getDate()}
            </span>
          );
        })}
      </div>
    </div>
  );
}
