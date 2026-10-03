import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Power,
  Sliders,
  FileText,
  ListFilter,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Code,
  AlertTriangle
} from 'lucide-react';
import { uBlockEngine } from '../../utils/filterEngine';
import { BlockedLogItem } from '../../types/browser';

export const UBlockDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'filter-lists' | 'whitelist' | 'my-rules' | 'logger' | 'about'>('filter-lists');
  const [settings, setSettings] = useState(uBlockEngine.getSettings());
  const [logs, setLogs] = useState<BlockedLogItem[]>(uBlockEngine.getLogs());
  const [whitelistInput, setWhitelistInput] = useState('');
  const [customRuleInput, setCustomRuleInput] = useState('');
  const [loggerSearch, setLoggerSearch] = useState('');
  const [isUpdatingLists, setIsUpdatingLists] = useState(false);

  useEffect(() => {
    const unsub = uBlockEngine.subscribe(() => {
      setSettings({ ...uBlockEngine.getSettings() });
      setLogs([...uBlockEngine.getLogs()]);
    });
    return unsub;
  }, []);

  const handleToggleList = (id: string) => {
    const updatedLists = settings.filterLists.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l);
    uBlockEngine.updateSettings({ filterLists: updatedLists });
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistInput.trim()) return;
    const cleanDomain = whitelistInput.trim().replace(/^https?:\/\//, '').split('/')[0];
    if (!settings.whitelistedDomains.includes(cleanDomain)) {
      uBlockEngine.updateSettings({
        whitelistedDomains: [...settings.whitelistedDomains, cleanDomain]
      });
    }
    setWhitelistInput('');
  };

  const handleRemoveWhitelist = (domain: string) => {
    uBlockEngine.updateSettings({
      whitelistedDomains: settings.whitelistedDomains.filter(d => d !== domain)
    });
  };

  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRuleInput.trim()) return;
    uBlockEngine.updateSettings({
      customRules: [...settings.customRules, customRuleInput.trim()]
    });
    setCustomRuleInput('');
  };

  const handleRemoveCustomRule = (rule: string) => {
    uBlockEngine.updateSettings({
      customRules: settings.customRules.filter(r => r !== rule)
    });
  };

  const handleUpdateLists = () => {
    setIsUpdatingLists(true);
    setTimeout(() => {
      setIsUpdatingLists(false);
      // update timestamp
      const updated = settings.filterLists.map(l => ({ ...l, updatedAt: new Date().toISOString().split('T')[0] }));
      uBlockEngine.updateSettings({ filterLists: updated });
    }, 800);
  };

  const filteredLogs = logs.filter(item => {
    if (!loggerSearch) return true;
    const s = loggerSearch.toLowerCase();
    return item.url.toLowerCase().includes(s) || item.domain.toLowerCase().includes(s) || item.rule.toLowerCase().includes(s);
  });

  return (
    <div className="min-h-full bg-[#130728] text-violet-100 p-6 md:p-8 overflow-y-auto font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-violet-800/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">uBlock Origin Dashboard</h1>
                <span className="text-xs font-mono bg-violet-900/80 text-violet-200 px-2 py-0.5 rounded-md border border-violet-700/50">
                  v1.62.0 (Gecko WebExtension)
                </span>
              </div>
              <p className="text-xs text-violet-300/80 mt-0.5">
                Pre-installed high-efficiency wide-spectrum content blocker. Zero telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpdateLists}
              disabled={isUpdatingLists}
              className="px-3.5 py-2 bg-violet-800/60 hover:bg-violet-700 rounded-xl text-xs font-medium border border-violet-600/40 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingLists ? 'animate-spin' : ''}`} />
              Update Filter Lists
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#1a0c32] p-1 rounded-2xl border border-violet-800/50 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('filter-lists')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'filter-lists' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Filter Lists ({settings.filterLists.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whitelist')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'whitelist' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Trusted Sites ({settings.whitelistedDomains.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-rules')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'my-rules' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            My Rules &amp; Filters ({settings.customRules.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logger')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'logger' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            The Logger ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'about' ? 'bg-violet-600 text-white shadow-sm' : 'text-violet-300 hover:text-white'
            }`}
          >
            About &amp; GPLv3 License
          </button>
        </div>

        {/* Tab 1: Filter Lists */}
        {activeTab === 'filter-lists' && (
          <div className="space-y-4">
            <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-1">Pre-installed Filter Lists</h3>
              <p className="text-xs text-violet-300/80 mb-4">
                These community and uBlock Origin lists run locally on network requests and DOM cosmetic rules.
              </p>

              <div className="space-y-3">
                {settings.filterLists.map((list) => (
                  <div
                    key={list.id}
                    className="flex items-center justify-between p-3.5 bg-violet-950/40 border border-violet-800/40 rounded-xl hover:bg-violet-900/20 transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={list.enabled}
                        onChange={() => handleToggleList(list.id)}
                        className="w-4 h-4 rounded text-violet-600 border-violet-700 bg-violet-950 focus:ring-violet-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-violet-100 flex items-center gap-2">
                          {list.name}
                          <span className="text-[10px] font-mono text-fuchsia-300 bg-violet-900/60 px-1.5 py-0.2 rounded border border-violet-700/40">
                            {list.rulesCount.toLocaleString()} rules
                          </span>
                        </div>
                        <div className="text-[11px] text-violet-400 mt-0.5">
                          Category: <span className="capitalize">{list.category}</span> &bull; Last updated: {list.updatedAt}
                        </div>
                      </div>
                    </div>

                    <span className={`text-xs font-semibold ${list.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {list.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Trusted Sites / Whitelist */}
        {activeTab === 'whitelist' && (
          <div className="space-y-4">
            <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-1">Trusted Sites (Whitelist Exceptions)</h3>
              <p className="text-xs text-violet-300/80 mb-4">
                uBlock Origin will not block any requests or hide any elements on these domains.
              </p>

              <form onSubmit={handleAddWhitelist} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g. news.ycombinator.com or university.edu"
                  value={whitelistInput}
                  onChange={(e) => setWhitelistInput(e.target.value)}
                  className="flex-1 bg-[#140827] border border-violet-700/60 rounded-xl px-3 py-2 text-xs text-violet-100 outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Site Exception
                </button>
              </form>

              <div className="divide-y divide-violet-900/40 border border-violet-800/40 rounded-xl overflow-hidden bg-violet-950/20">
                {settings.whitelistedDomains.map((dom) => (
                  <div key={dom} className="flex items-center justify-between px-4 py-2.5 hover:bg-violet-900/30 transition text-xs">
                    <span className="font-mono text-violet-200">{dom}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWhitelist(dom)}
                      className="p-1 text-violet-400 hover:text-red-400 rounded-md transition"
                      title="Remove domain from whitelist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: My Rules & Filters */}
        {activeTab === 'my-rules' && (
          <div className="space-y-4">
            <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-1">Custom Adblock &amp; Cosmetic Rules</h3>
              <p className="text-xs text-violet-300/80 mb-4">
                Standard Adblock Plus / uBlock filter syntax supported (e.g. <code>||example.com^</code> or <code>###ad-banner</code>).
              </p>

              <form onSubmit={handleAddCustomRule} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g. ||annoyingtracker.com^ or ###sponsored-box"
                  value={customRuleInput}
                  onChange={(e) => setCustomRuleInput(e.target.value)}
                  className="flex-1 bg-[#140827] border border-violet-700/60 rounded-xl px-3 py-2 text-xs font-mono text-violet-100 outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Filter Rule
                </button>
              </form>

              <div className="divide-y divide-violet-900/40 border border-violet-800/40 rounded-xl overflow-hidden bg-violet-950/20 font-mono text-xs">
                {settings.customRules.map((rule) => (
                  <div key={rule} className="flex items-center justify-between px-4 py-2.5 hover:bg-violet-900/30 transition">
                    <span className="text-fuchsia-300">{rule}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomRule(rule)}
                      className="p-1 text-violet-400 hover:text-red-400 rounded-md transition"
                      title="Remove custom rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: The Logger */}
        {activeTab === 'logger' && (
          <div className="space-y-4">
            <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">The Unified Logger</h3>
                  <p className="text-xs text-violet-300/80">
                    Live inspection of requests intercepted by Quantum Browser's uBlock Origin engine.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-violet-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter log..."
                      value={loggerSearch}
                      onChange={(e) => setLoggerSearch(e.target.value)}
                      className="bg-[#140827] border border-violet-700/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-violet-100 outline-none w-48"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => uBlockEngine.clearLogs()}
                    className="px-3 py-1.5 bg-violet-900/40 hover:bg-violet-800 border border-violet-700/40 rounded-xl text-xs text-violet-300 transition"
                  >
                    Clear Log
                  </button>
                </div>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-xs text-violet-400 border border-dashed border-violet-800/50 rounded-xl">
                  No requests recorded in this session yet. Browse any website to view live filtering!
                </div>
              ) : (
                <div className="overflow-x-auto border border-violet-800/40 rounded-xl">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#16092d] text-violet-400 border-b border-violet-800/40 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Domain</th>
                        <th className="py-2.5 px-3">Rule Matched</th>
                        <th className="py-2.5 px-3">Filter List</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-900/30 bg-violet-950/20">
                      {filteredLogs.map((item) => (
                        <tr key={item.id} className="hover:bg-violet-900/20 transition">
                          <td className="py-2 px-3 text-violet-400 text-[10px]">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/60">
                              BLOCKED
                            </span>
                          </td>
                          <td className="py-2 px-3 text-violet-300 text-[10px] uppercase">
                            {item.type}
                          </td>
                          <td className="py-2 px-3 text-violet-100 font-semibold truncate max-w-[140px]">
                            {item.domain}
                          </td>
                          <td className="py-2 px-3 text-fuchsia-300 truncate max-w-[200px]" title={item.rule}>
                            {item.rule}
                          </td>
                          <td className="py-2 px-3 text-violet-400 text-[11px]">
                            {item.filterList}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: About & GPLv3 */}
        {activeTab === 'about' && (
          <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">uBlock Origin Extension Integration</h3>
            <p className="text-violet-300/90 leading-relaxed">
              uBlock Origin is an open-source, multi-platform content blocker created and maintained by <strong>Raymond Hill (gorhill)</strong>.
              In Quantum Browser, uBlock Origin is pre-bundled as a core built-in WebExtension leveraging Mozilla Gecko's full <code>webRequestBlocking</code> capabilities.
            </p>

            <div className="p-4 bg-violet-950/60 border border-violet-800/50 rounded-xl space-y-2">
              <div className="font-semibold text-violet-100">License &amp; Copyright Notice</div>
              <p className="text-[11px] text-violet-300/80 leading-relaxed font-mono">
                Copyright (C) 2014-present Raymond Hill<br />
                uBlock Origin is Free Software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://github.com/gorhill/uBlock"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-300 hover:text-white underline flex items-center gap-1 text-[11px]"
                >
                  Official uBlock Origin Repository <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
