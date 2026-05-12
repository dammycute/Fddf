import { contextBridge, ipcRenderer } from 'electron';
import type { GameCommand, GameResponse } from './types.js';

contextBridge.exposeInMainWorld('api', {
  /**
   * Send a command to the Python simulation engine.
   */
  command(payload: GameCommand): void {
    ipcRenderer.send('game:command', payload);
  },

  /**
   * Register a callback for engine responses.
   */
  onResponse(cb: (res: GameResponse) => void): void {
    ipcRenderer.on('game:response', (_event, data: GameResponse) => cb(data));
  },
});

// Re-export types for the UI layer to consume
export type { GameCommand, GameResponse };
