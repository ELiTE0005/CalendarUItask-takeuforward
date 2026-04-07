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

export const MONTH_THEMES: Record<number, { query: string; fallback: string; gradient: string }> = {
  0:  { query: "winter-mountains-snow",   fallback: "https://images.unsplash.com/photo-1608501947097-86951ad73fea?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#1e3a5f 0%,#4a7fb5 50%,#a8d8ea 100%)" },
  1:  { query: "snowy-forest-winter",      fallback: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#2c3e50 0%,#3498db 50%,#bdc3c7 100%)" },
  2:  { query: "spring-cherry-blossoms",   fallback: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#f8c8d4 0%,#f48fb1 50%,#ce93d8 100%)" },
  3:  { query: "spring-meadow-flowers",    fallback: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#a8edea 0%,#7ec8a4 50%,#f9ca24 100%)" },
  4:  { query: "green-forest-nature",      fallback: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#134e5e 0%,#71b280 50%,#b8e994 100%)" },
  5:  { query: "summer-ocean-beach",       fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#0052d4 0%,#4364f7 50%,#6fb1fc 100%)" },
  6:  { query: "summer-sunset-golden",     fallback: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#f7971e 0%,#ffd200 50%,#ff6b6b 100%)" },
  7:  { query: "tropical-paradise-palm",   fallback: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#005c97 0%,#363795 50%,#00c9ff 100%)" },
  8:  { query: "autumn-leaves-forest",     fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#b34700 0%,#e67e22 50%,#f9ca24 100%)" },
  9:  { query: "autumn-harvest-pumpkin",   fallback: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#7b4f12 0%,#c0392b 50%,#e67e22 100%)" },
  10: { query: "misty-mountain-november",  fallback: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#373b44 0%,#4286f4 50%,#7f8c8d 100%)" },
  11: { query: "winter-cozy-christmas",    fallback: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&auto=format&fit=crop&q=80", gradient: "linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#c0392b 100%)" },
};

export function getHolidaysForMonth(month: number): { day: number; name: string }[] {
  const monthStr = String(month + 1).padStart(2, "0");
  return US_HOLIDAYS
    .filter((h) => h.date.startsWith(monthStr))
    .map((h) => ({ day: parseInt(h.date.split("-")[1], 10), name: h.name }));
}
