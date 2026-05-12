import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { getYouthPlayers, promoteYouth } from '../api/engine';
import { DataTable } from '../components/layout/DataTable';
import { School, GraduationCap, Calendar, Star } from 'lucide-react';
import { YouthPlayer } from '../types';

export const Youth: React.FC = () => {
  const { club, lastTickDate } = useGameStore();
  const [players, setPlayers] = useState<YouthPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = async () => {
    if (!club) return;
    try {
      const res = await getYouthPlayers(club.id);
      setPlayers(res.filter(p => !p.promoted));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [club]);

  const getStars = (pa: number) => {
    if (pa >= 160) return 5;
    if (pa >= 140) return 4;
    if (pa >= 120) return 3;
    if (pa >= 100) return 2;
    return 1;
  };

  const renderStars = (pa: number) => {
    const count = getStars(pa);
    return (
      <div className="flex gap-0.5 text-[var(--amber)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={12} fill={i < count ? "currentColor" : "none"} strokeWidth={2} />
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse uppercase tracking-widest text-[var(--text-3)]">Scouting Academy...</div>;

  const bestPA = players.length > 0 ? Math.max(...players.map(p => p.pa)) : 0;

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 pb-12">

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-4 rounded">
            <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Youth Intake Quality</div>
            <div className="text-xl font-mono font-bold text-[var(--accent)]">Level 3</div>
         </div>
         <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-4 rounded">
            <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Academy Size</div>
            <div className="text-xl font-mono font-bold text-[var(--text-1)]">{players.length} Players</div>
         </div>
         <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-4 rounded">
            <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Top Prospect Potential</div>
            <div className="flex items-center gap-2 mt-1">
               {renderStars(bestPA)}
               <span className="text-xs font-mono font-bold text-[var(--text-2)]">{bestPA}</span>
            </div>
         </div>
         <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-4 rounded">
            <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Next Intake</div>
            <div className="text-xl font-mono font-bold text-[var(--amber)]">March 2027</div>
         </div>
      </div>

      {/* YOUTH SQUAD */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border)] rounded flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-[#ffffff03] flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase text-[var(--text-2)] tracking-widest flex items-center gap-2">
            <GraduationCap size={16} /> Academy Prospects
          </h2>
        </div>

        <DataTable
          columns={[
            { key: 'name', label: 'Name', width: 200 },
            { key: 'age', label: 'Age', width: 60, align: 'center' as const },
            { key: 'position', label: 'Position', width: 100 },
            {
              key: 'pa',
              label: 'Potential',
              render: (val: number) => renderStars(val)
            },
            {
              key: 'actions',
              label: '',
              align: 'right' as const,
              render: (_: any, row: YouthPlayer) => (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!club) return;
                    try {
                      await promoteYouth(club.id, row.id);
                      fetch();
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Promotion failed");
                    }
                  }}
                  className="px-3 py-1 bg-[var(--bg-input)] hover:bg-[var(--accent)] hover:text-white rounded text-[10px] font-bold uppercase transition-colors"
                >
                  Promote
                </button>
              )
            }
          ]}
          rows={players}
          emptyMessage="No youth players currently in the academy"
        />
      </section>

      {/* INTAKE PREVIEW */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border)] p-8 rounded border-dashed flex flex-col items-center justify-center text-center space-y-4">
         <div className="w-16 h-16 bg-[var(--bg-base)] rounded-full flex items-center justify-center text-[var(--text-3)] border border-[var(--border)]">
            <Calendar size={32} />
         </div>
         <div>
            <h3 className="text-sm font-bold uppercase text-[var(--text-1)]">Annual Youth Intake</h3>
            <p className="text-xs text-[var(--text-2)] max-w-md mt-2">
              The next batch of young talent will arrive in the spring of the next season.
              Your Youth Academy facilities level directly affects the quality of these prospects.
            </p>
         </div>
         <div className="flex gap-8 mt-4">
            <div className="text-center">
               <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Countdown</div>
               <div className="text-lg font-mono font-bold text-[var(--amber)]">~280 Days</div>
            </div>
            <div className="text-center">
               <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Scouting Grade</div>
               <div className="text-lg font-mono font-bold text-[var(--green)]">B+</div>
            </div>
         </div>
      </section>

    </div>
  );
};
