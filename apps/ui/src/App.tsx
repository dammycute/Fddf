import { useEffect, useState } from 'react';
import { getClub, type ClubInfo } from './api/ipc';

function App() {
  const [club, setClub] = useState<ClubInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClub(1)
      .then(setClub)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Football Chairman</h1>

      {error && (
        <p className="text-red-400 mb-4">Engine error: {error}</p>
      )}

      {club ? (
        <div className="bg-slate-800 rounded-lg p-6 max-w-md space-y-2">
          <h2 className="text-2xl font-semibold">{club.name}</h2>
          <p className="text-slate-400">
            Balance: <span className="text-emerald-400 font-mono">£{club.balance.toLocaleString()}</span>
          </p>
          <p className="text-slate-400">
            Reputation: <span className="text-amber-400 font-mono">{club.reputation.toLocaleString()}</span>
          </p>
          <p className="text-slate-400">
            Squad Size: <span className="text-sky-400 font-mono">{club.squad_size}</span>
          </p>
        </div>
      ) : (
        !error && <p className="text-slate-400">Simulation Engine Initialized. Welcome, Chairman.</p>
      )}
    </div>
  );
}

export default App;
