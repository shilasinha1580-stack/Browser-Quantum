import React, { useState } from 'react';
import {
  Settings,
  Search,
  Palette,
  Shield,
  Trash2,
  Lock,
  Globe,
  Sliders,
  Cpu,
  Check,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { BrowserPreferences, SearchEngineId } from '../../types/browser';
import { SEARCH_ENGINES } from '../../utils/searchEngines';
import { StorageService } from '../../utils/storage';

interface SettingsPageProps {
  preferences: BrowserPreferences;
  onUpdatePreferences: (prefs: BrowserPreferences) => void;
  onOpenClearDataModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  preferences,
  onUpdatePreferences,
  onOpenClearDataModal,
}) => {
  const [activeSection, setActiveSection] = useState<'general' | 'appearance' | 'privacy' | 'permissions' | 'engine'>('general');
  const [savedBadge, setSavedBadge] = useState(false);
  const [permissions, setPermissions] = useState(StorageService.getPermissions());

  const handleChange = (partial: Partial<BrowserPreferences>) => {
    const updated = { ...preferences, ...partial };
    onUpdatePreferences(updated);
    StorageService.savePreferences(updated);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1200);
  };

  const handleResetPermission = (origin: string, permission: any) => {
    const updated = permissions.filter(p => !(p.origin === origin && p.permission === permission));
    setPermissions(updated);
    StorageService.savePermissions(updated);
  };

  return (
    <div className="min-h-full bg-[#130728] text-violet-100 p-6 md:p-8 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-violet-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-700/50 border border-violet-500/40 flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Quantum Browser Settings</h1>
              <p className="text-xs text-violet-300/80">Configure preferences, themes, and privacy defaults</p>
            </div>
          </div>

          {savedBadge && (
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full animate-fade-in font-medium">
              <Check className="w-3.5 h-3.5" />
              Settings saved locally
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#1a0c32] p-1 rounded-2xl border border-violet-800/50 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('general')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeSection === 'general' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            General &amp; Search
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('appearance')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeSection === 'appearance' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Appearance &amp; Theme
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('privacy')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeSection === 'privacy' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Privacy &amp; Security
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('permissions')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeSection === 'permissions' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Site Permissions ({permissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('engine')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeSection === 'engine' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Gecko Engine Details
          </button>
        </div>

        {/* Section 1: General & Search */}
        {activeSection === 'general' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Search Engine</h3>
              <p className="text-violet-300/80">
                Choose the default search engine used in the address bar and start page.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {Object.values(SEARCH_ENGINES).map((eng) => (
                  <label
                    key={eng.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      preferences.searchEngine === eng.id
                        ? 'bg-violet-900/40 border-violet-500 text-white font-medium'
                        : 'bg-violet-950/30 border-violet-800/40 text-violet-300 hover:bg-violet-900/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="searchEngine"
                      checked={preferences.searchEngine === eng.id}
                      onChange={() => handleChange({ searchEngine: eng.id })}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-violet-100">{eng.name}</span>
                        {eng.id === 'google' && (
                          <span className="text-[10px] bg-violet-800/60 text-violet-300 px-1.5 py-0.2 rounded font-mono">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-violet-400">{eng.homepage}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Startup &amp; Home</h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-violet-200 font-medium">Bookmarks Toolbar</span>
                  <p className="text-[11px] text-violet-400">Show bookmarks bar below address bar for quick navigation.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange({ showBookmarksBar: !preferences.showBookmarksBar })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    preferences.showBookmarksBar ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.showBookmarksBar ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Appearance & Theme */}
        {activeSection === 'appearance' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Quantum Theme</h3>
              <p className="text-violet-300/80">
                Quantum Browser features an official violet aesthetic with optimized contrast for Mozilla Gecko rendering.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'violet-dark', label: 'Violet Dark (Default)', desc: 'Deep violet midnight palette' },
                  { id: 'violet-light', label: 'Violet Light', desc: 'Crisp ultraviolet daylight tones' },
                  { id: 'system', label: 'System Automatic', desc: 'Syncs with OS desktop mode' }
                ].map((th) => (
                  <label
                    key={th.id}
                    className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                      preferences.theme === th.id
                        ? 'bg-violet-900/40 border-violet-500 text-white shadow-md'
                        : 'bg-violet-950/30 border-violet-800/40 text-violet-300 hover:bg-violet-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="theme"
                        checked={preferences.theme === th.id}
                        onChange={() => handleChange({ theme: th.id as any })}
                        className="text-violet-600 focus:ring-violet-500"
                      />
                      <span className="font-semibold text-violet-100">{th.label}</span>
                    </div>
                    <span className="text-[11px] text-violet-400 pl-5">{th.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Privacy & Security */}
        {activeSection === 'privacy' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Enhanced Tracking Protection</h3>
                  <p className="text-violet-300/80 mt-0.5">
                    Controls cross-site cookie isolation and uBlock Origin rule enforcement.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-600 text-white">
                  STRICT (Active)
                </span>
              </div>

              <div className="p-3 bg-violet-950/60 border border-violet-800/40 rounded-xl space-y-2 text-[11px] text-violet-300">
                <div className="flex items-center gap-2 text-violet-100 font-semibold">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Protection Features Enabled:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-violet-300/90">
                  <li>uBlock Origin WebExtension pre-bundled network filtering (EasyList + EasyPrivacy)</li>
                  <li>Cosmetic element filtering (ads, sponsored widgets, sticky banner removal)</li>
                  <li>Total Cookie Protection: Partitioned storage per top-level origin</li>
                  <li>Crypto-mining script and fingerprinter blocking</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-violet-900/40">
                <div>
                  <span className="text-violet-200 font-medium">Clear Browsing Data</span>
                  <p className="text-[11px] text-violet-400">Purge local history, cookies, cached documents, and sessions.</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenClearDataModal}
                  className="px-4 py-2 bg-violet-800/60 hover:bg-violet-700 text-violet-100 border border-violet-600/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 text-violet-300" />
                  Clear Data...
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-violet-900/40">
                <div>
                  <span className="text-violet-200 font-medium">HTTPS-Only Mode</span>
                  <p className="text-[11px] text-violet-400">Automatically upgrades all connections to secure TLS encryption.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange({ httpsOnlyMode: !preferences.httpsOnlyMode })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    preferences.httpsOnlyMode ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.httpsOnlyMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-violet-900/40">
                <div>
                  <span className="text-violet-200 font-medium">Send "Do Not Track" (DNT) signal</span>
                  <p className="text-[11px] text-violet-400">Notifies web servers that you request not to be tracked across websites.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange({ doNotTrack: !preferences.doNotTrack })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    preferences.doNotTrack ? 'bg-violet-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.doNotTrack ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Site Permissions */}
        {activeSection === 'permissions' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Configured Site Permissions</h3>
              <p className="text-violet-300/80">
                Websites with customized access to your Location, Camera, Microphone, Notifications, or Pop-ups.
              </p>

              {permissions.length === 0 ? (
                <div className="p-8 text-center text-violet-400 border border-dashed border-violet-800/50 rounded-xl">
                  No site permission exceptions configured. Quantum Browser prompts for access on each request.
                </div>
              ) : (
                <div className="divide-y divide-violet-900/40 border border-violet-800/40 rounded-xl overflow-hidden bg-violet-950/20">
                  {permissions.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-violet-900/20 transition">
                      <div>
                        <div className="font-semibold text-violet-100">{p.origin}</div>
                        <div className="text-[11px] text-violet-400 capitalize">
                          Permission: {p.permission} &bull; Setting: <span className="text-violet-200 font-semibold">{p.state}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResetPermission(p.origin, p.permission)}
                        className="px-2.5 py-1 text-violet-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition text-[11px]"
                      >
                        Reset to Default
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 5: Gecko Engine Details */}
        {activeSection === 'engine' && (
          <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Why Mozilla Gecko &amp; GeckoView?</h3>
            <p className="text-violet-300/90 leading-relaxed">
              Quantum Browser strictly implements the <strong>Mozilla Gecko</strong> rendering and JavaScript engine on Desktop (Windows x86/x64, Linux amd64) and <strong>Mozilla GeckoView</strong> on Android (arm64-v8a).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-violet-950/60 border border-violet-800/40 rounded-xl space-y-1.5">
                <div className="font-bold text-violet-100 text-xs flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-violet-400" />
                  Preserving Web Diversity
                </div>
                <p className="text-[11px] text-violet-300/80 leading-relaxed">
                  Chromium, Blink, CEF, and standard Android WebView constitute a monoculture that threatens web standards. Gecko provides an independent, open-standards compliant rendering engine.
                </p>
              </div>

              <div className="p-4 bg-violet-950/60 border border-violet-800/40 rounded-xl space-y-1.5">
                <div className="font-bold text-violet-100 text-xs flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-fuchsia-400" />
                  True WebExtension APIs
                </div>
                <p className="text-[11px] text-violet-300/80 leading-relaxed">
                  Chromium's Manifest V3 severely limits ad blockers. Gecko and GeckoView retain full <code>webRequestBlocking</code>, enabling uBlock Origin to operate at full power without artificial rule-count ceilings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
