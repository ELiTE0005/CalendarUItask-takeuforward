import { format } from "date-fns";
import { useState } from "react";
import { MONTH_THEMES } from "@/data/holidays";

interface HeroImagePanelProps {
  month: Date;
}

export function HeroImagePanel({ month }: HeroImagePanelProps) {
  const monthIndex = month.getMonth();
  const theme = MONTH_THEMES[monthIndex];
  const monthName = format(month, "MMMM");
  const year = format(month, "yyyy");
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative w-full h-48 md:h-56 overflow-hidden bg-muted">
      {imgError ? (
        /* Beautiful gradient fallback when image fails */
        <div
          className="w-full h-full"
          style={{ background: theme.gradient }}
        />
      ) : (
        <img
          src={theme.fallback}
          alt={`${monthName} ${year} landscape`}
          className="w-full h-full object-cover"
          loading="eager"
          onError={() => setImgError(true)}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Diagonal month label */}
      <div className="absolute bottom-0 right-0 diagonal-cut bg-foreground/90 dark:bg-card/90 px-8 pl-12 py-3">
        <p className="text-primary-foreground/60 dark:text-muted-foreground text-xs font-medium tracking-widest uppercase">
          {year}
        </p>
        <h2 className="text-primary dark:text-primary text-xl md:text-2xl font-black tracking-tight uppercase">
          {monthName}
        </h2>
      </div>
    </div>
  );
}
