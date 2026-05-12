import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getTransferOffers, respondToOffer } from '../api/engine';
import { TransferOffer } from '../types';
import { DataTable } from '../components/layout/DataTable';
import { Badge } from '../components/layout/Badge';
import { Check, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const Transfers: React.FC = () => {
  const { club, isLoading: gameLoading } = useGameStore();
  const [offers, setOffers] = useState<TransferOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOffers = async () => {
    if (!club) return;
    try {
      const data = await getTransferOffers(club.id);
      setOffers(data);
    } catch (error) {
      console.error("Failed to fetch transfer offers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [club]);

  const handleResponse = async (offerId: number, accept: boolean) => {
    try {
      await respondToOffer(offerId, accept);
      fetchOffers(); // Refresh
    } catch (error) {
      console.error(`Failed to ${accept ? 'accept' : 'reject'} offer:`, error);
    }
  };

  const incomingPending = offers.filter(o => o.to_club_id === club?.id && o.status === 'PENDING');
  const others = offers.filter(o => !(o.to_club_id === club?.id && o.status === 'PENDING'));

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `£${(val / 1_000_000).toFixed(1)}m`;
    if (val >= 1_000) return `£${(val / 1_000).toFixed(0)}k`;
    return `£${val}`;
  };

  const columns = [
    {
      key: 'type',
      label: '',
      width: 40,
      render: (_: any, row: TransferOffer) => (
        row.to_club_id === club?.id ?
          <ArrowDownLeft size={16} className="text-[var(--red)]" /> :
          <ArrowUpRight size={16} className="text-[var(--green)]" />
      )
    },
    { key: 'player_name', label: 'Player', width: 200 },
    {
      key: 'clubs',
      label: 'From / To',
      render: (_: any, row: TransferOffer) => (
        <span className="text-[var(--text-2)]">
          {row.to_club_id === club?.id ? row.from_club_name : row.to_club_name || 'Transfer List'}
        </span>
      )
    },
    {
      key: 'fee',
      label: 'Fee',
      align: 'right' as const,
      render: (val: number) => <span className="font-mono font-bold text-[var(--accent)]">{formatCurrency(val)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => {
        let color: 'blue' | 'green' | 'red' | 'amber' | 'gray' = 'gray';
        if (val === 'PENDING') color = 'amber';
        if (val === 'ACCEPTED') color = 'green';
        if (val === 'REJECTED') color = 'red';
        if (val === 'LISTED') color = 'blue';
        return <Badge label={val} color={color} />;
      }
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (_: any, row: TransferOffer) => {
        if (row.to_club_id === club?.id && row.status === 'PENDING') {
          return (
            <div className="flex gap-2 justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); handleResponse(row.id, true); }}
                className="p-1 hover:bg-[var(--green)] hover:text-black rounded transition-colors text-[var(--green)]"
                title="Accept"
              >
                <Check size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleResponse(row.id, false); }}
                className="p-1 hover:bg-[var(--red)] hover:text-white rounded transition-colors text-[var(--red)]"
                title="Reject"
              >
                <X size={16} />
              </button>
            </div>
          );
        }
        return null;
      }
    }
  ];

  if (isLoading || gameLoading) {
    return <div className="p-8 text-center animate-pulse text-[var(--text-2)] uppercase tracking-widest">Loading Market Data...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold uppercase tracking-tight">Pending Inbound Offers</h2>
          <span className="text-xs font-mono text-[var(--text-3)]">{incomingPending.length} pending</span>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
          <DataTable
            columns={columns}
            rows={incomingPending}
            emptyMessage="No pending offers for your players"
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold uppercase tracking-tight">Recent Activity</h2>
          <span className="text-xs font-mono text-[var(--text-3)]">{others.length} records</span>
        </div>
        <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
          <DataTable
            columns={columns}
            rows={others}
            emptyMessage="No recent transfer activity"
          />
        </div>
      </section>
    </div>
  );
};
