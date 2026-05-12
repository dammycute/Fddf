import React, { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { DataTable } from '../components/layout/DataTable';
import { Badge } from '../components/layout/Badge';
import { PlayerProfile } from '../components/PlayerProfile';
import { Check, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { respondToOffer, listPlayer, removeFromList, getScoutReports } from '../api/engine';

type Tab = 'OFFERS' | 'SCOUT_REPORTS' | 'TRANSFER_LIST';

export const Transfers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('OFFERS');
  const { transferOffers, club, squad, refreshTransfers } = useGameStore();
  const [scoutReports, setScoutReports] = useState<any[]>([]);
  const { selectedPlayerId, selectPlayer } = useUIStore();

  useEffect(() => {
    if (activeTab === 'SCOUT_REPORTS' && club) {
      getScoutReports(club.id).then(setScoutReports).catch(console.error);
    }
  }, [activeTab, club]);

  const handleResponse = async (offerId: number, accept: boolean) => {
    try {
      await respondToOffer(offerId, accept);
      refreshTransfers();
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `£${(val / 1_000_000).toFixed(1)}m`;
    if (val >= 1_000) return `£${(val / 1_000).toFixed(0)}k`;
    return `£${val}`;
  };

  const offerColumns = [
    {
      key: 'type',
      label: '',
      width: 40,
      render: (_: any, row: any) => (
        row.to_club_id === club?.id ?
          <ArrowDownLeft size={16} className="text-[var(--red)]" /> :
          <ArrowUpRight size={16} className="text-[var(--green)]" />
      )
    },
    { key: 'player_name', label: 'Player', width: 200 },
    {
      key: 'from_club_name',
      label: 'From',
      render: (val: string) => val || 'AI/Free Agent'
    },
    {
      key: 'to_club_name',
      label: 'To',
      render: (val: string) => val || 'Transfer List'
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
      render: (_: any, row: any) => {
        if (row.to_club_id === club?.id && row.status === 'PENDING') {
          return (
            <div className="flex gap-2 justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); handleResponse(row.id, true); }}
                className="p-1 hover:bg-[var(--green)] hover:text-black rounded transition-colors text-[var(--green)]"
              >
                <Check size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleResponse(row.id, false); }}
                className="p-1 hover:bg-[var(--red)] hover:text-white rounded transition-colors text-[var(--red)]"
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

  const listedPlayers = squad.filter(p => transferOffers.some(o => o.player_id === p.id && o.status === 'LISTED'));

  const listColumns = [
    { key: 'name', label: 'Name', width: 200 },
    { key: 'age', label: 'Age', width: 60, align: 'center' as const },
    { key: 'ca', label: 'CA', width: 60, align: 'center' as const },
    {
      key: 'fee',
      label: 'Listed Fee',
      render: (_: any, row: any) => {
        const offer = transferOffers.find(o => o.player_id === row.id && o.status === 'LISTED');
        return <span className="font-mono font-bold">{formatCurrency(offer?.fee || 0)}</span>;
      }
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (_: any, row: any) => (
        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (!club) return;
            try {
              await removeFromList(club.id, row.id);
              refreshTransfers();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Failed to remove from list");
            }
          }}
          className="text-xs font-bold uppercase text-[var(--red)] hover:underline"
        >
          Remove from list
        </button>
      )
    }
  ];

  const selectedPlayer = squad.find(p => p.id === selectedPlayerId);

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* TABS */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {(['OFFERS', 'SCOUT_REPORTS', 'TRANSFER_LIST'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative
              ${activeTab === tab ? 'text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}
            `}
          >
            {tab.replace('_', ' ')}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'OFFERS' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-bold uppercase text-[var(--text-2)] mb-4 tracking-widest">Incoming Offers</h2>
              <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
                <DataTable
                  columns={offerColumns}
                  rows={transferOffers.filter(o => o.to_club_id === club?.id && o.status !== 'LISTED')}
                  emptyMessage="No incoming offers"
                />
              </div>
            </section>
            <section>
              <h2 className="text-sm font-bold uppercase text-[var(--text-2)] mb-4 tracking-widest">Outgoing Offers</h2>
              <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
                <DataTable
                  columns={offerColumns}
                  rows={transferOffers.filter(o => o.from_club_id === club?.id)}
                  emptyMessage="No outgoing offers"
                />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'SCOUT_REPORTS' && (
           <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
             <DataTable
               columns={[
                 { key: 'name', label: 'Player', width: 200 },
                 { key: 'position', label: 'Position', width: 100 },
                 { key: 'ca', label: 'CA Est.', width: 80, align: 'center' as const },
                 { key: 'pa', label: 'PA Est.', width: 80, align: 'center' as const, sortable: true },
                 { key: 'club_name', label: 'Club' },
                 { key: 'scout_name', label: 'Scout' },
                 { key: 'created_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() }
               ]}
               rows={scoutReports}
               emptyMessage="No scout reports available"
               onRowClick={(r) => selectPlayer(r.player_id)}
               sortKey="pa"
               sortDir="desc"
             />
           </div>
        )}

        {activeTab === 'TRANSFER_LIST' && (
           <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
             <DataTable
               columns={listColumns}
               rows={listedPlayers}
               emptyMessage="No players currently on the transfer list"
               onRowClick={(p) => selectPlayer(p.id)}
             />
           </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerProfile
          player={selectedPlayer}
          onClose={() => selectPlayer(null)}
          showActions={activeTab !== 'TRANSFER_LIST'}
        />
      )}
    </div>
  );
};
