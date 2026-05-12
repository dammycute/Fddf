import React, { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { DataTable } from '../components/layout/DataTable';
import { StatBar } from '../components/layout/StatBar';
import { Badge } from '../components/layout/Badge';
import { Search } from 'lucide-react';
import { PlayerProfile } from '../components/PlayerProfile';

export const Squad: React.FC = () => {
  const { squad } = useGameStore();
  const { selectedPlayerId, selectPlayer } = useUIStore();
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: string, dir: 'asc' | 'desc' }>({ key: 'ca', dir: 'desc' });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc'
    }));
  };

  const processedSquad = useMemo(() => {
    let result = squad.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const pos = p.attributes?.position || 'CM';
      const matchesPos = posFilter === 'ALL' || pos === posFilter;
      return matchesSearch && matchesPos;
    });

    result.sort((a: any, b: any) => {
      const aVal = a[sortConfig.key] ?? a.attributes?.[sortConfig.key] ?? 0;
      const bVal = b[sortConfig.key] ?? b.attributes?.[sortConfig.key] ?? 0;
      return sortConfig.dir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [squad, search, posFilter, sortConfig]);

  const columns = [
    { key: 'name', label: 'Name', width: 180 },
    { key: 'position', label: 'Pos', width: 60, render: (_, p) => p.attributes?.position || 'CM' },
    { key: 'age', label: 'Age', width: 50, align: 'center' as const, sortable: true },
    { key: 'ca', label: 'CA', width: 50, align: 'right' as const, sortable: true },
    { key: 'pa', label: 'PA', width: 50, align: 'right' as const, sortable: true },
    { key: 'pace', label: 'Pac', width: 50, render: (_, p) => p.attributes?.pace || 10 },
    { key: 'passing', label: 'Pas', width: 50, render: (_, p) => p.attributes?.passing || 10 },
    { key: 'finishing', label: 'Fin', width: 50, render: (_, p) => p.attributes?.finishing || 10 },
    {
      key: 'morale',
      label: 'Morale',
      width: 80,
      render: (val: number) => <StatBar value={val} size="sm" />
    },
    {
      key: 'fitness',
      label: 'Fitness',
      width: 80,
      render: (val: number) => <StatBar value={val} size="sm" />
    },
    {
      key: 'contract',
      label: 'Contract',
      width: 100,
      render: () => <Badge label="2028" variant="blue" />
    },
  ];

  const selectedPlayer = squad.find(p => p.id === selectedPlayerId);

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* FILTER BAR */}
      <div className="flex items-center gap-4 mb-6 bg-[var(--bg-panel)] p-2 rounded border border-[var(--border)]">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-input)] border-none rounded py-1.5 pl-9 pr-3 text-[13px] text-[var(--text-1)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value)}
          className="bg-[var(--bg-input)] border-none rounded py-1.5 px-3 text-[13px] text-[var(--text-1)] focus:ring-1 focus:ring-[var(--accent)] outline-none"
        >
          <option value="ALL">All Positions</option>
          <option value="GK">Goalkeepers</option>
          <option value="CB">Defenders (C)</option>
          <option value="ST">Strikers</option>
        </select>
      </div>

      <div className="flex-1 overflow-hidden bg-[var(--bg-panel)] rounded border border-[var(--border)]">
        <DataTable
          columns={columns}
          rows={processedSquad}
          onRowClick={(p) => selectPlayer(p.id)}
          selectedRowId={selectedPlayerId || undefined}
          sortKey={sortConfig.key}
          sortDir={sortConfig.dir}
          onSort={handleSort}
        />
      </div>

      {/* PLAYER PROFILE SIDE PANEL */}
      {selectedPlayer && (
        <PlayerProfile player={selectedPlayer} onClose={() => selectPlayer(null)} />
      )}
    </div>
  );
};
