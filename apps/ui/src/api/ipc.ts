// ── IPC type definitions (mirrored from electron preload) ───
// Declared locally to avoid cross-package import issues at this stage.

export interface GameCommand {
  type: string;
  payload?: unknown;
}

export interface GameResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}

// ── Window.api shape exposed by the Electron preload script ─
interface WindowApi {
  command(payload: GameCommand): void;
  onResponse(cb: (res: GameResponse) => void): void;
}

declare global {
  interface Window {
    api: WindowApi;
  }
}

// ── Domain types matching the Python engine responses ───────

export interface ClubInfo {
  name: string;
  balance: number;
  reputation: number;
  squad_size: number;
}

export interface Fixture {
  id: number;
  date: string | null;
  home_name: string | null;
  away_name: string | null;
  home_goals: number | null;
  away_goals: number | null;
  status: string;
}

export interface LeagueRow {
  club_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

// ── Typed async wrappers ────────────────────────────────────

/**
 * Send a command and wait for the engine's response.
 * Wraps the fire-and-listen preload API into a single Promise.
 */
function sendCommand<T = unknown>(cmd: GameCommand): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Register a one-shot listener *before* sending, so we never miss the reply
    const handler = (res: GameResponse) => {
      // Clean up so we don't leak listeners
      // (onResponse uses ipcRenderer.on, but we only want the next one)
      // This works because we enforce one in-flight command at a time.
      if (!res.ok) {
        reject(new Error(res.error ?? 'Unknown engine error'));
      } else {
        resolve(res.data as T);
      }
    };

    window.api.onResponse(handler);
    window.api.command(cmd);
  });
}

/** Fetch info for a single club. */
export function getClub(clubId: number): Promise<ClubInfo> {
  return sendCommand<ClubInfo>({ type: 'GET_CLUB', payload: { club_id: clubId } });
}

/** Advance the simulation by one day. */
export async function nextTick(): Promise<void> {
  await sendCommand({ type: 'NEXT_TICK' });
}

/** Fetch all fixtures for a club. */
export function getFixtures(clubId: number): Promise<Fixture[]> {
  return sendCommand<Fixture[]>({ type: 'GET_FIXTURES', payload: { club_id: clubId } });
}

/** Fetch the full league table. */
export function getLeagueTable(leagueId: number): Promise<LeagueRow[]> {
  return sendCommand<LeagueRow[]>({ type: 'GET_LEAGUE_TABLE', payload: { league_id: leagueId } });
}
