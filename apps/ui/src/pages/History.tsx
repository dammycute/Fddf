import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { getClubHistory } from '../api/engine';
import { Trophy, Users, History as HistoryIcon, Star } from 'lucide-react';
import { ClubHistory } from '../types';

export const History: React.FC = () => {
  const { club, newsFeed } = useGameStore();
  const [history, setHistory] = useState<ClubHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!club) return;
      try {
        const res = await getClubHistory(club.id);
        setHistory(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [club]);

  const honours = useMemo(() => {
    return history.filter(h => h.achievement.toLowerCase().includes('champion') || h.achievement.toLowerCase().includes('winner'));
  }, [history]);

  const legends = useMemo(() => {
    // Mock legends derivation from history data or squad history
    return [
      { name: 'John Smith', peak: 145, seasons: 8, achievement: '2x League Champion' },
      { name: 'Dave Wilson', peak: 138, seasons: 6, achievement: 'Club Record Scorer' }
    ];
  }, []);

  const memorableMatches = useMemo(() => {
    return newsFeed.filter(n => n.importance >= 3).slice(0, 5);
  }, [newsFeed]);

  if (isLoading) return <div className="p-8 text-center animate-pulse uppercase tracking-widest text-[var(--text-3)]">Retrieving Archives...</div>;

  return (
    <div className="space-y-8 h-full overflow-y-auto pr-2 pb-12">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT: CLUB HONOURS */}
        <section className="bg-[var(--bg-panel)] border border-[var(--border)] rounded flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[#ffffff03] flex items-center gap-2">
             <Trophy size={16} className="text-[var(--amber)]" />
             <h2 className="text-[10px] font-bold uppercase text-[var(--text-2)] tracking-widest">Club Honours</h2>
          </div>
          <div className="p-6 space-y-6">
             {honours.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-3)] italic text-sm">No honours recorded yet.</div>
             ) : (
                honours.map((h, i) => (
                   <div key={i} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-[var(--bg-base)] border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--amber)] group-hover:scale-110 transition-transform">
                         <Trophy size={20} />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-[var(--text-1)]">{h.achievement}</div>
                         <div className="text-[11px] font-mono text-[var(--text-3)]">Season {h.season}</div>
                      </div>
                   </div>
                ))
             )}
          </div>
        </section>

        {/* RIGHT: CLUB LEGENDS */}
        <section className="bg-[var(--bg-panel)] border border-[var(--border)] rounded flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[#ffffff03] flex items-center gap-2">
             <Users size={16} className="text-[var(--accent)]" />
             <h2 className="text-[10px] font-bold uppercase text-[var(--text-2)] tracking-widest">Club Legends</h2>
          </div>
          <div className="p-6">
             <table className="w-full text-left">
                <thead>
                   <tr className="text-[10px] uppercase text-[var(--text-3)] font-bold border-b border-[var(--border)]">
                      <th className="pb-2">Name</th>
                      <th className="pb-2 text-center">Peak</th>
                      <th className="pb-2 text-center">Yrs</th>
                      <th className="pb-2 text-right">Achievement</th>
                   </tr>
                </thead>
                <tbody className="text-[13px]">
                   {legends.map((l, i) => (
                      <tr key={i} className="border-b border-[var(--border)] group hover:bg-[#ffffff03]">
                         <td className="py-3 font-bold text-[var(--text-1)]">{l.name}</td>
                         <td className="py-3 text-center font-mono text-[var(--accent)]">{l.peak}</td>
                         <td className="py-3 text-center text-[var(--text-2)]">{l.seasons}</td>
                         <td className="py-3 text-right text-[var(--text-3)]">{l.achievement}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </section>
      </div>

      {/* MEMORABLE MATCHES */}
      <section className="space-y-4">
         <h2 className="text-[10px] font-bold uppercase text-[var(--text-2)] tracking-widest flex items-center gap-2">
            <HistoryIcon size={16} /> Memorable Matches & Events
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memorableMatches.map((n, i) => (
               <div key={i} className="bg-[var(--bg-panel)] border border-[var(--border)] p-6 rounded relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)] opacity-[0.03] -mr-8 -mt-8 rounded-full" />
                  <div className="text-[10px] font-mono text-[var(--text-3)] mb-2">{new Date(n.date).toLocaleDateString()}</div>
                  <h3 className="text-base font-bold text-[var(--text-1)] mb-2 line-clamp-1">{n.title}</h3>
                  <p className="text-xs text-[var(--text-2)] line-clamp-3 leading-relaxed">{n.content}</p>
               </div>
            ))}
            {memorableMatches.length === 0 && (
               <div className="col-span-full py-12 text-center bg-[var(--bg-panel)] border border-[var(--border)] border-dashed rounded text-[var(--text-3)] italic">
                  No memorable events recorded yet.
               </div>
            )}
         </div>
      </section>

    </div>
  );
};
