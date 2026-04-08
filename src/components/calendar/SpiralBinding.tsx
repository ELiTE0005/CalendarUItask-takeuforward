// const HOLE_COUNT = 14;

// export function SpiralBinding() {
//   return (
//     <div className="relative flex items-center justify-center gap-2.5 py-3 bg-card rounded-t-xl md:rounded-none z-10" aria-hidden="true">
//       {/* ── THE NAIL & HANGER (Subtle, Dark Wire) ── */}
//       <div className="absolute left-1/2 -top-[36px] -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
        
//         {/* Subtle SVG hook + pin */}
//         <svg
//           width="60"
//           height="60"
//           viewBox="0 0 60 60"
//           className="absolute left-1/2 -translate-x-1/2 pointer-events-none drop-shadow-md"
//           style={{ top: "-18px", zIndex: 30, overflow: "visible" }}
//         >
//           <defs>
//             <radialGradient id="nailGradient" cx="40%" cy="30%" r="50%">
//               <stop offset="0%" stopColor="#777" />
//               <stop offset="50%" stopColor="#333" />
//               <stop offset="100%" stopColor="#111" />
//             </radialGradient>
            
//             <filter id="wireShadow" x="-20%" y="-20%" width="140%" height="140%">
//               <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="rgba(0,0,0,0.3)" />
//             </filter>
            
//             <filter id="nailShadow" x="-50%" y="-50%" width="200%" height="200%">
//               <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor="rgba(0,0,0,0.45)" />
//             </filter>
//           </defs>

//           {/* ── The V-shaped wire hook (thin, dark metal) ── */}
//           <g filter="url(#wireShadow)">
//             {/* Wire path coming from the spiral rings, looping up to the pin */}
//             <path
//               d="M 16,60 Q 22,48 27.5,30 Q 30,24 32.5,30 Q 38,48 44,60"
//               fill="none"
//               stroke="#2d3036"
//               strokeWidth="2.2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </g>

//           {/* ── Small black push-pin / nail ── */}
//           <g filter="url(#nailShadow)">
//             {/* Wall shadow cast by the pin */}
//             <ellipse
//               cx="30" cy="40" rx="4" ry="1.5"
//               fill="rgba(0,0,0,0.12)"
//               style={{ filter: "blur(1px)" }}
//             />
//             {/* Head */}
//             <circle cx="30" cy="25" r="3.5" fill="url(#nailGradient)" />
//             {/* Highlight */}
//              <circle cx="29" cy="24" r="1" fill="rgba(255,255,255,0.4)" style={{ filter: "blur(0.5px)" }} />
//           </g>
//         </svg>
//       </div>

//       {/* ── BINDING WIRES ── */}
//       <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 rounded-full bg-muted-foreground/10" />
      
//       {Array.from({ length: HOLE_COUNT }).map((_, i) => {
//         // Leave a slightly larger gap in the exact center for the hanger wire to drop in
//         const isCenter = i === Math.floor(HOLE_COUNT / 2) || i === Math.floor(HOLE_COUNT / 2) - 1;
//         const extraMargin = isCenter ? "mx-0.5" : "";
        
//         return (
//           <div key={i} className={`relative ${extraMargin}`}>
//             <div className="spiral-hole" />
//             <div
//               className="absolute left-1/2 -translate-x-1/2 -top-[14px] w-5 h-6 border-2 border-muted-foreground/30 rounded-t-full border-b-0"
//             />
//           </div>
//         );
//       })}
//     </div>
//   );
// }

export function SpiralBinding() {
  return (
    <div 
      className="absolute top-0 left-0 w-full z-30 pointer-events-none" 
      style={{ transform: "translateY(-56%)" }} 
      aria-hidden="true"
    >
      <svg viewBox="0 0 720 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block drop-shadow-sm">
        <defs>
          <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "hsl(var(--background))" }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--muted))" }} />
          </linearGradient>
          <linearGradient id="barEnd" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: "hsl(var(--muted))" }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--background))" }} />
          </linearGradient>
        </defs>

        {/* Strings */}
        <line x1="360" y1="6" x2="24" y2="58" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="360" y1="6" x2="696" y2="58" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" strokeLinecap="round" />

        {/* Bar */}
        <rect x="0" y="55" width="720" height="22" rx="3" fill="url(#bar)" stroke="hsl(var(--border))" strokeWidth="0.5" />
        <line x1="0" y1="62" x2="720" y2="62" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <line x1="0" y1="68" x2="720" y2="68" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

        {/* End caps */}
        <rect x="0" y="55" width="14" height="22" rx="2" fill="url(#barEnd)" stroke="hsl(var(--border))" strokeWidth="0.5" />
        <rect x="706" y="55" width="14" height="22" rx="2" fill="url(#barEnd)" stroke="hsl(var(--border))" strokeWidth="0.5" />

        {/* Clips */}
        <circle cx="24" cy="66" r="5" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
        <circle cx="24" cy="66" r="2.2" fill="hsl(var(--primary))" />
        <circle cx="696" cy="66" r="5" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
        <circle cx="696" cy="66" r="2.2" fill="hsl(var(--primary))" />

        {/* Nail */}
        <line x1="360" y1="6" x2="360" y2="14" stroke="hsl(var(--foreground))" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="360" cy="5" r="4" fill="hsl(var(--muted-foreground))" />
        <circle cx="358.5" cy="3.5" r="1.3" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}