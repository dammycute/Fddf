import React, { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { DataTable } from '../components/layout/DataTable';
import { StatBar } from '../components/layout/StatBar';
import { Badge } from '../components/layout/Badge';
import { X, Search } from 'lucide-react';
import { Player } from '../types';
import { listPlayer as apiListPlayer } from '../api/engine';

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

const PlayerProfile = ({ player, onClose }: { player: Player, onClose: () => void }) => {
  return (
    <div className="absolute top-0 right-0 bottom-0 w-[360px] bg-[var(--bg-panel)] border-l border-[var(--border)] shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-[var(--border)] flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-1)] mb-1">{player.name}</h2>
          <div className="text-xs text-[var(--text-2)] font-bold uppercase flex gap-2">
            <span>{player.age} Years Old</span>
            <span>•</span>
            <span>{player.nationality || 'English'}</span>
            <span>•</span>
            <span className="text-[var(--accent)]">{player.attributes?.position || 'CM'}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)]">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* CA/PA Progress */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase text-[var(--text-2)] mb-2">
             <span>Current vs Potential</span>
             <span>{player.ca} / {player.pa}</span>
          </div>
          <div className="h-3 bg-[var(--bg-input)] rounded-full overflow-hidden relative">
            <div
              className="absolute left-0 top-0 bottom-0 bg-[var(--accent)] opacity-30"
              style={{ width: `${(player.pa / 200) * 100}%` }}
            />
            <div
              className="absolute left-0 top-0 bottom-0 bg-[var(--accent)]"
              style={{ width: `${(player.ca / 200) * 100}%` }}
            />
          </div>
        </div>

        {/* Attribute Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
           <div>
              <h4 className="text-[10px] font-bold uppercase text-[var(--text-3)] mb-3 tracking-widest">Technical</h4>
              <div className="space-y-2">
                <AttributeRow label="Finishing" value={player.attributes?.finishing} />
                <AttributeRow label="Passing" value={player.attributes?.passing} />
                <AttributeRow label="Tackling" value={player.attributes?.tackling} />
                <AttributeRow label="Dribbling" value={player.attributes?.dribbling || 10} />
              </div>
           </div>
           <div>
              <h4 className="text-[10px] font-bold uppercase text-[var(--text-3)] mb-3 tracking-widest">Physical</h4>
              <div className="space-y-2">
                <AttributeRow label="Pace" value={player.attributes?.pace} />
                <AttributeRow label="Stamina" value={player.fitness} />
                <AttributeRow label="Strength" value={12} />
                <AttributeRow label="Agility" value={14} />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">Morale</span>
            <StatBar value={player.morale} size="sm" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-[var(--text-3)]">Fitness</span>
            <StatBar value={player.fitness} size="sm" />
          </div>
        </div>

        <div className="bg-[var(--bg-base)] p-4 rounded border border-[var(--border)]">
           <h4 className="text-[10px] font-bold uppercase text-[var(--text-3)] mb-3 tracking-widest">Contract Details</h4>
           <div className="grid grid-cols-2 gap-y-2 text-[13px]">
              <span className="text-[var(--text-2)]">Wage</span>
              <span className="font-mono font-bold text-right text-[var(--text-1)]">£24,500</span>
              <span className="text-[var(--text-2)]">Expires</span>
              <span className="font-mono font-bold text-right text-[var(--text-1)]">30 Jun 2028</span>
              <span className="text-[var(--text-2)]">Release Clause</span>
              <span className="font-mono font-bold text-right text-[var(--text-1)]">£12.5m</span>
           </div>
        </div>
      </div>

      <div className="p-6 border-t border-[var(--border)]">
        <button
          onClick={() => {
            const fee = player.ca * 10000;
            apiListPlayer(player.id, fee)
              .then(() => alert(`${player.name} listed for £${fee.toLocaleString()}`))
              .catch(console.error);
          }}
          className="w-full py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-raised)] rounded text-sm font-bold border border-[var(--border)] transition-colors"
        >
          LIST FOR TRANSFER
        </button>
      </div>
    </div>
  );
}

const AttributeRow = ({ label, value }: { label: string, value?: number }) => (
  <div className="flex justify-between items-center group">
    <span className="text-[12px] text-[var(--text-2)]">{label}</span>
    <span className={`text-[13px] font-mono font-bold ${ (value || 0) >= 15 ? 'text-[var(--green)]' : (value || 0) <= 5 ? 'text-[var(--red)]' : 'text-[var(--text-1)]'}`}>
      {value || '-'}
    </span>
  </div>
);
