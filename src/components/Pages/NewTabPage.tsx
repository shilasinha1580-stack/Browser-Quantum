import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Sliders,
  Sparkles,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { SearchEngineId } from '../../types/browser';
import { SEARCH_ENGINES } from '../../utils/searchEngines';
import { uBlockEngine } from '../../utils/filterEngine';

interface NewTabPageProps {
  currentEngine: SearchEngineId;
  onNavigate: (url: string) => void;
  onSelectEngine: (engine: SearchEngineId) => void;
  onOpenUBlockDashboard: () => void;
  onOpenAbout: () => void;
}

interface SpeedDialItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  category: string;
}

const DEFAULT_SPEED_DIALS: SpeedDialItem[] = [
  {
    id: 'sd-1',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    icon: 'https://developer.mozilla.org/favicon.ico',
    category: 'Development'
  },
  {
    id: 'sd-2',
    title: 'Mozilla GeckoView',
    url: 'https://mozilla.github.io/geckoview/',
    icon: 'https://mozilla.github.io/favicon.ico',
    category: 'Engine'
  },
  {
    id: 'sd-3',
    title: 'uBlock Origin',
    url: 'https://github.com/gorhill/uBlock',
    icon: 'https://github.githubassets.com/favicons/favicon.png',
    category: 'Privacy'
  },
  {
    id: 'sd-4',
    title: 'DuckDuckGo',
    url: 'https://duckduckgo.com',
    icon: 'https://duckduckgo.com/favicon.ico',
    category: 'Search'
  },
  {
    id: 'sd-5',
    title: 'Wikipedia',
    url: 'https://en.wikipedia.org',
    icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
    category: 'Reference'
  },
  {
    id: 'sd-6',
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'https://github.githubassets.com/favicons/favicon.png',
    category: 'Coding'
  },
  {
    id: 'sd-7',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    icon: 'https://news.ycombinator.com/favicon.ico',
    category: 'Tech'
  },
  {
    id: 'sd-8',
    title: 'Brave Search',
    url: 'https://search.brave.com',
    icon: 'https://brave.com/static-assets/images/brave-favicon.png',
    category: 'Search'
  }
];

