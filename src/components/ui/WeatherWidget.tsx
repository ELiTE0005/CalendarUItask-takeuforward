import type { WeatherData } from "@/hooks/useWeather";

interface WeatherWidgetProps {
  weather: WeatherData;
}

const MOOD_GRADIENT: Record<string, string> = {
  summer:  "from-amber-50/80 to-orange-50/60 dark:from-amber-950/30 dark:to-orange-950/20",
  monsoon: "from-blue-50/80 to-slate-50/60 dark:from-blue-950/30 dark:to-slate-950/20",
  winter:  "from-sky-50/80 to-blue-50/60 dark:from-sky-950/30 dark:to-blue-950/20",
  spring:  "from-pink-50/80 to-green-50/60 dark:from-pink-950/30 dark:to-green-950/20",
  autumn:  "from-orange-50/80 to-amber-50/60 dark:from-orange-950/30 dark:to-amber-950/20",
  cloudy:  "from-slate-50/80 to-gray-50/60 dark:from-slate-900/30 dark:to-gray-900/20",
};

const MOOD_ACCENT: Record<string, string> = {
  summer:  "text-amber-500 dark:text-amber-400",
  monsoon: "text-blue-500 dark:text-blue-400",
  winter:  "text-sky-500 dark:text-sky-400",
  spring:  "text-pink-500 dark:text-pink-400",
  autumn:  "text-orange-500 dark:text-orange-400",
  cloudy:  "text-slate-500 dark:text-slate-400",
};

const MOOD_DOT: Record<string, string> = {
  summer:  "bg-amber-400",
  monsoon: "bg-blue-400",
  winter:  "bg-sky-400",
  spring:  "bg-pink-400",
  autumn:  "bg-orange-400",
  cloudy:  "bg-slate-400",
};

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-4 text-center flex-shrink-0">{icon}</span>
      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide flex-shrink-0 w-14">
        {label}
      </span>
      <span className="text-[11px] font-semibold text-foreground/80 font-mono">
        {value}
      </span>
    </div>
  );
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  const grad = MOOD_GRADIENT[weather.mood] ?? MOOD_GRADIENT.cloudy;
  const accent = MOOD_ACCENT[weather.mood] ?? MOOD_ACCENT.cloudy;
  const dot = MOOD_DOT[weather.mood] ?? MOOD_DOT.cloudy;

  if (weather.loading) {
    return (
      <div className="w-full rounded-xl bg-muted/30 border border-border/50 px-4 py-4 animate-pulse">
        <div className="h-3 w-20 bg-muted rounded mb-2" />
        <div className="h-8 w-16 bg-muted rounded mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted/70 rounded" />
          <div className="h-3 w-4/5 bg-muted/70 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-xl border border-border/50 overflow-hidden bg-gradient-to-br ${grad}
        backdrop-blur-sm shadow-sm transition-all duration-700`}
    >
      {/* Header row */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Live Weather
            </span>
          </div>
          <p className={`text-[11px] font-semibold ${accent}`}>
            {weather.description}
          </p>
        </div>
        <span className="text-3xl leading-none select-none">{weather.emoji}</span>
      </div>

      {/* Big temp */}
      <div className="px-4 pb-3 flex items-end gap-2">
        <span className={`text-5xl font-black leading-none ${accent} tracking-tight`}>
          {weather.temperature !== null ? `${Math.round(weather.temperature)}°` : "—°"}
        </span>
        <div className="mb-1 flex flex-col gap-0.5">
          {weather.feelsLike !== null && (
            <span className="text-[10px] text-muted-foreground/60 font-mono">
              feels {Math.round(weather.feelsLike)}°
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/50">Celsius</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border/40 mb-3" />

      {/* Stats grid */}
      <div className="px-4 pb-4 space-y-2">
        {weather.humidity !== null && (
          <StatRow icon="💧" label="Humidity" value={`${Math.round(weather.humidity)}%`} />
        )}
        {weather.windSpeed !== null && (
          <StatRow icon="💨" label="Wind" value={`${Math.round(weather.windSpeed)} km/h`} />
        )}
        {weather.precipitation !== null && (
          <StatRow icon="🌂" label="Precip" value={`${weather.precipitation.toFixed(1)} mm`} />
        )}
        <StatRow
          icon={weather.isDay ? "☀️" : "🌙"}
          label={weather.isDay ? "Daytime" : "Nighttime"}
          value={weather.isDay ? "Day" : "Night"}
        />
      </div>

      {/* Error hint */}
      {weather.error && (
        <p className="px-4 pb-3 text-[9px] text-muted-foreground/35 italic">
          {weather.error}
        </p>
      )}
    </div>
  );
}
