# Interactive Wall Calendar Component

A highly polished, interactive React/Next.js calendar widget designed around the aesthetics of a physical wall calendar. It features dynamic date-range selection, an integrated quick-notes system, real-time live weather theming, and an orbital clock.

**Live Demo:** [Check UI](https://takeuforwardcalendarui.vercel.app)

---

## 🛠 Core Features

1. **Wall Calendar Aesthetic:** 
   Features a physical spiral-binding aesthetic, dynamic "page flipping" 3D animations, and a prominent seasonal/weather hero image anchoring the design.

2. **Drag-to-Select Date Ranges:**
   Users can effortlessly interact with the calendar grid by clicking and dragging across days to create date ranges. It uses robust pointer-capture tracking (`elementFromPoint`) to ensure flawless selection even when moving the mouse off-card or dragging quickly.

3. **Integrated QuickNotes & Reminders:**
   - **Quick Notes (Right Panel):** Automatically syncs to the selected date range. Notes are stored in `localStorage` uniquely for your selected `From` – `To` timeframe.
   - **Tasks & Reminders (Left Panel):** A full-featured To-Do drag-and-drop Kanban board (To Do / Done) that supports setting specific due dates.

4. **Live Weather Atmosphere (Open-Meteo API):**
   The calendar requests the user's geolocation to fetch real-time weather using the free [Open-Meteo](https://open-meteo.com) API. Based on the temperature, precipitation, and WMO codes, the application beautifully transforms its background using GPU-accelerated CSS particle animations (e.g., drifting snow, sun rays, monsoon rain, or falling autumn leaves).

5. **Flawless Responsive Design:**
   - **Desktop:** Honors the classic spatial arrangement—a beautifully segmented 3-column layout.
   - **Mobile:** Gracefully unrolls into a touch-friendly vertical stack. Features are stacked sequentially (Calendar → Weather & Notes → Reminders) to maintain complete context and usability without cramped modals.

## 🚀 Technical Decisions & Architecture

- **State Management:** Used React custom hooks (`useCalendar`, `useTodos`, `useWeather`) to strictly decouple business logic from the UI presentation.
- **Animations:** Powered by `framer-motion` for fluid page flips, modal pop-ins, and layout shifts. Particle effects (snow, rain) use raw CSS `@keyframes` with `transform` to ensure 60fps performance and avoid layout thrashing.
- **Stack Context Fixes:** Engineered the modals (e.g., Tasks management) using standard React `createPortal` to safely break out of `z-index` stacking contexts, ensuring perfect mobile pop-ups.
- **Tailwind CSS:** Built exclusively with Tailwind CSS, utilizing heavily customized CSS Custom Properties (`--background`, etc.) to support seamless dark and light modes.

## ⚙️ Running Locally

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd CalendarUItask-takeuforward
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:** 
   Navigate to `http://localhost:5173` (or the port specified by Vite). Note that the weather feature will prompt for Location access.

## 🎥 Video Walkthrough

> **Evaluator Note:** Please find the attached video demonstration as requested.

[Desktop Version(recommended for video quality*)](https://youtu.be/q1Z_S0YsVnQ)

[Mobile Version](https://youtube.com/shorts/9sPUb2S-234)

*Note: Mobile version video quality is not good as it is recorded from mobile device.

