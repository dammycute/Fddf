import React from 'react';
import { useGameStore } from '../store/gameStore';
import { StatBar } from '../components/layout/StatBar';
import { Badge } from '../components/layout/Badge';
import { Calendar, Newspaper, ListOrdered, AlertTriangle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { club, manager, fixtures, newsFeed, leagueTable, squad, fanSentiment } = useGameStore();

  const nextFixture = fixtures.find(f => f.status === 'SCHEDULED');
  const recentResults = fixtures
    .filter(f => f.status === 'PLAYED')
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
    .slice(0, 5);

  const top6 = leagueTable.slice(0, 6);
  const playerClubIndex = leagueTable.findIndex(r => r.club_name === club?.name);
  const showPlayerClubInMini = playerClubIndex > 5;

  const injuredPlayers = squad.filter(p => (p.fitness || 0) < 30);
  const unhappyPlayers = squad.filter(p => (p.morale || 0) < 25);

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `£${(val / 1_000_000).toFixed(1)}m`;
    return `£${(val / 1_000).toFixed(0)}k`;
  };

  return (
    <div className="grid grid-cols-[35%_40%_25%] gap-6 h-full min-h-0">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-6 overflow-hidden">
        <section className="bg-[var(--bg-panel)] p-5 rounded border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold text-xl">
               {club?.name?.substring(0, 2).toUpperCase()}
             </div>
             <div>
               <h2 className="text-xl font-bold text-[var(--text-1)]">{club?.name}</h2>
               <p className="text-xs text-[var(--text-2)] uppercase tracking-wider font-semibold">Premier League • {playerClubIndex + 1}th</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-[var(--border)] pb-2">
              <span className="text-xs text-[var(--text-2)] uppercase font-bold">Balance</span>
              <span className={`text-lg font-mono font-bold ${ (club?.balance || 0) >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {formatCurrency(club?.balance || 0)}
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-[var(--border)] pb-2">
              <span className="text-xs text-[var(--text-2)] uppercase font-bold">Transfer Budget</span>
              <span className="text-sm font-mono font-bold text-[var(--text-1)]">{formatCurrency(club?.transfer_budget || 0)}</span>
            </div>
            <div className="flex justify-between items-end border-b border-[var(--border)] pb-2">
              <span className="text-xs text-[var(--text-2)] uppercase font-bold">Reputation</span>
              <span className="text-sm font-mono font-bold text-[var(--text-1)]">{club?.reputation}/10000</span>
            </div>

            <div className="pt-2">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-[var(--text-2)] uppercase font-bold">{manager?.name || 'Manager'} Morale</span>
              </div>
              <StatBar value={manager?.morale || 50} size="sm" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-[var(--text-2)] uppercase font-bold">Fan Satisfaction</span>
              </div>
              <StatBar value={fanSentiment} size="sm" />
            </div>
          </div>
        </section>

        <section className="bg-[var(--bg-panel)] p-5 rounded border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-[var(--accent)]" />
            <h3 className="text-xs uppercase font-bold tracking-widest text-[var(--text-2)]">Next Fixture</h3>
          </div>
          {nextFixture ? (
            <div className="text-center py-2">
              <div className="text-[10px] text-[var(--text-2)] mb-2 uppercase font-bold">
                {new Date(nextFixture.date || '').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-right">
                  <div className="font-bold text-sm truncate">{nextFixture.home_name}</div>
                  <div className="text-[10px] text-[var(--text-3)] uppercase">
                    Pos: {leagueTable.findIndex(r => r.club_name === nextFixture.home_name) + 1 || '?'}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-[var(--text-3)]">vs</div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-sm truncate">{nextFixture.away_name}</div>
                  <div className="text-[10px] text-[var(--text-3)] uppercase">
                    Pos: {leagueTable.findIndex(r => r.club_name === nextFixture.away_name) + 1 || '?'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-[var(--text-3)] italic text-sm">No scheduled fixtures</div>
          )}
        </section>
      </div>

      {/* CENTER COLUMN */}
      <div className="flex flex-col gap-6 overflow-hidden">
        <section className="bg-[var(--bg-panel)] rounded border border-[var(--border)] flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <Newspaper size={16} className="text-[var(--accent)]" />
            <h3 className="text-xs uppercase font-bold tracking-widest text-[var(--text-2)]">News Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {newsFeed.length > 0 ? newsFeed.map(news => (
              <div key={news.id} className="p-3 bg-[var(--bg-base)] rounded hover:bg-[var(--bg-raised)] transition-colors cursor-pointer group">
                <div className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    news.importance === 3 ? 'bg-[var(--red)]' :
                    news.importance === 2 ? 'bg-[var(--amber)]' : 'bg-[var(--text-3)]'
                  }`} />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-1)] leading-tight mb-1">{news.title}</h4>
                    <p className="text-xs text-[var(--text-2)] line-clamp-2">{news.content}</p>
                    <div className="text-[9px] text-[var(--text-3)] mt-2 font-mono uppercase">
                      {new Date(news.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(news.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-[var(--text-3)] italic text-sm">No recent news</div>
            )}
          </div>
        </section>

        <section className="bg-[var(--bg-panel)] rounded border border-[var(--border)]">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[var(--text-2)]">Recent Results</h3>
          </div>
          <div className="p-2 space-y-1">
            {recentResults.map(res => {
              const isHome = res.home_name === club?.name;
              const win = isHome ? (res.home_goals || 0) > (res.away_goals || 0) : (res.away_goals || 0) > (res.home_goals || 0);
              const draw = res.home_goals === res.away_goals;
              const outcome = win ? 'W' : draw ? 'D' : 'L';

              return (
                <div key={res.id} className="flex items-center justify-between px-3 py-2 text-[13px] hover:bg-[var(--bg-raised)] rounded">
                  <div className="text-[10px] text-[var(--text-3)] w-16 font-mono uppercase">
                    {new Date(res.date || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <span className={`truncate ${isHome ? 'font-bold' : 'text-[var(--text-2)]'}`}>{res.home_name}</span>
                    <span className="font-mono bg-[var(--bg-base)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {res.home_goals} - {res.away_goals}
                    </span>
                    <span className={`truncate ${!isHome ? 'font-bold' : 'text-[var(--text-2)]'}`}>{res.away_name}</span>
                  </div>
                  <div className="w-8 flex justify-end">
                    <Badge label={outcome} variant={outcome === 'W' ? 'green' : outcome === 'D' ? 'amber' : 'red'} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-6 overflow-hidden">
        <section className="bg-[var(--bg-panel)] rounded border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <ListOrdered size={16} className="text-[var(--accent)]" />
            <h3 className="text-xs uppercase font-bold tracking-widest text-[var(--text-2)]">League Table</h3>
          </div>
          <table className="w-full text-[11px]">
            <thead className="text-[var(--text-3)] uppercase font-bold">
              <tr className="border-b border-[var(--border)]">
                <th className="p-2 text-left w-6">#</th>
                <th className="p-2 text-left">Club</th>
                <th className="p-2 text-right">Pts</th>
                <th className="p-2 text-right">GD</th>
              </tr>
            </thead>
            <tbody>
              {top6.map((row, i) => (
                <tr key={row.club_name} className={`
                  border-b border-[var(--border)]
                  ${row.club_name === club?.name ? 'bg-[var(--bg-raised)] border-l-2 border-l-[var(--accent)]' : ''}
                `}>
                  <td className="p-2 font-mono text-[var(--text-2)]">{i + 1}</td>
                  <td className="p-2 font-bold truncate max-w-[80px]">{row.club_name}</td>
                  <td className="p-2 text-right font-mono">{row.points}</td>
                  <td className="p-2 text-right font-mono">{row.gd}</td>
                </tr>
              ))}
              {showPlayerClubInMini && (
                <>
                  <tr className="bg-[var(--bg-base)]"><td colSpan={4} className="text-center py-0.5 opacity-50">...</td></tr>
                  <tr className="bg-[var(--bg-raised)] border-l-2 border-l-[var(--accent)]">
                    <td className="p-2 font-mono text-[var(--text-2)]">{playerClubIndex + 1}</td>
                    <td className="p-2 font-bold truncate max-w-[80px]">{club?.name}</td>
                    <td className="p-2 text-right font-mono">{leagueTable[playerClubIndex].points}</td>
                    <td className="p-2 text-right font-mono">{leagueTable[playerClubIndex].gd}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </section>

        <section className="bg-[var(--bg-panel)] rounded border border-[var(--border)]">
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <AlertTriangle size={16} className="text-[var(--amber)]" />
            <h3 className="text-xs uppercase font-bold tracking-widest text-[var(--text-2)]">Squad Alerts</h3>
          </div>
          <div className="p-2 space-y-1">
            {injuredPlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 hover:bg-[var(--bg-raised)] rounded group">
                <span className="text-[13px] font-medium truncate">{p.name}</span>
                <Badge label="Injured" variant="red" />
              </div>
            ))}
            {unhappyPlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 hover:bg-[var(--bg-raised)] rounded group">
                <span className="text-[13px] font-medium truncate">{p.name}</span>
                <Badge label="Unhappy" variant="amber" />
              </div>
            ))}
            {injuredPlayers.length === 0 && unhappyPlayers.length === 0 && (
              <div className="p-4 text-center text-[var(--text-3)] text-xs italic">All clear</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
