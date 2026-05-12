# Football Chairman Simulation

A deep, desktop-first offline football club management simulation focused on emergent storytelling and a complex club ecosystem. Inspired by the high-density data aesthetic of games like Football Manager (FM24/26).

## 🚀 Tech Stack

- **Frontend:** React 19, TypeScript 6, TailwindCSS 4, Vite 8, Zustand (State Management).
- **Desktop Wrapper:** Electron 42.
- **Simulation Engine:** Python 3.11+, SQLAlchemy 2.0 (ORM), NumPy, Pandas.
- **Database:** SQLite with WAL (Write-Ahead Logging) for concurrent simulation performance.

## 🏗️ Architecture

The project maintains a strict separation between the user interface and the core simulation logic:

- **Engine-UI IPC Contract:** Communication is handled via a secure Electron IPC bridge using `contextBridge`. Requests are correlated using `request_id` mapping to support asynchronous, parallel data fetching without race conditions or memory leaks.
- **Simulation Engine:** A tick-based Python core that handles match simulation, financial transactions, player growth, and AI decision-making.
- **Data Layer:** Persistent storage in SQLite, managing clubs, players, fixtures, contracts, facilities, and club history.

## 🌟 Key Features

### ⚽ Simulation Systems
- **Deterministic Match Engine:** Seeded by fixture ID, simulating matches in 5-minute blocks with team ratings, tactical styles, and stochastic event generation (goals, cards, injuries).
- **Dynamic Growth:** Fractional CA (Current Ability) growth and decay based on age, facilities, and game time.
- **Morale & Injuries:** Complex psychological drift and injury risk models influenced by results and facility quality.
- **AI Ecosystem:** AI clubs independently manage squad evaluation, recruitment, and staff hiring.

### 📊 Professional UI (FM Aesthetic)
- **High-Density Dashboards:** 3-column layouts and compact data tables (32-36px row height) for maximum information density.
- **Financial Suite:** Zero-dependency SVG balance tracking, budget summaries, and detailed transaction logs.
- **Youth Academy:** Star-based potential mapping and annual intake simulation.
- **Inbox System:** Importance-weighted news feed with unread tracking and deep message views.
- **Player Profiles:** Slide-over detail panels with technical/physical attribute grids and contract management.

## 📂 Project Structure

```text
├── apps/
│   ├── ui/             # React + Tailwind Frontend
│   └── electron/       # Electron Main Process & IPC Bridge
├── engine/
│   ├── core/           # Main Simulation Engine & Dispatcher
│   ├── models/         # SQLAlchemy Database Models
│   ├── systems/        # Daily Tick Systems (Injury, Development, etc.)
│   ├── ai/             # Recruitment & Manager AI Logic
│   └── match/          # Deterministic Match Engine
├── data/               # SQLite Database Files
└── tests/              # Engine Unit & Integration Tests
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (Latest LTS)
- Python 3.11+
- Git

### Installation

1. **Install UI Dependencies:**
   ```bash
   cd apps/ui
   npm install
   ```

2. **Install Electron Dependencies:**
   ```bash
   cd apps/electron
   npm install
   ```

3. **Install Engine Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Development

1. **Start the Vite Dev Server:**
   ```bash
   cd apps/ui
   npm run dev
   ```

2. **Launch Electron:**
   ```bash
   cd apps/electron
   npm start
   ```

3. **Run Engine Tests:**
   ```bash
   PYTHONPATH=. python3 -m pytest
   ```

## 📜 Coding Conventions
- **UI:** FM-style color tokens (`--bg-panel`, `--accent`, etc.), monospaced numbers, and `lucide-react` icons.
- **Engine:** Type-hinted Python 3.11, snake_case methods to match IPC JSON payloads, and robust error handling in simulation loops.
