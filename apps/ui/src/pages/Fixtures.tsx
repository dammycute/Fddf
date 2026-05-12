import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { DataTable } from '../components/layout/DataTable';
import { StatBar } from '../components/layout/StatBar';
import { X, ExternalLink } from 'lucide-react';
import { getMatchReport } from '../api/engine';
import { MatchReport } from '../types';

export const Fixtures: React.FC = () => {
  const { fixtures, club } = useGameStore();
  const { selectedFixtureId, selectFixture } = useUIStore();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'RESULTS'>('UPCOMING');
  const [report, setReport] = useState<MatchReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const upcoming = fixtures
    .filter(f => f.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());

  const results = fixtures
    .filter(f => f.status === 'PLAYED')
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

  useEffect(() => {
    if (selectedFixtureId) {
      setLoadingReport(true);
      getMatchReport(selectedFixtureId)
        .then(setReport)
        .catch(console.error)
        .finally(() => setLoadingReport(false));
    } else {
      setReport(null);
    }
  }, [selectedFixtureId]);

  const upcomingCols = [
    { key: 'date', label: 'Date', width: 120, render: (val: string) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'home_name', label: 'Home Team', render: (val: string) => <span className={val === club?.name ? 'font-bold' : ''}>{val}</span> },
    { key: 'vs', label: '', width: 30, render: () => <span className="text-[var(--text-3)] font-bold">vs</span> },
    { key: 'away_name', label: 'Away Team', render: (val: string) => <span className={val === club?.name ? 'font-bold' : ''}>{val}</span> },
    { key: 'competition', label: 'Competition', render: () => 'Premier League' },
  ];

  const resultsCols = [
    { key: 'date', label: 'Date', width: 120, render: (val: string) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'home_name', label: 'Home Team', render: (val: string) => <span className={val === club?.name ? 'font-bold text-[var(--accent)]' : ''}>{val}</span> },
    {
      key: 'score',
      label: 'Score',
      width: 80,
      align: 'center' as const,
      render: (_, f: any) => (
        <span className="font-mono bg-[var(--bg-base)] px-2 py-1 rounded font-bold border border-[var(--border)]">
          {f.home_goals} - {f.away_goals}
        </span>
      )
    },
    { key: 'away_name', label: 'Away Team', render: (val: string) => <span className={val === club?.name ? 'font-bold text-[var(--accent)]' : ''}>{val}</span> },
    {
      key: 'report',
      label: '',
      width: 100,
      align: 'right' as const,
      render: (_, f: any) => (
        <button
          onClick={(e) => { e.stopPropagation(); selectFixture(f.id); }}
          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 ml-auto"
        >
          REPORT <ExternalLink size={12} />
        </button>
      )
    },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'UPCOMING' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('RESULTS')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'RESULTS' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'}`}
        >
          Results
        </button>
      </div>

      <div className="flex-1 bg-[var(--bg-panel)] rounded border border-[var(--border)] overflow-hidden">
        {activeTab === 'UPCOMING' ? (
          <DataTable columns={upcomingCols} rows={upcoming} />
        ) : (
          <DataTable columns={resultsCols} rows={results} />
        )}
      </div>

      {selectedFixtureId && (
        <MatchReportModal
          report={report}
          loading={loadingReport}
          onClose={() => selectFixture(null)}
        />
      )}
    </div>
  );
};

const MatchReportModal = ({ report, loading, onClose }: { report: MatchReport | null, loading: boolean, onClose: () => void }) => {
  if (loading) return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  );

  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-8">
      <div className="bg-[var(--bg-panel)] w-full max-w-4xl h-full max-h-[800px] rounded-lg border border-[var(--border)] flex flex-col overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-3)] hover:text-white transition-colors">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-base)]/50">
          <div className="text-center space-y-4">
            <div className="text-xs font-bold text-[var(--text-3)] uppercase tracking-widest">
              {new Date(report.fixture.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center justify-center gap-12">
              <div className="flex-1 text-right text-3xl font-black uppercase tracking-tighter">{report.fixture.home_name}</div>
              <div className="text-5xl font-mono font-black px-6 py-2 bg-[var(--bg-base)] border-2 border-[var(--border)] rounded-xl tabular-nums">
                {report.fixture.home_goals} - {report.fixture.away_goals}
              </div>
              <div className="flex-1 text-left text-3xl font-black uppercase tracking-tighter">{report.fixture.away_name}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 divide-x divide-[var(--border)] border-b border-[var(--border)]">
           <div className="p-6 space-y-4">
              <h4 className="text-center text-[10px] font-bold uppercase text-[var(--text-3)] tracking-[0.2em]">Possession</h4>
              <div className="flex items-center gap-4">
                 <span className="font-mono text-sm font-bold">{Math.round(report.report.home_possession)}%</span>
                 <div className="flex-1 flex gap-1 h-2">
                    <div className="bg-[var(--accent)] rounded-l-full" style={{ width: `${report.report.home_possession}%` }} />
                    <div className="bg-[var(--text-3)] opacity-30 rounded-r-full flex-1" />
                 </div>
                 <span className="font-mono text-sm font-bold">{Math.round(report.report.away_possession)}%</span>
              </div>
           </div>
           <div className="p-6 space-y-4">
              <h4 className="text-center text-[10px] font-bold uppercase text-[var(--text-3)] tracking-[0.2em]">Total Shots</h4>
              <div className="flex items-center justify-center gap-12 font-mono text-3xl font-bold">
                 <span className="text-[var(--accent)]">{report.report.home_shots}</span>
                 <span className="text-[var(--text-3)] opacity-30">/</span>
                 <span>{report.report.away_shots}</span>
              </div>
           </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-8">
           <h4 className="text-[10px] font-bold uppercase text-[var(--text-3)] tracking-[0.2em] mb-6">Match Events</h4>
           <div className="space-y-4 max-w-2xl mx-auto">
              {report.report.events.sort((a, b) => a.minute - b.minute).map((event, i) => (
                <div key={i} className={`flex items-center gap-6 ${event.team === 'away' ? 'flex-row-reverse' : ''}`}>
                   <div className="w-12 text-right font-mono font-bold text-[var(--text-2)]">{event.minute}'</div>
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                      ${event.type === 'GOAL' ? 'bg-[var(--green)]/20 text-[var(--green)]' :
                        event.type === 'YELLOW_CARD' ? 'bg-[var(--amber)]/20 text-[var(--amber)]' :
                        event.type === 'RED_CARD' ? 'bg-[var(--red)]/20 text-[var(--red)]' :
                        'bg-[var(--text-3)]/20 text-[var(--text-3)]'}
                   `}>
                      {event.type === 'GOAL' ? '⚽' :
                       event.type === 'YELLOW_CARD' || event.type === 'RED_CARD' ? <div className={`w-2.5 h-3.5 rounded-sm ${event.type === 'YELLOW_CARD' ? 'bg-[var(--amber)]' : 'bg-[var(--red)]'}`} /> :
                       event.type === 'INJURY' ? '✚' : '•'}
                   </div>
                   <div className={`flex-1 ${event.team === 'away' ? 'text-right' : ''}`}>
                      <div className="text-sm font-bold">{event.player_name}</div>
                      <div className="text-[10px] uppercase font-bold text-[var(--text-3)]">{event.type.replace('_', ' ')}</div>
                   </div>
                </div>
              ))}
              {report.report.events.length === 0 && (
                <div className="text-center py-12 text-[var(--text-3)] italic text-sm">No major events recorded</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
