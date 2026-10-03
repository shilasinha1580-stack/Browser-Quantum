import React, { useState } from 'react';
import { History, Search, Trash2, Globe, Clock, ExternalLink } from 'lucide-react';
import { HistoryItem } from '../../types/browser';
import { StorageService } from '../../utils/storage';

interface HistoryPageProps {
  onNavigate: (url: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<HistoryItem[]>(StorageService.getHistory());
  const [search, setSearch] = useState('');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.deleteHistoryItem(id);
    setHistory(StorageService.getHistory());
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all browsing history?')) {
      StorageService.clearBrowsingData({
        timeRange: 'everything',
        history: true,
        cookies: false,
        cache: false,
        downloads: false,
        siteSettings: false
      });
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(h => {
    if (!search) return true;
    const s = search.toLowerCase();
    return h.title.toLowerCase().includes(s) || h.url.toLowerCase().includes(s);
  });

  return (
    <div className="min-h-full bg-[#130728] text-violet-100 p-6 md:p-8 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-violet-800/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-700/50 border border-violet-500/40 flex items-center justify-center text-white">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Browsing History</h1>
              <p className="text-xs text-violet-300/80">Stored locally in your isolated Quantum Browser profile</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-violet-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1a0c32] border border-violet-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-violet-100 outline-none focus:border-violet-500"
              />
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800/60 rounded-xl text-xs font-semibold text-red-200 transition flex items-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {filteredHistory.length === 0 ? (
          <div className="p-16 text-center text-xs text-violet-400 border border-dashed border-violet-800/50 rounded-2xl bg-violet-950/10">
            <Clock className="w-8 h-8 text-violet-500 mx-auto mb-2 opacity-50" />
            No browsing history found.
          </div>
        ) : (
          <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl overflow-hidden divide-y divide-violet-900/40 text-xs">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate(item.url)}
                className="flex items-center justify-between p-3.5 hover:bg-violet-900/30 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                  <div className="w-6 h-6 rounded-lg bg-violet-950/80 border border-violet-800/50 flex items-center justify-center shrink-0">
                    <Globe className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-violet-100 truncate group-hover:text-white">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-violet-400/80 truncate font-mono mt-0.5">
                      {item.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-violet-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-violet-400 hover:text-red-400 rounded-lg hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition"
                    title="Delete from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
