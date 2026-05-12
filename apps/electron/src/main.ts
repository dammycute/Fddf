import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import { createInterface, Interface as ReadlineInterface } from 'readline';
import path from 'path';
import type { GameResponse } from './types.js';

// ── Python sidecar process ──────────────────────────────────
let pythonProcess: ChildProcess | null = null;
let stdoutRL: ReadlineInterface | null = null;

/**
 * Spawn the Python simulation engine as a child process.
 * - Development: runs `python -m engine.main` from the repo root.
 * - Production: runs the bundled binary from Electron's resourcesPath.
 */
function spawnPythonEngine(): void {
  const isDev = process.env.NODE_ENV === 'development';
  const repoRoot = path.resolve(__dirname, '..', '..', '..');

  if (isDev) {
    pythonProcess = spawn('python', ['-m', 'engine.main'], {
      cwd: repoRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } else {
    const binaryPath = path.join(process.resourcesPath, 'engine', 'engine');
    pythonProcess = spawn(binaryPath, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  }

  // Pipe stderr to the main-process console for debugging
  pythonProcess.stderr?.on('data', (chunk: Buffer) => {
    console.error(`[python:stderr] ${chunk.toString().trimEnd()}`);
  });

  pythonProcess.on('error', (err) => {
    console.error('[python] Failed to start engine:', err.message);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`[python] Engine exited (code=${code}, signal=${signal})`);
    pythonProcess = null;
    stdoutRL = null;
  });

  // Create a readline interface on stdout so we can read line-by-line
  if (pythonProcess.stdout) {
    stdoutRL = createInterface({ input: pythonProcess.stdout });
  }
}

// ── Pending response handling ──
type PendingResolve = (line: string) => void;
// Map request_id to its resolver
const pendingRequests = new Map<string, PendingResolve>();

function setupStdoutListener(): void {
  if (!stdoutRL) return;
  stdoutRL.on('line', (line: string) => {
    try {
      const parsed = JSON.parse(line);
      const requestId = parsed.request_id;
      if (requestId && pendingRequests.has(requestId)) {
        const resolve = pendingRequests.get(requestId)!;
        pendingRequests.delete(requestId);
        resolve(line);
      }
    } catch {
      // Not a JSON response or missing request_id, ignore
    }
  });
}

// ── IPC bridge: renderer → Python → renderer ────────────────
function registerIpcHandlers(): void {
  ipcMain.on('game:command', async (event, payload) => {
    if (!pythonProcess?.stdin || !stdoutRL) {
      event.reply('game:response', {
        ok: false,
        error: 'engine_not_running',
      } satisfies GameResponse);
      return;
    }

    // Attach request_id if present in payload (sent from UI)
    const requestId = payload.request_id || Math.random().toString(36).slice(2);
    const cmdWithId = { ...payload, request_id: requestId };

    try {
      // Serialize and send to Python stdin (one JSON line)
      const jsonLine = JSON.stringify(cmdWithId) + '\n';

      const responsePromise = new Promise<string>((resolve) => {
        pendingRequests.set(requestId, resolve);
      });

      pythonProcess.stdin.write(jsonLine);

      // Wait for the specific response for this request_id
      const responseLine = await responsePromise;

      let parsed: GameResponse;
      try {
        parsed = JSON.parse(responseLine) as GameResponse;
      } catch {
        parsed = { ok: false, error: 'invalid_response' };
      }

      event.reply('game:response', parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      event.reply('game:response', {
        ok: false,
        error: message,
        request_id: requestId
      } satisfies GameResponse);
    }
  });
}

// ── Window creation ─────────────────────────────────────────
function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../ui/dist/index.html'));
  }
}

// ── App lifecycle ───────────────────────────────────────────
app.whenReady().then(() => {
  spawnPythonEngine();
  setupStdoutListener();
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
  }
});
