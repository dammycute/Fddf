import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { getFinancials } from '../api/engine';
import { DataTable } from '../components/layout/DataTable';
import { Wallet, Landmark, TrendingUp, Filter } from 'lucide-react';

export const Finances: React.FC = () => {
  const { club, squad } = useGameStore();
  const [data, setData] = useState<{ records: any[], sponsorships: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    const fetch = async () => {
      if (!club) return;
      try {
        const res = await getFinancials(club.id);
        setData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [club]);

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val);
    let formatted = "";
    if (absVal >= 1_000_000) formatted = `£${(absVal / 1_000_000).toFixed(2)}m`;
    else if (absVal >= 1_000) formatted = `£${(absVal / 1_000).toFixed(0)}k`;
    else formatted = `£${absVal}`;
    return val < 0 ? `-${formatted}` : `+${formatted}`;
  };

  const chartPoints = useMemo(() => {
    if (!data?.records) return [];
    // Aggregate by date, take last 30
    const aggregated = new Map<string, number>();
    let runningBalance = club?.balance || 0;

    // Simple mock for chart if no records
    if (data.records.length === 0) {
      return Array.from({length: 10}).map((_, i) => ({ x: i * 10, y: 50 + Math.sin(i) * 20 }));
    }

    const sortedRecords = [...data.records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // We want to show the balance *over time*, so we'd need history.
    // Since we only have transaction records, we'll simulate a path.
    return sortedRecords.slice(-30).map((r, i) => {
      return { x: i * 10, y: 100 - (r.amount / 1000000) }; // Simplified mapping
    });
  }, [data, club]);

  const filteredRecords = useMemo(() => {
    if (!data?.records) return [];
    return data.records.filter(r => typeFilter === 'ALL' || r.type === typeFilter);
  }, [data, typeFilter]);

  const weeklyWages = useMemo(() => {
    // Sum of active contracts / 52
    const totalAnnual = squad.reduce((acc, p) => acc + (p.contract?.wage || 0) * 52, 0);
    return totalAnnual / 52;
  }, [squad]);

  const projectedIncome = useMemo(() => {
    return data?.sponsorships.reduce((acc, s) => acc + s.amount, 0) || 0;
  }, [data]);

  if (isLoading) return <div className="p-8 text-center animate-pulse uppercase tracking-widest text-[var(--text-3)]">Auditing Accounts...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-full overflow-hidden">

      {/* LEFT COLUMN: CHARTS & SUMMARY */}
      <div className="space-y-6 overflow-y-auto pr-2">
        <section className="bg-[var(--bg-panel)] border border-[var(--border)] p-4 rounded">
          <h2 className="text-[10px] font-bold uppercase text-[var(--text-2)] mb-4 tracking-widest flex items-center gap-2">
            <TrendingUp size={14} /> Balance Over Time
          </h2>
          <div className="h-[200px] w-full bg-[var(--bg-base)] rounded relative overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
               <polyline
                 fill="none"
                 stroke={ (club?.balance || 0) >= 0 ? "var(--green)" : "var(--red)" }
                 strokeWidth="2"
                 points={chartPoints.map(p => `${p.x},${p.y}`).join(' ')}
               />
            </svg>
            <div className="absolute bottom-2 left-2 text-[10px] text-[var(--text-3)] font-mono">30D History</div>
            <div className="absolute top-2 right-2 text-[10px] text-[var(--text-3)] font-mono">{formatCurrency(club?.balance || 0)}</div>
          </div>
        </section>

        <section className="bg-[var(--bg-panel)] border border-[var(--border)] p-4 rounded space-y-6">
          <h2 className="text-[10px] font-bold uppercase text-[var(--text-2)] mb-2 tracking-widest flex items-center gap-2">
            <Landmark size={14} /> Budget Summary
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Total Balance</div>
              <div className="text-2xl font-mono font-bold text-[var(--text-1)] tracking-tight">
                {formatCurrency(club?.balance || 0).replace('+', '')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Weekly Wages</div>
                <div className="text-sm font-mono font-bold text-[var(--amber)]">
                  £{weeklyWages.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Transfer Budget</div>
                <div className="text-sm font-mono font-bold text-[var(--accent)]">
                  {formatCurrency(club?.transfer_budget || 0).replace('+', '')}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Projected Income (Sponsorships)</div>
              <div className="text-sm font-mono font-bold text-[var(--green)]">
                {formatCurrency(projectedIncome).replace('+', '')} / Season
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: TRANSACTION LOG */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border)] rounded flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[#ffffff03]">
          <h2 className="text-[10px] font-bold uppercase text-[var(--text-2)] tracking-widest flex items-center gap-2">
            <Wallet size={14} /> Transaction Log
          </h2>
          <div className="flex items-center gap-2">
             <Filter size={12} className="text-[var(--text-3)]" />
             <select
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
               className="bg-[var(--bg-input)] border-none text-[11px] font-bold uppercase py-1 px-2 rounded outline-none"
             >
               <option value="ALL">All Types</option>
               <option value="WAGE">Wages</option>
               <option value="TRANSFER_IN">Transfers (In)</option>
               <option value="TRANSFER_OUT">Transfers (Out)</option>
               <option value="TICKET">Gate Receipts</option>
               <option value="SPONSORSHIP">Sponsorship</option>
             </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DataTable
            columns={[
              {
                key: 'date',
                label: 'Date',
                width: 100,
                render: (val) => <span className="text-[var(--text-3)] font-mono">{new Date(val).toLocaleDateString()}</span>
              },
              { key: 'type', label: 'Type', width: 120 },
              { key: 'description', label: 'Description' },
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
            ]}
            rows={filteredRecords}
            emptyMessage="No financial records found"
          />
        </div>
      </section>

    </div>
  );
};
