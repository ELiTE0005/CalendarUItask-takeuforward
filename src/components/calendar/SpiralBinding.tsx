const HOLE_COUNT = 14;

export function SpiralBinding() {
  return (
    <div className="relative flex items-center justify-center gap-3 py-2 bg-card z-10"
         aria-hidden="true">
      {/* Wire strip behind */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 rounded-full bg-muted-foreground/20" />
      {Array.from({ length: HOLE_COUNT }).map((_, i) => (
        <div key={i} className="relative">
          <div className="spiral-hole" />
          {/* Wire arc */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-3 w-5 h-6 border-2 border-muted-foreground/30 rounded-t-full border-b-0"
          />
        </div>
      ))}
    </div>
  );
}
