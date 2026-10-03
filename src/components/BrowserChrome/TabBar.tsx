import React from 'react';
import { BrowserTab } from '../../types/browser';
import { Plus, X, Volume2, VolumeX, Pin, Globe, Shield, Sparkles } from 'lucide-react';

interface TabBarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: (isPrivate?: boolean) => void;
  onToggleMute: (id: string, e: React.MouseEvent) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onToggleMute,
  onTogglePin,
}) => {
  return (
    <div className="flex items-center bg-[#130924] border-b border-violet-950/60 select-none px-2 pt-2 gap-1 overflow-x-auto scrollbar-none h-11">
      {/* Quantum Browser Logo / Branding mark */}
      <div className="flex items-center gap-1.5 px-2 py-1 mr-1 text-violet-300 font-semibold text-xs tracking-wide shrink-0">
        <img src="/logo.png" alt="Quantum Browser" className="w-5 h-5 object-contain rounded-md shadow-sm" />
        <span className="hidden sm:inline font-mono font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
          QUANTUM
        </span>
      </div>

      {/* Tabs List */}
      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition-all duration-150 border-t border-x ${
                tab.isPinned ? 'w-10 justify-center px-1' : 'min-w-[120px] max-w-[210px] flex-1'
              } ${
                isActive
                  ? tab.isPrivate
                    ? 'bg-purple-900/90 text-purple-100 border-purple-500/50 shadow-sm'
                    : 'bg-[#221043] text-violet-100 border-violet-600/40 shadow-sm'
                  : 'bg-[#180d30]/60 text-violet-400/80 hover:bg-[#1f103d]/80 hover:text-violet-200 border-transparent'
              }`}
              title={`${tab.title} (${tab.url})`}
            >
              {/* Private Browsing Badge */}
              {tab.isPrivate && (
                <span
                  title="Private Browsing (Gecko isolated storage)"
                  className="w-3.5 h-3.5 rounded-full bg-purple-600/70 flex items-center justify-center text-[10px] text-purple-100 shrink-0 shadow"
                >
                  <Shield className="w-2.5 h-2.5" />
                </span>
              )}

              {/* Favicon or Loading Spinner */}
              {tab.isLoading ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin shrink-0" />
              ) : tab.favicon ? (
                <img
                  src={tab.favicon}
                  alt=""
                  className="w-3.5 h-3.5 object-contain rounded-xs shrink-0"
                  onError={(e) => {
                    // Fallback to globe icon
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : tab.url.startsWith('quantum:') ? (
                <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-violet-400/80 shrink-0" />
              )}

              {/* Title */}
              {!tab.isPinned && (
                <span className="truncate flex-1 text-[11px] leading-tight select-none">
                  {tab.title || 'New Tab'}
                </span>
              )}

              {/* Actions: Mute / Pin / Close */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Audio toggle if playing */}
                <button
                  type="button"
                  onClick={(e) => onToggleMute(tab.id, e)}
                  title={tab.isMuted ? 'Unmute Tab' : 'Mute Tab'}
                  className="p-0.5 hover:bg-violet-700/50 rounded text-violet-300 transition"
                >
                  {tab.isMuted ? (
                    <VolumeX className="w-3 h-3 text-red-400" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </button>

                {/* Close Button */}
                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => onCloseTab(tab.id, e)}
                    title="Close Tab"
                    className="p-0.5 hover:bg-violet-700/60 hover:text-white rounded text-violet-400 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Tab Button */}
      <button
        type="button"
        onClick={() => onNewTab(false)}
        title="Open a new tab (Ctrl+T)"
        aria-label="New Tab"
        className="p-1.5 text-violet-300 hover:text-violet-100 hover:bg-violet-800/40 rounded-lg transition shrink-0 ml-0.5"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* New Private Tab Button */}
      <button
        type="button"
        onClick={() => onNewTab(true)}
        title="Open a new private tab (Ctrl+Shift+P)"
        aria-label="New Private Tab"
        className="flex items-center gap-1 px-2 py-1 text-xs text-purple-300 hover:text-purple-100 hover:bg-purple-900/50 rounded-lg transition shrink-0 border border-purple-500/20"
      >
        <Shield className="w-3.5 h-3.5 text-purple-400" />
        <span className="hidden md:inline text-[11px] font-medium">Private</span>
      </button>
    </div>
  );
};
