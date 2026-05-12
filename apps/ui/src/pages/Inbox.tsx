import React, { useEffect, useState } from 'react';
import { getNewsFeed } from '../api/engine';
import { NewsEvent } from '../types';
import { Mail, Calendar, Info, AlertTriangle } from 'lucide-react';

export const Inbox: React.FC = () => {
  const [news, setNews] = useState<NewsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsFeed(50);
        setNews(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const selectedNews = news.find(n => n.id === selectedId);

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-[var(--text-2)] uppercase tracking-widest">Accessing Inbox...</div>;
  }

  return (
    <div className="h-full grid grid-cols-[350px_1fr] border border-[var(--border)] bg-[var(--bg-panel)] rounded overflow-hidden">
      {/* List */}
      <div className="border-r border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)] bg-[#ffffff03] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">Messages</span>
          <span className="px-1.5 py-0.5 bg-[var(--accent)] text-white text-[10px] font-bold rounded-sm">{news.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {news.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-3)] text-sm italic">No messages</div>
          ) : (
            news.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`
                  w-full text-left p-4 border-b border-[var(--border)] transition-colors
                  ${selectedId === item.id ? 'bg-[var(--bg-raised)]' : 'hover:bg-[#ffffff05]'}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className={`
                    p-1 rounded-sm mb-2
                    ${item.importance > 70 ? 'bg-[var(--red)] text-white' : item.importance > 40 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--text-3)] text-white'}
                  `}>
                    {item.importance > 70 ? <AlertTriangle size={12} /> : <Info size={12} />}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-3)]">
                    {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <h3 className={`text-[13px] font-bold truncate ${selectedId === item.id ? 'text-[var(--accent)]' : 'text-[var(--text-1)]'}`}>
                  {item.title}
                </h3>
                <p className="text-[11px] text-[var(--text-2)] truncate mt-1">{item.content}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col bg-[#0f1117]">
        {selectedNews ? (
          <>
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-panel)]">
              <div className="flex items-center gap-2 text-[var(--text-3)] mb-4">
                <Calendar size={14} />
                <span className="text-xs font-mono">{new Date(selectedNews.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-1)]">{selectedNews.title}</h1>
            </div>
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="max-w-2xl text-[var(--text-1)] leading-relaxed space-y-4">
                {selectedNews.content.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-[var(--border)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-raised)] flex items-center justify-center text-[var(--text-2)]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-[var(--text-2)]">Official Notification</div>
                    <div className="text-[11px] text-[var(--text-3)]">Football Association Automated System</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-3)]">
            <Mail size={48} className="mb-4 opacity-10" />
            <p className="uppercase tracking-[0.2em] text-sm font-medium">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
};
