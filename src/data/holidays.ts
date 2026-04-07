export interface Holiday {
  date: string; // MM-DD
  name: string;
}

export const US_HOLIDAYS: Holiday[] = [
  { date: "01-01", name: "New Year's Day" },
  { date: "01-20", name: "Martin Luther King Jr. Day" },
  { date: "02-14", name: "Valentine's Day" },
  { date: "02-17", name: "Presidents' Day" },
  { date: "03-17", name: "St. Patrick's Day" },
  { date: "04-20", name: "Easter Sunday" },
  { date: "05-26", name: "Memorial Day" },
  { date: "06-19", name: "Juneteenth" },
  { date: "07-04", name: "Independence Day" },
  { date: "09-01", name: "Labor Day" },
  { date: "10-13", name: "Columbus Day" },
  { date: "10-31", name: "Halloween" },
  { date: "11-11", name: "Veterans Day" },
  { date: "11-27", name: "Thanksgiving" },
  { date: "12-25", name: "Christmas Day" },
  { date: "12-31", name: "New Year's Eve" },
];

export const MONTH_THEMES: Record<number, { query: string; fallback: string }> = {
  0:  { query: "winter-mountains-snow", fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80" },
  1:  { query: "snowy-forest-winter", fallback: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80" },
  2:  { query: "spring-cherry-blossoms", fallback: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=800&q=80" },
  3:  { query: "spring-meadow-flowers", fallback: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80" },
  4:  { query: "green-forest-nature", fallback: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80" },
  5:  { query: "summer-ocean-beach", fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" },
  6:  { query: "summer-sunset-golden", fallback: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80" },
  7:  { query: "tropical-paradise-palm", fallback: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80" },
  8:  { query: "autumn-leaves-forest", fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" },
  9:  { query: "autumn-harvest-pumpkin", fallback: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80" },
  10: { query: "misty-mountain-november", fallback: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&q=80" },
  11: { query: "winter-cozy-christmas", fallback: "https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=800&q=80" },
};

export function getHolidaysForMonth(month: number): { day: number; name: string }[] {
  const monthStr = String(month + 1).padStart(2, "0");
  return US_HOLIDAYS
    .filter((h) => h.date.startsWith(monthStr))
    .map((h) => ({ day: parseInt(h.date.split("-")[1], 10), name: h.name }));
}
