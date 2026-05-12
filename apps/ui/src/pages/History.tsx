import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getClubHistory } from '../api/engine';
import { ClubHistory as HistoryType } from '../types';
import { DataTable } from '../components/layout/DataTable';
import { Trophy } from 'lucide-react';

export const History: React.FC = () => {
  const { club, isLoading: gameLoading } = useGameStore();
  const [history, setHistory] = useState<HistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    if (!club) return;
    try {
      const data = await getClubHistory(club.id);
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch club history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [club]);

  const columns = [
    {
      key: 'season',
      label: 'Season',
      width: 100,
      render: (val: number) => <span className="font-mono font-bold">20{val-1}/20{val}</span>
    },
    {
      key: 'achievement',
      label: 'Achievement',
      render: (val: string) => (
        <div className="flex items-center gap-2">
          {val.toLowerCase().includes('champion') && <Trophy size={14} className="text-[var(--amber)]" />}
          <span className="font-medium">{val}</span>
        </div>
      )
    },
    {
      key: 'pos',
      label: 'Pos',
      width: 60,
      align: 'center' as const,
      render: (_: any, row: HistoryType) => row.data?.position || '-'
    },
    {
      key: 'record',
      label: 'W-D-L',
      width: 120,
      align: 'center' as const,
      render: (_: any, row: HistoryType) => row.data?.won !== undefined ? `${row.data.won}-${row.data.drawn}-${row.data.lost}` : '-'
    }
  ];

  if (isLoading || gameLoading) {
    return <div className="p-8 text-center animate-pulse text-[var(--text-2)] uppercase tracking-widest">Compiling Records...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--amber)]">
          <Trophy size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Honours & History</h2>
          <p className="text-xs text-[var(--text-2)]">The legacy of {club?.name}</p>
        </div>
      </div>

      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
        <DataTable
          columns={columns}
          rows={history}
          emptyMessage="No history recorded yet. Complete a season to see results here."
        />
      </div>
    </div>
  );
};
