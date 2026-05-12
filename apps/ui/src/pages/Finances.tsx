import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getFinancials } from '../api/engine';
import { DataTable } from '../components/layout/DataTable';
import { TrendingUp, TrendingDown, Landmark, Wallet } from 'lucide-react';

export const Finances: React.FC = () => {
  const { club, isLoading: gameLoading } = useGameStore();
  const [data, setData] = useState<{ records: any[], sponsorships: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      if (!club) return;
      try {
        const res = await getFinancials(club.id);
        setData(res);
      } catch (error) {
        console.error("Failed to fetch finances:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFinances();
  }, [club]);

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val);
    let formatted = "";
    if (absVal >= 1_000_000) formatted = `£${(absVal / 1_000_000).toFixed(2)}m`;
    else if (absVal >= 1_000) formatted = `£${(absVal / 1_000).toFixed(0)}k`;
    else formatted = `£${absVal}`;
    return val < 0 ? `(${formatted})` : formatted;
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      width: 120,
      render: (val: string) => <span className="font-mono text-[var(--text-3)]">{new Date(val).toLocaleDateString()}</span>
    },
    { key: 'description', label: 'Description' },
    { key: 'type', label: 'Type', width: 120 },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right' as const,
      render: (val: number) => (
        <span className={`font-mono font-bold ${val >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
          {formatCurrency(val)}
        </span>
      )
    }
  ];

  if (isLoading || gameLoading) {
    return <div className="p-8 text-center animate-pulse text-[var(--text-2)] uppercase tracking-widest">Auditing Accounts...</div>;
  }

  const netBalance = data?.records.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-4">
          <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Overall Balance</div>
          <div className="text-xl font-mono font-bold text-[var(--text-1)]">{formatCurrency(club?.balance || 0)}</div>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-4">
          <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Transfer Budget</div>
          <div className="text-xl font-mono font-bold text-[var(--accent)]">{formatCurrency(club?.transfer_budget || 0)}</div>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-4">
          <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Weekly Wage Bill</div>
          <div className="text-xl font-mono font-bold text-[var(--amber)]">{formatCurrency(club?.wage_budget || 0)}</div>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-4">
          <div className="text-[10px] text-[var(--text-3)] uppercase font-bold mb-1">Monthly Net</div>
          <div className={`text-xl font-mono font-bold ${netBalance >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
            {formatCurrency(netBalance)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-2)] flex items-center gap-2">
            <Wallet size={16} /> Recent Transactions
          </h2>
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
            <DataTable columns={columns} rows={data?.records || []} emptyMessage="No transactions this month." />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-2)] flex items-center gap-2">
            <Landmark size={16} /> Sponsorships
          </h2>
          <div className="space-y-2">
            {data?.sponsorships.map(s => (
              <div key={s.id} className="bg-[var(--bg-panel)] border border-[var(--border)] p-4">
                <div className="text-xs font-bold text-[var(--text-1)]">{s.sponsor}</div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-sm font-mono text-[var(--green)] font-bold">{formatCurrency(s.amount)}/yr</div>
                  <div className="text-[10px] text-[var(--text-3)] uppercase">Ends S{s.end_season}</div>
                </div>
              </div>
            ))}
            {(!data?.sponsorships || data.sponsorships.length === 0) && (
              <div className="p-4 border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-3)]">
                No active sponsorship deals.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
