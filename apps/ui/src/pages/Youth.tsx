import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getYouthPlayers } from '../api/engine';
import { YouthPlayer } from '../types';
import { DataTable } from '../components/layout/DataTable';
import { StatBar } from '../components/layout/StatBar';
import { GraduationCap } from 'lucide-react';

export const Youth: React.FC = () => {
  const { club, isLoading: gameLoading } = useGameStore();
  const [players, setPlayers] = useState<YouthPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchYouth = async () => {
    if (!club) return;
    try {
      const data = await getYouthPlayers(club.id);
      setPlayers(data.filter(p => !p.promoted));
    } catch (error) {
      console.error("Failed to fetch youth players:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchYouth();
  }, [club]);

  const columns = [
    { key: 'name', label: 'Name', width: 200 },
    { key: 'age', label: 'Age', width: 60, align: 'center' as const },
    { key: 'position', label: 'Position', width: 100 },
    { key: 'nationality', label: 'Nat', width: 60 },
    {
      key: 'pa',
      label: 'Potential',
      render: (val: number) => (
        <div className="w-24">
          <StatBar value={val} size="sm" />
        </div>
      )
    },
    {
      key: 'intake_season',
      label: 'Intake',
      align: 'right' as const,
      render: (val: number) => <span className="font-mono text-[var(--text-3)]">S{val}</span>
    },
    /*
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (_: any, row: YouthPlayer) => (
        <button
          className="text-[11px] font-bold uppercase text-[var(--accent)] hover:underline"
          onClick={() => alert('Promotion logic to be implemented')}
        >
          Promote
        </button>
      )
    }
    */
  ];

  if (isLoading || gameLoading) {
    return <div className="p-8 text-center animate-pulse text-[var(--text-2)] uppercase tracking-widest">Scouting Youth Academy...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--accent)]">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Youth Academy</h2>
            <p className="text-xs text-[var(--text-2)]">Future stars currently in development</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Active Prospects</div>
          <div className="text-lg font-mono font-bold">{players.length}</div>
        </div>
      </div>

      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
        <DataTable
          columns={columns}
          rows={players}
          emptyMessage="No youth prospects currently in the academy."
        />
      </div>

      <div className="p-4 bg-[#ffffff03] border border-[var(--border)] rounded flex items-start gap-3">
        <div className="text-[var(--amber)] mt-0.5">ⓘ</div>
        <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
          Youth players are automatically generated every season during the Intake period.
          Their potential is influenced by your <span className="text-[var(--text-1)] font-bold">Youth Academy facilities</span>.
          Once they reach 18, they must be promoted to the senior squad or released.
        </p>
      </div>
    </div>
  );
};
