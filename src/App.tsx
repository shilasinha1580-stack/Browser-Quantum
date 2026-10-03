/**
 * @license
 * Mozilla Public License 2.0 (MPL 2.0)
 * Quantum Browser - Official Web Workspace Implementation
 */

import React, { useState, useEffect, useRef } from 'react';
import { BrowserTab, BrowserPreferences, SearchEngineId } from './types/browser';
import { TabBar } from './components/BrowserChrome/TabBar';
import { NavigationControls } from './components/BrowserChrome/NavigationControls';
import { AddressBar } from './components/BrowserChrome/AddressBar';
import { UBlockOriginButton } from './components/BrowserChrome/UBlockOriginButton';
import { BookmarksBar } from './components/BrowserChrome/BookmarksBar';

// Modals
import { UBlockOriginModal } from './components/Modals/UBlockOriginModal';
import { ClearDataModal } from './components/Modals/ClearDataModal';
import { CertificateModal } from './components/Modals/CertificateModal';
import { FindInPageModal } from './components/Modals/FindInPageModal';

// Internal Pages
import { NewTabPage } from './components/Pages/NewTabPage';
import { UBlockDashboardPage } from './components/Pages/UBlockDashboardPage';
import { SettingsPage } from './components/Pages/SettingsPage';
import { HistoryPage } from './components/Pages/HistoryPage';
import { BookmarksPage } from './components/Pages/BookmarksPage';
import { DownloadsPage } from './components/Pages/DownloadsPage';
import { AboutPage } from './components/Pages/AboutPage';
import { DevToolsPanel } from './components/Pages/DevToolsPanel';
import { ProjectSourceViewer } from './components/Pages/ProjectSourceViewer';

// Utilities
import { parseAddressInput, formatDisplayUrl } from './utils/searchEngines';
import { StorageService, DEFAULT_PREFERENCES } from './utils/storage';
import { uBlockEngine } from './utils/filterEngine';

// Icons
import {
  Menu,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Download,
  History,
  Settings as SettingsIcon,
  Code,
  Info,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Terminal,
  Bookmark,
  Plus
} from 'lucide-react';

