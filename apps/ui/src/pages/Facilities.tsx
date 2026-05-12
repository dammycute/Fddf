import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getFacilities, upgradeFacility } from '../api/engine';
import { Facilities as FacilitiesType } from '../types';
import { StatBar } from '../components/layout/StatBar';
import { Building2, Activity, School, TrendingUp } from 'lucide-react';

export const Facilities: React.FC = () => {
  const { club, isLoading: gameLoading, tick } = useGameStore();
  const [facilities, setFacilities] = useState<FacilitiesType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFacilities = async () => {
    if (!club) return;
    try {
      const data = await getFacilities(club.id);
      setFacilities(data);
    } catch (error) {
      console.error("Failed to fetch facilities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [club]);

  const handleUpgrade = async (type: 'training' | 'medical' | 'youth') => {
    if (!club) return;
    try {
      await upgradeFacility(club.id, type);
      fetchFacilities(); // Refresh to show progress
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upgrade failed");
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `£${(val / 1_000_000).toFixed(1)}m`;
    if (val >= 1_000) return `£${(val / 1_000).toFixed(0)}k`;
    return `£${val}`;
  };

  if (isLoading || gameLoading) {
    return <div className="p-8 text-center animate-pulse text-[var(--text-2)] uppercase tracking-widest">Inspecting Infrastructure...</div>;
  }

  const cards = [
    {
      id: 'training',
      label: 'Training Complex',
      icon: Activity,
      level: facilities?.training_level || 0,
      cost: facilities?.training_upgrade_cost || 0,
      desc: 'Influences player attribute growth and tactical familiarity.'
    },
    {
      id: 'medical',
      label: 'Medical Centre',
      icon: Building2,
      level: facilities?.medical_level || 0,
      cost: facilities?.medical_upgrade_cost || 0,
      desc: 'Improves injury recovery speed and reduces injury frequency.'
    },
    {
      id: 'youth',
      label: 'Youth Academy',
      icon: School,
      level: facilities?.youth_level || 0,
      cost: facilities?.youth_upgrade_cost || 0,
      desc: 'Affects the quality of annual youth intakes.'
    }
  ] as const;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isUpgrading = facilities?.upgrade_in_progress?.type === card.id;
          const canAfford = (club?.balance || 0) >= card.cost;

          return (
            <div key={card.id} className="bg-[var(--bg-panel)] border border-[var(--border)] p-6 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[var(--bg-raised)] flex items-center justify-center text-[var(--accent)] border border-[var(--border)]">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold uppercase text-sm tracking-wide">{card.label}</h3>
                  <div className="text-[10px] text-[var(--text-3)] font-mono">LEVEL {card.level} / 20</div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-[var(--text-2)]">
                    <span>Quality</span>
                    <span className="font-mono text-[var(--text-1)]">{Math.round((card.level / 20) * 100)}%</span>
                  </div>
                  <StatBar value={(card.level / 20) * 100} size="md" />
                </div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border)]">
                {isUpgrading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[var(--amber)] uppercase">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} />
                        UPGRADE IN PROGRESS
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--text-3)] italic">
                      Completes: {new Date(facilities?.upgrade_in_progress?.complete_date).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Upgrade Cost</div>
                      <div className={`text-sm font-mono font-bold ${canAfford ? 'text-[var(--text-1)]' : 'text-[var(--red)]'}`}>
                        {formatCurrency(card.cost)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpgrade(card.id)}
                      disabled={!canAfford || !!facilities?.upgrade_in_progress}
                      className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-dim)] disabled:bg-gray-700 disabled:opacity-50 text-white text-[11px] font-bold uppercase transition-colors"
                    >
                      Invest
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#ffffff03] border border-dashed border-[var(--border)] p-4 text-center rounded">
        <p className="text-[11px] text-[var(--text-3)] uppercase tracking-widest font-medium">
          Facility upgrades take approximately 30 days to complete and improve club reputation.
        </p>
      </div>
    </div>
  );
};
