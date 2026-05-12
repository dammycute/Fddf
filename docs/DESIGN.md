# Football Chairman Simulation - Comprehensive Design & Architecture

## 1. Full Architecture Plan
The system is built on a **Decoupled Service Architecture**.

- **Frontend**: React 18+ with TypeScript. Uses **Zustand** for state management to handle the high volume of data updates.
- **Electron Bridge**: Uses `contextBridge` for secure IPC. The main process spawns and manages a persistent Python sidecar process.
- **Simulation Engine**: A Python 3.11+ application. It runs as a service that listens for commands (e.g., `next_day`, `get_squad`, `set_tactics`) and emits events.
- **Database**: SQLite 3 with WAL (Write-Ahead Logging) mode enabled for concurrent read/write performance during simulation.

## 2. Folder Structure
```text
football-chairman/
├── apps/
│   ├── ui/                 # React + Tailwind + Vite
│   │   ├── src/
│   │   │   ├── api/        # IPC wrappers
│   │   │   ├── components/ # UI components (shadcn/ui inspired)
│   │   │   ├── store/      # Global state
│   │   │   └── types/      # Shared TS interfaces
│   └── electron/           # Electron main & preload
├── engine/                 # Python Simulation Engine
│   ├── api/                # IPC/Socket handler
│   ├── core/               # Game loop, world state
│   ├── match/              # Match Engine
│   ├── ai/                 # Recruitment & Manager AI
│   ├── systems/            # Economy, Facilities, Fans
│   └── data/               # SQLite models (SQLAlchemy)
├── data/                   # Save files & Static Data
└── docs/                   # Full documentation
```

## 3. Database Schema (Detailed)

### Clubs
- `id` (PK), `name`, `reputation` (0-10000), `balance`, `transfer_budget`, `wage_budget`
- `stadium_id`, `training_lvl`, `youth_lvl`, `medical_lvl`
- `manager_id`, `philosophy_id`

### Players
- `id` (PK), `club_id` (FK), `name`, `age`, `nationality`
- **Technical**: `finishing`, `passing`, `tackling`, `dribbling`, `positioning`, ...
- **Physical**: `pace`, `stamina`, `strength`, `agility`, `injury_proneness`
- **Mental**: `aggression`, `composure`, `decisions`, `determination`, `vision`, `work_rate`
- **Hidden**: `potential_ability`, `current_ability`, `professionalism`, `loyalty`, `ambition`, `pressure`
- `morale`, `fitness`, `sharpness`, `injury_id`

### Fixtures
- `id`, `league_id`, `home_id`, `away_id`, `date`, `status` (scheduled/played)
- `home_goals`, `away_goals`, `match_data_path` (link to detailed match stats)

## 4. Simulation Engine Design
- **State Machine**: The engine transitions between `IDLE`, `SIMULATING`, and `SYNCING` states.
- **The Tick**: One tick = 12 hours.
    - **AM Tick**: Training updates, scouting reports, recovery.
    - **PM Tick**: Match simulations, financial daily updates, news generation.

## 5. Match Engine Logic
- **Action-Point System**: Every player in the match has an action-point (AP) pool that regenerates based on stamina and work rate.
- **Logic Flow**:
    1. **Possession Phase**: Determine which team has the ball based on midfield attributes and tactics.
    2. **Positioning Phase**: Update XY coordinates of all 22 players based on the ball position and roles.
    3. **Decision Phase**: The ball carrier chooses an action (Pass, Shoot, Dribble) using a weighted probability (Attributes * Morale * Pressure).
    4. **Resolution Phase**: Roll against the opponent's attributes (e.g., Passing vs. Interception).

## 6. AI Systems Architecture
- **Squad Planner**: AI evaluates every position. If `Current Quality < Club Reputation Tier`, mark as "Need Upgrade".
- **Recruitment AI**:
    1. Filter scouts' database for "Need Upgrade" positions.
    2. Sort by `Value/Wage` vs `Remaining Budget`.
    3. Factor in "Youth Policy" (AI might prefer 18-21 year olds).

## 7. Event Systems
- **Global Event Bus**: All systems post to `event_bus.publish(topic, payload)`.
- **Story Triggers**: A listener that checks for patterns:
    - *Example*: `[Defeat, Defeat, Defeat] + [Low Morale]` -> Trigger "Losing the Dressing Room" news event.

## 8. Save System Architecture
- **Atomic Saves**:
    1. `BEGIN TRANSACTION`
    2. Dump volatile state to SQLite tables.
    3. `COMMIT`
    4. Copy `.sqlite` to `.fc_save` (zipped with metadata).

## 9. Desktop App Structure
- **Production**: Electron bundles the Python engine as a "Resource".
- **IPC Interface**:
    - `window.api.send('game:action', { type: 'NEXT_DAY' })`
    - `window.api.receive('game:state', (state) => { ... })`

## 10. Step-by-Step Implementation Roadmap
- **Phase 1**: SQLite Schema + World Gen (Players/Clubs) + Basic Next Day logic.
- **Phase 2**: Match Engine (2D math, probabilistic outcomes) + Tactics UI.
- **Phase 3**: Transfer Market AI + Financial Balance (Sponsorships/Wages).
- **Phase 4**: Personality traits influence + Dynamic Manager sacking/hiring.
- **Phase 5**: History tracking + News/Media System + Polish.

## 11. Suggested Algorithms
- **Attribute Decay**: `attr = attr * (1 - decay_rate)` where `decay_rate` increases after age 30.
- **Transfer Valuation**: `Value = (CA^2 * AgeFactor * ContractLength * Reputation)`.
- **Match Odds**: Modified Elo that factors in Home Advantage and recent form.

## 12. Performance Optimization Plan
- **Pre-calculation**: Store static attribute modifiers in memory.
- **Vectorized Math**: Use `numpy` for batch processing player attribute updates.
- **Lazy Loading**: UI only requests data for the current screen (e.g., only load the first 50 players in a list).

## 13. Modular Scalable Architecture
- **Plugin System**: Every major system (Match, Transfer, News) is a class implementing a common `System` interface, making it easy to add "DLC-like" features or mods later.

## 14. Example Code Structure

### Python Engine (Core)
```python
class SimulationEngine:
    def __init__(self, db_path):
        self.db = Database(db_path)
        self.systems = [MatchEngine(), TransferSystem(), FinancialSystem()]

    def tick(self):
        for system in self.systems:
            system.process(self.db)
        self.db.commit()
```

### UI Bridge (Electron)
```javascript
ipcMain.on('game:action', async (event, args) => {
    const result = await pythonProcess.send(args);
    event.reply('game:result', result);
});
```
