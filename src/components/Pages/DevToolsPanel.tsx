import React, { useState } from 'react';
import { Terminal, Network, Database, X, Trash2, Search, ShieldCheck } from 'lucide-react';
import { uBlockEngine } from '../../utils/filterEngine';

interface DevToolsPanelProps {
  currentUrl: string;
  onClose: () => void;
}

export const DevToolsPanel: React.FC<DevToolsPanelProps> = ({ currentUrl, onClose }) => {
  const [activeTab, setActiveTab] = useState<'console' | 'network' | 'storage'>('network');
  const [logs] = useState([
    { level: 'info', msg: '[Quantum Gecko Engine] Initialized LibXUL rendering pipeline v135.0', time: '10:00:01' },
    { level: 'info', msg: '[uBlock Origin WebExtension] Bundled filters loaded: 210,390 rules active', time: '10:00:02' },
    { level: 'warn', msg: `[Content Security] Upgraded connection to HTTPS for ${currentUrl}`, time: '10:00:03' },
    { level: 'info', msg: '[Storage Service] Session isolated in local profile database', time: '10:00:04' },
  ]);

  const blockedLogs = uBlockEngine.getLogs();

  return (
    <div className="h-64 bg-[#140728] border-t border-violet-700/60 flex flex-col font-mono text-xs select-text">
      {/* DevTools Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e0e3b] border-b border-violet-800/40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-violet-300 font-sans mr-2">Developer Tools</span>
          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
              activeTab === 'network' ? 'bg-violet-700 text-white font-semibold' : 'text-violet-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Network ({blockedLogs.length + 3})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
              activeTab === 'console' ? 'bg-violet-700 text-white font-semibold' : 'text-violet-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Console
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
              activeTab === 'storage' ? 'bg-violet-700 text-white font-semibold' : 'text-violet-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Storage
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-violet-800/50 rounded text-violet-400 hover:text-white transition"
          title="Close DevTools"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* DevTools Body */}
      <div className="flex-1 overflow-y-auto p-3 text-[11px]">
        {activeTab === 'network' && (
          <div className="space-y-1">
            <div className="grid grid-cols-6 py-1 px-2 text-violet-400 border-b border-violet-900/60 font-semibold text-[10px]">
              <span className="col-span-2">Name / URL</span>
              <span>Status</span>
              <span>Type</span>
              <span>Initiator</span>
              <span>Filter Status</span>
            </div>
            {blockedLogs.map((req) => (
              <div key={req.id} className="grid grid-cols-6 py-1 px-2 hover:bg-violet-900/20 rounded items-center">
                <span className="col-span-2 truncate text-violet-200" title={req.url}>{req.domain}</span>
                <span className="text-red-400 font-bold">Blocked (204)</span>
                <span className="text-violet-400 uppercase">{req.type}</span>
                <span className="text-violet-400">script</span>
                <span className="text-fuchsia-300 truncate flex items-center gap-1" title={req.rule}>
                  <ShieldCheck className="w-3 h-3 text-fuchsia-400" /> uBO: {req.filterList}
                </span>
              </div>
            ))}
            <div className="grid grid-cols-6 py-1 px-2 hover:bg-violet-900/20 rounded items-center">
              <span className="col-span-2 truncate text-violet-200">{currentUrl}</span>
              <span className="text-emerald-400 font-bold">200 OK</span>
              <span className="text-violet-400">DOCUMENT</span>
              <span className="text-violet-400">Navigation</span>
              <span className="text-emerald-400">Allowed</span>
            </div>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="space-y-1">
            {logs.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 py-0.5 text-violet-300">
                <span className="text-violet-500 shrink-0">[{item.time}]</span>
                <span className={item.level === 'warn' ? 'text-amber-300' : 'text-violet-200'}>
                  {item.msg}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-2">
            <div className="font-semibold text-violet-200">Local Storage Partition (Isolated)</div>
            <div className="border border-violet-800/40 rounded-lg p-2.5 bg-violet-950/20 text-violet-300 space-y-1">
              <div>Top-level Origin: <span className="text-white font-mono">{currentUrl}</span></div>
              <div>Cookie Partition: <span className="text-emerald-400 font-mono">Isolated (Total Cookie Protection)</span></div>
              <div>Cache Storage: <span className="text-violet-400 font-mono">Sandboxed profile directory</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
