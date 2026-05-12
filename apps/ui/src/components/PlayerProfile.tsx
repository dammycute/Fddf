import React from 'react';
import { X } from 'lucide-react';
import { Player } from '../types';
import { StatBar } from './layout/StatBar';
import { listPlayer as apiListPlayer } from '../api/engine';

interface PlayerProfileProps {
  player: Player;
  onClose: () => void;
  showActions?: boolean;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onClose, showActions = true }) => {
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

      {showActions && (
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
      )}
    </div>
  );
};

const AttributeRow = ({ label, value }: { label: string, value?: number }) => (
  <div className="flex justify-between items-center group">
    <span className="text-[12px] text-[var(--text-2)]">{label}</span>
    <span className={`text-[13px] font-mono font-bold ${ (value || 0) >= 15 ? 'text-[var(--green)]' : (value || 0) <= 5 ? 'text-[var(--red)]' : 'text-[var(--text-1)]'}`}>
      {value || '-'}
    </span>
  </div>
);
