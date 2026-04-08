import { useMemo } from "react";
import type { WeatherMood } from "@/hooks/useWeather";
import "./weather-background.css";

interface WeatherBackgroundProps {
  mood: WeatherMood;
  isDark: boolean;
}

// Stable randomised particles generated once per mood change
function useParticles(count: number, seed: number) {
  return useMemo(() => {
    // Simple seedable-ish pseudo-random so SSR/hydration is stable
    const rng = (i: number, offset = 0) =>
      ((Math.sin(seed * 9301 + (i + offset) * 49297 + 233) + 1) / 2);

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rng(i, 0) * 100,
      duration: 1.5 + rng(i, 1) * 5,
      delay: rng(i, 2) * 8,
      size: 3 + rng(i, 3) * 9,
      drift: (rng(i, 4) - 0.5) * 140,
      spin: rng(i, 5) * 720 - 360,
      opacity: 0.35 + rng(i, 6) * 0.55,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
}

const MOOD_SEEDS: Record<WeatherMood, number> = {
  summer: 1, monsoon: 2, winter: 3, spring: 4, autumn: 5, cloudy: 6,
};

const MOOD_EMOJI: Record<WeatherMood, string> = {
  summer: "☀️", monsoon: "🌧️", winter: "❄️",
  spring: "🌸", autumn: "🍂", cloudy: "☁️",
};

/* ── Individual weather renderers ── */

function SummerBg() {
  const rays = Array.from({ length: 12 }, (_, i) => i);
  return (
    <>
      <div className="sun-origin">
        <div className="sun-core" />
        {rays.map((i) => (
          <div
            key={i}
            className="sun-ray"
            style={{ "--start-angle": `${i * 30}deg` } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="shimmer" />
    </>
  );
}

function MonsoonBg({ particles }: { particles: ReturnType<typeof useParticles> }) {
  return (
    <>
      <div className="cloud-band" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="raindrop"
          style={{
            left: `${p.left}%`,
            height: `${10 + p.size * 2}px`,
            animationDuration: `${0.35 + p.duration * 0.1}s`,
            animationDelay: `${p.delay * 0.3}s`,
            opacity: p.opacity * 0.65,
          }}
        />
      ))}
    </>
  );
}

function WinterBg({ particles }: { particles: ReturnType<typeof useParticles> }) {
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="snowflake"
          style={{
            left: `${p.left}%`,
            width: `${p.size * 0.6}px`,
            height: `${p.size * 0.6}px`,
            animationDuration: `${4 + p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity * 0.7,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
      <div className="frost" />
    </>
  );
}

const PETAL_COLORS = [
  "rgba(255,182,193,0.75)",
  "rgba(255,160,180,0.6)",
  "rgba(255,200,210,0.65)",
  "rgba(220,240,200,0.55)",
];

function SpringBg({ particles }: { particles: ReturnType<typeof useParticles> }) {
  return (
    <>
      {particles.map((p, idx) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            width: `${4 + p.size * 0.5}px`,
            height: `${3 + p.size * 0.35}px`,
            background: PETAL_COLORS[idx % PETAL_COLORS.length],
            animationDuration: `${5 + p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--sway": `${p.drift}px`,
            "--spin": `${p.spin}deg`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

const LEAF_COLORS = [
  "rgba(210,100,30,0.75)",
  "rgba(190,80,20,0.65)",
  "rgba(230,140,40,0.7)",
  "rgba(160,60,20,0.65)",
  "rgba(200,120,30,0.6)",
];

function AutumnBg({ particles }: { particles: ReturnType<typeof useParticles> }) {
  return (
    <>
      {particles.map((p, idx) => (
        <div
          key={p.id}
          className="leaf"
          style={{
            left: `${p.left}%`,
            width: `${5 + p.size * 0.7}px`,
            height: `${4 + p.size * 0.5}px`,
            background: LEAF_COLORS[idx % LEAF_COLORS.length],
            animationDuration: `${6 + p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--sway": `${p.drift}px`,
            "--spin": `${p.spin}deg`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

function CloudyBg({ particles }: { particles: ReturnType<typeof useParticles> }) {
  return (
    <>
      {particles.slice(0, 6).map((p) => (
        <div
          key={p.id}
          className="cloud-puff"
          style={{
            top: `${10 + p.left * 0.3}%`,
            width: `${150 + p.size * 15}px`,
            height: `${80 + p.size * 8}px`,
            animationDuration: `${30 + p.duration * 5}s`,
            animationDelay: `${-p.delay * 4}s`,
            opacity: p.opacity * 0.5,
          }}
        />
      ))}
    </>
  );
}

/* ── Main component ── */
export function WeatherBackground({ mood, isDark }: WeatherBackgroundProps) {
  const seed = MOOD_SEEDS[mood];
  const particles = useParticles(
    mood === "monsoon" ? 80 : mood === "winter" ? 50 : 30,
    seed
  );

  return (
    <div className={`weather-bg ${mood} ${isDark ? "dark-mode" : ""}`}>
      {mood === "summer"  && <SummerBg />}
      {mood === "monsoon" && <MonsoonBg particles={particles} />}
      {mood === "winter"  && <WinterBg  particles={particles} />}
      {mood === "spring"  && <SpringBg  particles={particles} />}
      {mood === "autumn"  && <AutumnBg  particles={particles} />}
      {mood === "cloudy"  && <CloudyBg  particles={particles} />}
    </div>
  );
}

/* ── Small status badge for the nav bar ── */
export function WeatherBadge({
  mood,
  temperature,
  loading,
}: {
  mood: WeatherMood;
  temperature: number | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <span className="weather-badge" style={{ opacity: 0.5 }}>
        ···
      </span>
    );
  }
  return (
    <span className="weather-badge" title={`Current weather: ${mood}`}>
      {MOOD_EMOJI[mood]}
      {temperature !== null && (
        <span style={{ marginLeft: 2 }}>{Math.round(temperature)}°</span>
      )}
    </span>
  );
}
