import { useState, useEffect } from "react";

export type WeatherMood =
  | "summer"
  | "monsoon"
  | "winter"
  | "spring"
  | "autumn"
  | "cloudy";

export interface WeatherData {
  mood: WeatherMood;
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  windSpeed: number | null;
  precipitation: number | null;
  isDay: boolean;
  description: string;
  emoji: string;
  loading: boolean;
  error: string | null;
}

// WMO → human label
const WMO_LABELS: Record<number, string> = {
  0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy Fog",
  51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
  61: "Light Rain", 63: "Moderate Rain", 65: "Heavy Rain",
  71: "Light Snow", 73: "Moderate Snow", 75: "Heavy Snow", 77: "Snow Grains",
  80: "Showers", 81: "Moderate Showers", 82: "Violent Showers",
  85: "Snow Showers", 86: "Heavy Snow Showers",
  95: "Thunderstorm", 96: "Thunderstorm w/ Hail", 99: "Thunderstorm w/ Hail",
};

const WMO_EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌧️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  85: "🌨️", 86: "🌨️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

function classifyMood(code: number, temp: number, month: number): WeatherMood {
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "winter";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return "monsoon";
  if (temp >= 30) return "summer";
  if (temp < 5) return "winter";
  const m = month;
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 8 && m <= 10) return "autumn";
  return "cloudy";
}

const CACHE_KEY = "wall-cal-weather-v2";
const CACHE_TTL = 20 * 60 * 1000;

interface CacheEntry {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  isDay: boolean;
  code: number;
  ts: number;
}

function loadCache(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const p: CacheEntry = JSON.parse(raw);
    if (Date.now() - p.ts < CACHE_TTL) return p;
  } catch { /* ignore */ }
  return null;
}

function saveCache(e: CacheEntry) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(e)); } catch { /* ignore */ }
}

function buildState(
  code: number, temp: number, feelsLike: number, humidity: number,
  windSpeed: number, precipitation: number, isDay: boolean
): WeatherData {
  const month = new Date().getMonth();
  const mood = classifyMood(code, temp, month);
  return {
    mood, temperature: temp, feelsLike, humidity, windSpeed, precipitation, isDay,
    description: WMO_LABELS[code] ?? "Unknown",
    emoji: WMO_EMOJI[code] ?? "🌡️",
    loading: false, error: null,
  };
}

const FALLBACK: WeatherData = {
  mood: "cloudy", temperature: null, feelsLike: null, humidity: null,
  windSpeed: null, precipitation: null, isDay: true,
  description: "Seasonal theme", emoji: "🌡️", loading: false,
  error: "Location unavailable",
};

export function useWeather(): WeatherData {
  const [state, setState] = useState<WeatherData>({
    ...FALLBACK, loading: true, error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function go() {
      // 1. Cache hit
      const cached = loadCache();
      if (cached && !cancelled) {
        setState(buildState(
          cached.code, cached.temperature, cached.feelsLike,
          cached.humidity, cached.windSpeed, cached.precipitation, cached.isDay
        ));
        return;
      }

      // 2. Geolocation
      let lat: number, lon: number;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000, maximumAge: 600_000 })
        );
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } catch {
        if (!cancelled) setState(FALLBACK);
        return;
      }

      // 3. Open-Meteo — no API key required
      try {
        const fields = [
          "temperature_2m", "apparent_temperature", "relative_humidity_2m",
          "windspeed_10m", "precipitation", "weathercode", "is_day",
        ].join(",");
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=${fields}&temperature_unit=celsius&windspeed_unit=kmh&forecast_days=1`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        const c = json.current;

        const entry: CacheEntry = {
          temperature: c.temperature_2m,
          feelsLike: c.apparent_temperature,
          humidity: c.relative_humidity_2m,
          windSpeed: c.windspeed_10m,
          precipitation: c.precipitation,
          isDay: c.is_day === 1,
          code: c.weathercode,
          ts: Date.now(),
        };
        saveCache(entry);

        if (!cancelled) {
          setState(buildState(
            entry.code, entry.temperature, entry.feelsLike,
            entry.humidity, entry.windSpeed, entry.precipitation, entry.isDay
          ));
        }
      } catch {
        if (!cancelled) setState({ ...FALLBACK, error: "Weather fetch failed" });
      }
    }

    go();
    return () => { cancelled = true; };
  }, []);

  return state;
}
