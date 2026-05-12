import React, { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { Mail, Calendar, Info, AlertTriangle, Search, Filter } from 'lucide-react';

type FilterType = 'ALL' | 'IMPORTANT' | 'TRANSFERS' | 'INJURIES';

export const Inbox: React.FC = () => {
  const { newsFeed } = useGameStore();
  const { readNewsIds, markRead } = useUIStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredNews = useMemo(() => {
    return newsFeed.filter(item => {
      if (activeFilter === 'IMPORTANT') return item.importance >= 2;
      if (activeFilter === 'TRANSFERS') return item.title.toUpperCase().includes('TRANSFER') || item.title.toUpperCase().includes('RUMOUR');
      if (activeFilter === 'INJURIES') return item.title.toLowerCase().includes('injury') || item.title.toLowerCase().includes('injur');
      return true;
    });
  }, [newsFeed, activeFilter]);

  const selectedNews = useMemo(() => {
    if (selectedId) return newsFeed.find(n => n.id === selectedId);
    if (filteredNews.length > 0) return filteredNews[0];
    return null;
  }, [selectedId, filteredNews, newsFeed]);

  // Mark the initially selected message as read
  useEffect(() => {
    if (selectedNews && !readNewsIds.has(selectedNews.id)) {
      markRead(selectedNews.id);
    }
  }, [selectedNews, readNewsIds, markRead]);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    markRead(id);
  };

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">

      {/* FILTERS */}
      <div className="flex gap-2">
        {(['ALL', 'IMPORTANT', 'TRANSFERS', 'INJURIES'] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`
              px-4 py-1.5 rounded text-[11px] font-bold uppercase transition-colors border
              ${activeFilter === f
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--bg-panel)] text-[var(--text-3)] border-[var(--border)] hover:text-[var(--text-2)]'}
            `}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-[380px_1fr] bg-[var(--bg-panel)] border border-[var(--border)] rounded overflow-hidden">

        {/* LIST */}
        <div className="border-r border-[var(--border)] flex flex-col overflow-hidden bg-[#ffffff02]">
           <div className="p-4 border-b border-[var(--border)] bg-[#ffffff03] flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[var(--text-3)] tracking-widest">Inbox</span>
              <span className="text-[10px] font-mono text-[var(--text-3)]">{filteredNews.length} Messages</span>
           </div>
           <div className="flex-1 overflow-y-auto">
              {filteredNews.map(item => {
                const isRead = readNewsIds.has(item.id);
                const isSelected = selectedNews?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`
                      w-full text-left p-4 border-b border-[var(--border)] transition-all relative
                      ${isSelected ? 'bg-[var(--bg-raised)]' : 'hover:bg-[#ffffff05]'}
                      ${!isRead ? 'border-l-4 border-l-[var(--accent)]' : 'border-l-4 border-l-transparent'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div className={`
                          w-2 h-2 rounded-full mt-1
                          ${item.importance >= 3 ? 'bg-[var(--red)]' : item.importance >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--text-3)]'}
                       `} />
                       <span className="text-[10px] font-mono text-[var(--text-3)]">
                          {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                       </span>
                    </div>
                    <h3 className={`text-[13px] font-bold truncate mb-1 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-1)]'}`}>
                       {item.title}
                    </h3>
                    <p className="text-[11px] text-[var(--text-2)] line-clamp-2 leading-tight">
                       {item.content}
                    </p>
                  </button>
                );
              })}
              {filteredNews.length === 0 && (
                 <div className="p-8 text-center text-[var(--text-3)] text-xs italic">No messages found</div>
              )}
           </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col overflow-hidden bg-[#0a0c10]">
           {selectedNews ? (
              <>
                 <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-panel)]">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-3)] mb-4">
                       <Calendar size={14} />
                       {new Date(selectedNews.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight mb-2">
                       {selectedNews.title}
                    </h1>
                    <div className="flex items-center gap-2">
                       <Badge
                          label={selectedNews.importance >= 3 ? 'CRITICAL' : selectedNews.importance >= 2 ? 'IMPORTANT' : 'ROUTINE'}
                          color={selectedNews.importance >= 3 ? 'red' : selectedNews.importance >= 2 ? 'blue' : 'gray'}
                       />
                    </div>
                 </div>
                 <div className="p-8 flex-1 overflow-y-auto">
                    <div className="max-w-2xl text-sm text-[var(--text-2)] leading-relaxed space-y-4">
                       {selectedNews.content.split('\n').map((p, i) => (
                          <p key={i}>{p}</p>
                       ))}
                    </div>

                    <div className="mt-12 pt-12 border-t border-[var(--border)] opacity-30">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[var(--bg-raised)] flex items-center justify-center text-[var(--text-3)]">
                             <Mail size={24} />
                          </div>
                          <div>
                             <div className="text-[10px] font-bold uppercase tracking-widest">Office of the Chairman</div>
                             <div className="text-[10px] uppercase">{club?.name}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-3)] opacity-20">
                 <Mail size={64} className="mb-4" />
                 <div className="text-sm font-bold uppercase tracking-[0.2em]">Select a message</div>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};
