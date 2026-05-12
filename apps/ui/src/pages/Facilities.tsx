import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { getFacilities, upgradeFacility } from '../api/engine';
import { Facilities as FacilitiesType } from '../types';
import { Activity, Building2, School, Landmark, TrendingUp } from 'lucide-react';

export const Facilities: React.FC = () => {
  const { club, initialize } = useGameStore();
  const [facilities, setFacilities] = useState<FacilitiesType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = async () => {
    if (!club) return;
    try {
      const res = await getFacilities(club.id);
      setFacilities(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [club]);

  const handleUpgrade = async (type: 'training' | 'medical' | 'youth') => {
    if (!club) return;
    try {
      await upgradeFacility(club.id, type);
      fetch();
      // Also re-initialize game store to reflect balance change
      initialize(club.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upgrade failed");
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `£${(val / 1_000_000).toFixed(1)}m`;
    if (val >= 1_000) return `£${(val / 1_000).toFixed(0)}k`;
    return `£${val}`;
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse uppercase tracking-widest text-[var(--text-3)]">Inspecting Infrastructure...</div>;

  const cardData = [
    {
      id: 'training' as const,
      title: 'Training Complex',
      level: facilities?.training_level || 1,
      icon: Activity,
      desc: 'Influences player attribute growth and tactical familiarity.',
      effect: `Player development +${(facilities?.training_level || 1) * 5}%`,
      cost: facilities?.training_upgrade_cost || 0,
    },
    {
      id: 'medical' as const,
      title: 'Medical Centre',
      level: facilities?.medical_level || 1,
      icon: Building2,
      desc: 'Improves injury recovery speed and reduces injury frequency.',
      effect: `Injury rate -${(facilities?.medical_level || 1) * 3}%, Recovery +${(facilities?.medical_level || 1) * 10}%`,
      cost: facilities?.medical_upgrade_cost || 0,
    },
    {
      id: 'youth' as const,
      title: 'Youth Academy',
      level: facilities?.youth_level || 1,
      icon: School,
      desc: 'Affects the quality and quantity of annual youth intakes.',
      effect: `Intake quality +${(facilities?.youth_level || 1) * 15}%`,
      cost: facilities?.youth_upgrade_cost || 0,
    }
  ];

  const upgradeInProgress = facilities?.upgrade_in_progress;
  const stadiumRevenue = (club?.reputation || 5000) * 10; // Simplified estimate

  return (
    <div className="space-y-8 h-full overflow-y-auto pr-2 pb-12">

      {/* FACILITY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardData.map(card => {
          const Icon = card.icon;
          const isUpgrading = upgradeInProgress?.type === card.id;
          const canAfford = (club?.balance || 0) >= card.cost;
          const isMaxLevel = card.level >= 5;

          return (
            <div key={card.id} className="bg-[var(--bg-panel)] border border-[var(--border)] p-6 rounded flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[var(--bg-raised)] rounded flex items-center justify-center text-[var(--accent)] border border-[var(--border)]">
                  <Icon size={24} />
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(dot => (
                    <div
                      key={dot}
                      className={`w-2 h-2 rounded-full ${dot <= card.level ? 'bg-[var(--accent)]' : 'bg-[var(--bg-input)]'}`}
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-1)] mb-1">{card.title}</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed mb-4 flex-1">{card.desc}</p>

              <div className="bg-[var(--bg-base)] p-3 rounded mb-6">
                 <div className="text-[10px] text-[var(--text-3)] font-bold uppercase mb-1">Current Effect</div>
                 <div className="text-[11px] text-[var(--green)] font-medium italic">{card.effect}</div>
              </div>

              <div className="pt-6 border-t border-[var(--border)]">
                {isMaxLevel ? (
                   <div className="text-center text-[10px] font-bold uppercase text-[var(--text-3)] py-2">Max Level Reached</div>
                ) : isUpgrading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[var(--amber)] uppercase">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} /> UPGRADING...
                      </div>
                      <span>30 Days</span>
                    </div>
                    <div className="h-1 bg-[var(--bg-input)] rounded-full overflow-hidden">
                       <div className="h-full bg-[var(--amber)] animate-pulse w-1/2" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Investment</div>
                      <div className={`text-sm font-mono font-bold ${canAfford ? 'text-[var(--text-1)]' : 'text-[var(--red)]'}`}>
                        {formatCurrency(card.cost)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpgrade(card.id)}
                      disabled={!canAfford || !!upgradeInProgress}
                      className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-dim)] disabled:bg-[var(--bg-input)] disabled:text-[var(--text-3)] text-white text-[11px] font-bold uppercase rounded transition-colors"
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

      {/* STADIUM SECTION */}
      <section className="bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-[#ffffff03] flex items-center gap-2">
           <Landmark size={16} className="text-[var(--text-2)]" />
           <h2 className="text-[10px] font-bold uppercase text-[var(--text-2)] tracking-widest">Stadium & Infrastructure</h2>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
             <div className="h-40 bg-[var(--bg-base)] border border-[var(--border)] rounded relative flex items-center justify-center">
                <Building2 size={64} className="text-[var(--bg-raised)]" />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                   <div className="text-sm font-bold">{club?.name} Arena</div>
                   <div className="text-[10px] text-[var(--text-2)] uppercase">Primary Grounds</div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="space-y-1">
                <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Capacity</div>
                <div className="text-2xl font-mono font-bold text-[var(--text-1)]">32,500</div>
             </div>
             <div className="space-y-1">
                <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Avg. Attendance</div>
                <div className="text-lg font-mono font-bold text-[var(--text-2)]">28,450 (87%)</div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="space-y-1">
                <div className="text-[10px] text-[var(--text-3)] uppercase font-bold">Matchday Revenue</div>
                <div className="text-2xl font-mono font-bold text-[var(--green)]">£{stadiumRevenue.toLocaleString()}</div>
                <div className="text-[10px] text-[var(--text-2)]">Estimated per home game</div>
             </div>
             <button className="w-full py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-raised)] rounded text-xs font-bold border border-[var(--border)] transition-colors uppercase">
               Expand Stadium
             </button>
          </div>
        </div>
      </section>

    </div>
  );
};