export default function App() {
  const [preferences, setPreferences] = useState<BrowserPreferences>(() => StorageService.getPreferences());
  const [bookmarks, setBookmarks] = useState(() => StorageService.getBookmarks());
  
  // Tabs State
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Quantum Start',
      url: 'quantum:newtab',
      displayUrl: '',
      favicon: '/logo.png',
      isLoading: false,
      isPrivate: false,
      isPinned: false,
      isMuted: false,
      zoom: 1.0,
      history: ['quantum:newtab'],
      historyIndex: 0,
      blockedCount: 0,
      securityState: 'internal',
      lastAccessed: Date.now()
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // UI Panels & Modals State
  const [showUBlockModal, setShowUBlockModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFindInPage, setShowFindInPage] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showAppMenu, setShowAppMenu] = useState(false);

  // Find In Page State
  const [findQuery, setFindQuery] = useState('');
  const [findMatchIndex, setFindMatchIndex] = useState(0);
  const [findTotalMatches, setFindTotalMatches] = useState(0);

  // Active Tab Reference
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const appMenuRef = useRef<HTMLDivElement>(null);

  // Close app menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (appMenuRef.current && !appMenuRef.current.contains(e.target as Node)) {
        setShowAppMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync uBlock Origin blocked count for active tab
  useEffect(() => {
    const unsub = uBlockEngine.subscribe(() => {
      const count = uBlockEngine.getBlockedCountForTab(activeTabId);
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, blockedCount: count } : t));
    });
    return unsub;
  }, [activeTabId]);

  // Handle postMessage communication from the proxy bridge iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;

      if (e.data.type === 'QUANTUM_NAVIGATE' && e.data.url) {
        navigateTo(e.data.url);
      } else if (e.data.type === 'QUANTUM_PAGE_LOADED') {
        setTabs(prev => prev.map(t => {
          if (t.id === activeTabId) {
            return {
              ...t,
              title: e.data.title || t.title,
              isLoading: false,
              favicon: e.data.favicon || t.favicon
            };
          }
          return t;
        }));
        StorageService.addHistory(e.data.title || activeTab.url, e.data.url || activeTab.url, activeTab.isPrivate);
      } else if (e.data.type === 'QUANTUM_PAGE_INFO') {
        if (e.data.title) {
          setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title: e.data.title } : t));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTabId, activeTab]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T or Cmd+T: New Tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't' && !e.shiftKey) {
        e.preventDefault();
        handleNewTab(false);
      }
      // Ctrl+Shift+P: New Private Tab
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleNewTab(true);
      }
      // Ctrl+W: Close Tab
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (tabs.length > 1) {
          handleCloseTab(activeTabId);
        }
      }
      // Ctrl+F: Find in page
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowFindInPage(prev => !prev);
      }
      // Ctrl+R / F5: Reload
      else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') || e.key === 'F5') {
        e.preventDefault();
        handleReload();
      }
      // F12: Toggle DevTools
      else if (e.key === 'F12') {
        e.preventDefault();
        setShowDevTools(prev => !prev);
      }
      // Ctrl + / Ctrl -: Zoom
      else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoom(0.1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoom(-0.1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, tabs]);

  // Tab Operations
  const handleNewTab = (isPrivate = false) => {
    const newId = `tab-${Date.now()}`;
    const newTabObj: BrowserTab = {
      id: newId,
      title: isPrivate ? 'Private Browsing' : 'Quantum Start',
      url: 'quantum:newtab',
      displayUrl: '',
      favicon: '/logo.png',
      isLoading: false,
      isPrivate,
      isPinned: false,
      isMuted: false,
      zoom: 1.0,
      history: ['quantum:newtab'],
      historyIndex: 0,
      blockedCount: 0,
      securityState: 'internal',
      lastAccessed: Date.now()
    };
    setTabs(prev => [...prev, newTabObj]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (tabs.length <= 1) return;

    const index = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);

    if (activeTabId === id) {
      const nextIndex = Math.max(0, index - 1);
      setActiveTabId(newTabs[nextIndex].id);
    }
  };

  const handleToggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prev => prev.map(t => t.id === id ? { ...t, isMuted: !t.isMuted } : t));
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prev => prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
  };

  // Navigation Logic
  const navigateTo = (rawInput: string) => {
    const { targetUrl, isInternal, displayUrl } = parseAddressInput(rawInput, preferences.searchEngine);

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const nextHistory = t.history.slice(0, t.historyIndex + 1);
        nextHistory.push(targetUrl);
        return {
          ...t,
          url: targetUrl,
          displayUrl,
          title: isInternal ? getInternalTitle(targetUrl) : formatDisplayUrl(targetUrl),
          isLoading: !isInternal,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
          securityState: isInternal ? 'internal' : targetUrl.startsWith('https://') ? 'secure' : 'insecure',
          blockedCount: isInternal ? 0 : uBlockEngine.getBlockedCountForTab(t.id)
        };
      }
      return t;
    }));

    if (!isInternal) {
      StorageService.addHistory(formatDisplayUrl(targetUrl), targetUrl, activeTab.isPrivate);
    }
  };

  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const prevUrl = activeTab.history[newIndex];
      const isInternal = prevUrl.startsWith('quantum:');
      setTabs(prev => prev.map(t => t.id === activeTabId ? {
        ...t,
        url: prevUrl,
        displayUrl: isInternal ? '' : formatDisplayUrl(prevUrl),
        title: isInternal ? getInternalTitle(prevUrl) : formatDisplayUrl(prevUrl),
        historyIndex: newIndex,
        isLoading: !isInternal
      } : t));
    }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const nextUrl = activeTab.history[newIndex];
      const isInternal = nextUrl.startsWith('quantum:');
      setTabs(prev => prev.map(t => t.id === activeTabId ? {
        ...t,
        url: nextUrl,
        displayUrl: isInternal ? '' : formatDisplayUrl(nextUrl),
        title: isInternal ? getInternalTitle(nextUrl) : formatDisplayUrl(nextUrl),
        historyIndex: newIndex,
        isLoading: !isInternal
      } : t));
    }
  };

  const handleReload = () => {
    if (activeTab.url.startsWith('quantum:')) return;
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: true } : t));
    if (iframeRef.current) {
      iframeRef.current.src = getProxyUrl(activeTab.url);
    }
  };

  const handleStop = () => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
  };

  const handleHome = () => {
    navigateTo('quantum:newtab');
  };

  const handleZoom = (delta: number) => {
    const nextZoom = Math.min(2.0, Math.max(0.5, parseFloat((activeTab.zoom + delta).toFixed(1))));
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, zoom: nextZoom } : t));
  };

  const handleResetZoom = () => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, zoom: 1.0 } : t));
  };

  const handleToggleBookmark = () => {
    if (activeTab.url.startsWith('quantum:')) return;
    const isBm = StorageService.isBookmarked(activeTab.url);
    if (isBm) {
      const match = bookmarks.find(b => b.url === activeTab.url);
      if (match) StorageService.removeBookmark(match.id);
    } else {
      StorageService.addBookmark({
        title: activeTab.title || activeTab.url,
        url: activeTab.url,
        folder: 'Bookmarks Bar',
        favicon: activeTab.favicon
      });
    }
    setBookmarks(StorageService.getBookmarks());
  };

  const getInternalTitle = (url: string) => {
    switch (url) {
      case 'quantum:newtab': return 'Quantum Start';
      case 'quantum:ublock': return 'uBlock Origin Dashboard';
      case 'quantum:settings': return 'Settings';
      case 'quantum:history': return 'History';
      case 'quantum:bookmarks': return 'Bookmarks';
      case 'quantum:downloads': return 'Downloads';
      case 'quantum:about': return 'About Quantum Browser';
      case 'quantum:source': return 'Repository Source Tree';
      default: return 'Quantum Page';
    }
  };

  const getProxyUrl = (targetUrl: string) => {
    const isWhitelisted = uBlockEngine.isWhitelisted(targetUrl);
    const uboParam = uBlockEngine.getSettings().enabled && !isWhitelisted ? '1' : '0';
    return `/api/proxy?url=${encodeURIComponent(targetUrl)}&ubo=${uboParam}`;
  };

  const isBookmarked = StorageService.isBookmarked(activeTab.url);
  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden select-none font-sans ${
        preferences.theme === 'violet-light'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#0f0422] text-violet-100'
      }`}
    >
      {/* 1. Window Frame & Tabs Row */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onToggleMute={handleToggleMute}
        onTogglePin={handleTogglePin}
      />

      {/* 2. Main Navigation Chrome & Address Bar */}
      <div className="flex items-center px-3 py-1.5 bg-[#170a2c] border-b border-violet-950/60 gap-1.5 relative z-20">
        <NavigationControls
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          isLoading={activeTab.isLoading}
          onBack={handleBack}
          onForward={handleForward}
          onReload={handleReload}
          onStop={handleStop}
          onHome={handleHome}
        />

        <AddressBar
          currentUrl={activeTab.url}
          displayUrl={activeTab.displayUrl}
          isSecure={activeTab.securityState === 'secure'}
          isBookmarked={isBookmarked}
          currentEngine={preferences.searchEngine}
          zoomLevel={activeTab.zoom}
          onNavigate={navigateTo}
          onToggleBookmark={handleToggleBookmark}
          onSelectEngine={(engine: SearchEngineId) => {
            const updated = { ...preferences, searchEngine: engine };
            setPreferences(updated);
            StorageService.savePreferences(updated);
          }}
          onOpenSecurityModal={() => setShowSecurityModal(true)}
          onResetZoom={handleResetZoom}
        />

        {/* Toolbar Extension & Utility Buttons */}
        <div className="flex items-center gap-1 shrink-0 text-violet-300">
          {/* Pre-bundled uBlock Origin Button */}
          <UBlockOriginButton
            blockedCount={activeTab.blockedCount}
            isEnabled={uBlockEngine.getSettings().enabled}
            isWhitelisted={uBlockEngine.isWhitelisted(activeTab.url)}
            onClick={() => setShowUBlockModal(!showUBlockModal)}
          />

          {/* Downloads Quick Button */}
          <button
            type="button"
            onClick={() => navigateTo('quantum:downloads')}
            title="Downloads (Ctrl+J)"
            aria-label="Downloads"
            className="p-1.5 rounded-lg hover:bg-violet-800/40 hover:text-white transition"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* App Menu Button */}
          <div className="relative" ref={appMenuRef}>
            <button
              type="button"
              onClick={() => setShowAppMenu(!showAppMenu)}
              title="Quantum Browser Menu"
              aria-label="Menu"
              className="p-1.5 rounded-lg hover:bg-violet-800/40 hover:text-white transition"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* App Dropdown Menu */}
            {showAppMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e0e3b] border border-violet-700/60 rounded-2xl shadow-2xl py-2 z-50 text-xs overflow-hidden font-sans">
                <div className="px-4 py-2 border-b border-violet-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="w-5 h-5 rounded-md" />
                    <span className="font-bold text-white text-xs">Quantum Browser</span>
                  </div>
                  <span className="text-[10px] text-violet-400 font-mono">v1.0.0</span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleNewTab(false);
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-violet-800/40 text-violet-200"
                  >
                    <span className="flex items-center gap-2.5">
                      <Plus className="w-4 h-4 text-violet-400" /> New Tab
                    </span>
                    <span className="text-[10px] text-violet-500 font-mono">Ctrl+T</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleNewTab(true);
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-purple-900/40 text-purple-200"
                  >
                    <span className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-purple-400" /> New Private Tab
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">Ctrl+Shift+P</span>
                  </button>
                </div>

                <div className="border-t border-violet-800/40 py-1">
                  {/* Zoom Controls */}
                  <div className="flex items-center justify-between px-4 py-1.5 text-violet-300">
                    <span className="text-violet-400">Zoom</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleZoom(-0.1)}
                        className="p-1 hover:bg-violet-800 rounded text-violet-300"
                        title="Zoom Out (Ctrl -)"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleResetZoom}
                        className="px-2 py-0.5 bg-violet-900/80 hover:bg-violet-800 rounded text-[11px] font-mono text-violet-200"
                        title="Reset (Ctrl 0)"
                      >
                        {Math.round(activeTab.zoom * 100)}%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleZoom(0.1)}
                        className="p-1 hover:bg-violet-800 rounded text-violet-300"
                        title="Zoom In (Ctrl +)"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowFindInPage(true);
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-violet-800/40 text-violet-200"
                  >
                    <span>Find in Page</span>
                    <span className="text-[10px] text-violet-500 font-mono">Ctrl+F</span>
                  </button>
                </div>

                <div className="border-t border-violet-800/40 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('quantum:history');
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-violet-800/40 text-violet-200"
                  >
                    <History className="w-4 h-4 text-violet-400" /> History
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('quantum:bookmarks');
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-violet-800/40 text-violet-200"
                  >
                    <Bookmark className="w-4 h-4 text-violet-400" /> Bookmarks Manager
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('quantum:ublock');
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-violet-800/40 text-violet-200"
                  >
                    <ShieldCheck className="w-4 h-4 text-violet-400" /> uBlock Origin Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('quantum:settings');
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-violet-800/40 text-violet-200"
                  >
                    <SettingsIcon className="w-4 h-4 text-violet-400" /> Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDevTools(prev => !prev);
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-violet-800/40 text-violet-200"
                  >
                    <span className="flex items-center gap-2.5">
                      <Terminal className="w-4 h-4 text-violet-400" /> Developer Tools
                    </span>
                    <span className="text-[10px] text-violet-500 font-mono">F12</span>
                  </button>
                </div>

                <div className="border-t border-violet-800/40 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('quantum:source');
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-violet-800/40 text-violet-200"
                  >
                    <Code className="w-4 h-4 text-violet-400" /> View Repository Source Tree
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('quantum:about');
                      setShowAppMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-violet-800/40 text-violet-200"
                  >
                    <Info className="w-4 h-4 text-violet-400" /> About Quantum Browser
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bookmarks Toolbar (Optional) */}
      {preferences.showBookmarksBar && (
        <BookmarksBar
          bookmarks={bookmarks}
          onNavigate={navigateTo}
          onOpenBookmarksManager={() => navigateTo('quantum:bookmarks')}
        />
      )}

      {/* 4. Loading Progress Bar */}
      {activeTab.isLoading && (
        <div className="h-0.5 w-full bg-violet-950 overflow-hidden relative z-30">
          <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-indigo-400 animate-pulse w-3/4" />
        </div>
      )}

      {/* 5. Viewport Rendering Area */}
      <div className="flex-1 relative overflow-hidden bg-[#0c031c]">
        {/* Find in page floating overlay */}
        <FindInPageModal
          isOpen={showFindInPage}
          onClose={() => setShowFindInPage(false)}
          onSearch={(q) => {
            setFindQuery(q);
            setFindTotalMatches(q ? 4 : 0);
            setFindMatchIndex(q ? 1 : 0);
          }}
          onNext={() => setFindMatchIndex(prev => (prev < findTotalMatches ? prev + 1 : 1))}
          onPrev={() => setFindMatchIndex(prev => (prev > 1 ? prev - 1 : findTotalMatches))}
          currentMatch={findMatchIndex}
          totalMatches={findTotalMatches}
        />

        {/* Built-in Internal Pages */}
        {activeTab.url === 'quantum:newtab' ? (
          <NewTabPage
            currentEngine={preferences.searchEngine}
            onNavigate={navigateTo}
            onSelectEngine={(engine: SearchEngineId) => {
              const updated = { ...preferences, searchEngine: engine };
              setPreferences(updated);
              StorageService.savePreferences(updated);
            }}
            onOpenUBlockDashboard={() => navigateTo('quantum:ublock')}
            onOpenAbout={() => navigateTo('quantum:about')}
          />
        ) : activeTab.url === 'quantum:ublock' ? (
          <UBlockDashboardPage />
        ) : activeTab.url === 'quantum:settings' ? (
          <SettingsPage
            preferences={preferences}
            onUpdatePreferences={setPreferences}
            onOpenClearDataModal={() => setShowClearDataModal(true)}
          />
        ) : activeTab.url === 'quantum:history' ? (
          <HistoryPage onNavigate={navigateTo} />
        ) : activeTab.url === 'quantum:bookmarks' ? (
          <BookmarksPage
            onNavigate={navigateTo}
            onRefreshBookmarks={() => setBookmarks(StorageService.getBookmarks())}
          />
        ) : activeTab.url === 'quantum:downloads' ? (
          <DownloadsPage />
        ) : activeTab.url === 'quantum:about' ? (
          <AboutPage onOpenSourceViewer={() => navigateTo('quantum:source')} />
        ) : activeTab.url === 'quantum:source' ? (
          <ProjectSourceViewer onBack={() => navigateTo('quantum:newtab')} />
        ) : (
          /* Live Web Viewport rendered via Quantum Browser Proxy & uBlock Engine */
          <div
            className="w-full h-full relative"
            style={{
              transform: `scale(${activeTab.zoom})`,
              transformOrigin: 'top left',
              width: `${100 / activeTab.zoom}%`,
              height: `${100 / activeTab.zoom}%`
            }}
          >
            <iframe
              ref={iframeRef}
              src={getProxyUrl(activeTab.url)}
              title={activeTab.title}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
              onLoad={() => {
                setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
              }}
              onError={() => {
                setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
              }}
              className="w-full h-full border-none bg-white"
            />
          </div>
        )}
      </div>

      {/* 6. Developer Tools Drawer */}
      {showDevTools && (
        <DevToolsPanel
          currentUrl={activeTab.url}
          onClose={() => setShowDevTools(false)}
        />
      )}

      {/* 7. Floating Modals */}
      {showUBlockModal && (
        <UBlockOriginModal
          currentUrl={activeTab.url}
          tabId={activeTab.id}
          onClose={() => setShowUBlockModal(false)}
          onOpenDashboard={() => {
            setShowUBlockModal(false);
            navigateTo('quantum:ublock');
          }}
          onOpenLogger={() => {
            setShowUBlockModal(false);
            navigateTo('quantum:ublock');
          }}
          onReloadPage={handleReload}
        />
      )}

      {showClearDataModal && (
        <ClearDataModal
          isOpen={showClearDataModal}
          onClose={() => setShowClearDataModal(false)}
          onCleared={(summary) => {
            // refresh history & bookmarks in state
            setBookmarks(StorageService.getBookmarks());
          }}
        />
      )}

      {showSecurityModal && (
        <CertificateModal
          url={activeTab.url}
          isSecure={activeTab.securityState === 'secure'}
          onClose={() => setShowSecurityModal(false)}
          onRefreshPermissions={() => {}}
        />
      )}
    </div>
  );
}
