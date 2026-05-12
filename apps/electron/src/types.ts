/**
 * Shared type definitions for Electron ↔ Python IPC bridge.
 */

/** Command sent from the renderer to the Python engine. */
export interface GameCommand {
  type: string;
  payload?: unknown;
}

/** Response received from the Python engine. */
export interface GameResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}