export const NewTabPage: React.FC<NewTabPageProps> = ({
  currentEngine,
  onNavigate,
  onSelectEngine,
  onOpenUBlockDashboard,
  onOpenAbout,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [speedDials, setSpeedDials] = useState<SpeedDialItem[]>(() => {
    try {
      const saved = localStorage.getItem('quantum_speed_dials');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SPEED_DIALS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const currentEngineObj = SEARCH_ENGINES[currentEngine] || SEARCH_ENGINES.google;
  const totalBlocked = uBlockEngine.getTotalBlockedCount();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate(searchInput);
    }
  };

  const handleAddSpeedDial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    let title = newTitle.trim();
    if (!title) {
      try {
        title = new URL(url).hostname;
      } catch {
        title = url;
      }
    }
    const newItem: SpeedDialItem = {
      id: `sd-${Date.now()}`,
      title,
      url,
      icon: `${url}/favicon.ico`,
      category: 'Custom'
    };
    const updated = [...speedDials, newItem];
    setSpeedDials(updated);
    localStorage.setItem('quantum_speed_dials', JSON.stringify(updated));
    setShowAddModal(false);
    setNewTitle('');
    setNewUrl('');
  };

  const handleRemoveSpeedDial = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = speedDials.filter(sd => sd.id !== id);
    setSpeedDials(updated);
    localStorage.setItem('quantum_speed_dials', JSON.stringify(updated));
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-[#130728] via-[#1a0b36] to-[#0d041c] text-violet-100 flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto font-sans">
      <div className="w-full max-w-4xl flex flex-col items-center space-y-8 mt-4">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group cursor-pointer" onClick={onOpenAbout}>
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
            <img
              src="/logo.png"
              alt="Quantum Browser Logo"
              className="relative w-20 h-20 rounded-2xl object-cover shadow-2xl border border-violet-500/40 p-1 bg-[#1c0c3b]"
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
              Quantum Browser
            </h1>
            <p className="text-xs text-violet-300/80 mt-1 flex items-center justify-center gap-2">
              <span>Powered by Mozilla Gecko &amp; GeckoView</span>
              <span className="text-violet-500">&bull;</span>
              <span className="text-fuchsia-300">Pre-bundled uBlock Origin</span>
            </p>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-[#210f44]/90 border border-violet-500/40 hover:border-violet-400 focus-within:border-violet-400 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.4)] backdrop-blur-md transition px-4 py-3">
              <Search className="w-5 h-5 text-violet-400 mr-3 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`Search the web with ${currentEngineObj.name} or type a URL`}
                className="w-full bg-transparent text-sm text-violet-50 placeholder-violet-400/50 outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="ml-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-md transition shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Search Engine Switcher Pills */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-violet-300/80">
            <span className="text-[11px] text-violet-400">Search with:</span>
            {Object.values(SEARCH_ENGINES).map((eng) => (
              <button
                key={eng.id}
                type="button"
                onClick={() => onSelectEngine(eng.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                  currentEngine === eng.id
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-violet-950/60 border border-violet-800/60 text-violet-300 hover:text-white hover:bg-violet-900/60'
                }`}
              >
                {eng.name}
              </button>
            ))}
          </div>
        </div>

        {/* uBlock Origin Privacy Shield Banner */}
        <div className="w-full max-w-3xl bg-gradient-to-r from-[#260f4d]/90 via-[#210c43]/90 to-[#190836]/90 border border-violet-600/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">uBlock Origin Engine</h3>
                <span className="text-[10px] font-mono bg-violet-900/80 text-violet-200 px-1.5 py-0.5 rounded-full border border-violet-700/50">
                  Pre-bundled
                </span>
              </div>
              <p className="text-xs text-violet-300/80 mt-0.5">
                Full Gecko WebExtension ad and tracker blocking active. Zero cloud telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-center shrink-0">
            <div>
              <div className="text-[10px] text-violet-400 uppercase font-semibold">Blocked Requests</div>
              <div className="text-lg font-bold font-mono text-fuchsia-300">{totalBlocked}</div>
            </div>
            <div>
              <div className="text-[10px] text-violet-400 uppercase font-semibold">Active Filter Lists</div>
              <div className="text-lg font-bold font-mono text-violet-200">5</div>
            </div>
            <button
              type="button"
              onClick={onOpenUBlockDashboard}
              className="px-3.5 py-2 bg-violet-800/70 hover:bg-violet-700 text-violet-100 rounded-xl text-xs font-medium border border-violet-600/40 transition flex items-center gap-1.5 shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-violet-300" />
              Configure
            </button>
          </div>
        </div>

        {/* Speed Dials Grid */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-violet-300/90 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              Quick Dials &amp; Shortcuts
            </h2>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="text-xs text-violet-400 hover:text-violet-200 flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Shortcut
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {speedDials.map((dial) => (
              <div
                key={dial.id}
                onClick={() => onNavigate(dial.url)}
                className="group relative flex flex-col items-center justify-center p-4 bg-[#1e0d3b]/70 hover:bg-[#28114d] border border-violet-800/40 hover:border-violet-500/60 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
              >
                <button
                  type="button"
                  onClick={(e) => handleRemoveSpeedDial(dial.id, e)}
                  title="Remove shortcut"
                  className="absolute top-2 right-2 p-1 text-violet-400/40 hover:text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-700/50 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition">
                  <img
                    src={dial.icon}
                    alt=""
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Globe className="w-5 h-5 text-violet-400 hidden only:block" />
                </div>
                <span className="text-xs font-medium text-violet-200 truncate w-full text-center group-hover:text-white">
                  {dial.title}
                </span>
                <span className="text-[10px] text-violet-400/60 truncate w-full text-center">
                  {dial.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Engine Specs Strip */}
        <div className="w-full max-w-3xl pt-4 border-t border-violet-900/40 flex flex-wrap items-center justify-between text-xs text-violet-400/70 gap-2">
          <div className="flex items-center gap-3">
            <span>Gecko Engine 135.0</span>
            <span>&bull;</span>
            <span>Android GeckoView (arm64-v8a)</span>
            <span>&bull;</span>
            <span>Linux &amp; Windows Gecko LibXUL</span>
          </div>
          <button
            type="button"
            onClick={onOpenAbout}
            className="hover:text-violet-200 hover:underline flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            About Quantum Browser
          </button>
        </div>
      </div>

      {/* Add Shortcut Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e0e3b] border border-violet-600/50 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-violet-100">
            <h3 className="text-sm font-bold text-white mb-3">Add Quick Shortcut</h3>
            <form onSubmit={handleAddSpeedDial} className="space-y-3 text-xs">
              <div>
                <label className="block text-violet-300 mb-1">Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. My Favorite Site"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#140827] border border-violet-700/60 rounded-xl px-3 py-2 text-violet-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-violet-300 mb-1">URL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. example.org"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-[#140827] border border-violet-700/60 rounded-xl px-3 py-2 text-violet-100 outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-violet-700 text-violet-300 hover:bg-violet-800/40 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition"
                >
                  Save Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
