import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldCheck, X, Check } from 'lucide-react';
import { StorageService } from '../../utils/storage';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleared: (summary: string) => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({
  isOpen,
  onClose,
  onCleared,
}) => {
  const [timeRange, setTimeRange] = useState<'hour' | '24hours' | '7days' | '4weeks' | 'everything'>('24hours');
  const [clearHistory, setClearHistory] = useState(true);
  const [clearCookies, setClearCookies] = useState(true);
  const [clearCache, setClearCache] = useState(true);
  const [clearDownloads, setClearDownloads] = useState(true);
  const [clearPermissions, setClearPermissions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClear = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = StorageService.clearBrowsingData({
        timeRange,
        history: clearHistory,
        cookies: clearCookies,
        cache: clearCache,
        downloads: clearDownloads,
        siteSettings: clearPermissions,
      });

      setIsProcessing(false);
      setResultMsg(`Successfully purged ${result.itemsCleared} local records.`);
      onCleared(result.message);

      setTimeout(() => {
        setResultMsg(null);
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-[#1b0d36] border border-violet-600/50 rounded-2xl w-full max-w-lg shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-violet-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#251148] border-b border-violet-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/40 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Clear Browsing Data</h3>
              <p className="text-[11px] text-violet-300/80">Local privacy cleanup for Quantum Browser</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-violet-800/40 rounded-lg text-violet-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Time Range Selector */}
          <div>
            <label className="block text-violet-300 font-medium mb-1.5">Time range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-full bg-[#140827] border border-violet-700/60 rounded-xl px-3 py-2 text-violet-100 text-xs outline-none focus:border-violet-500 transition"
            >
              <option value="hour">Last hour</option>
              <option value="24hours">Last 24 hours</option>
              <option value="7days">Last 7 days</option>
              <option value="4weeks">Last 4 weeks</option>
              <option value="everything">All time (Everything)</option>
            </select>
          </div>

          {/* Options Checklist */}
          <div className="space-y-2.5 pt-1">
            <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-900/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={clearHistory}
                onChange={(e) => setClearHistory(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-violet-700 bg-violet-950"
              />
              <div className="flex-1">
                <span className="font-semibold text-violet-200">Browsing history</span>
                <p className="text-[11px] text-violet-400/80">Clears page visits, typed search queries, and recent tab sessions.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-900/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={clearCookies}
                onChange={(e) => setClearCookies(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-violet-700 bg-violet-950"
              />
              <div className="flex-1">
                <span className="font-semibold text-violet-200">Cookies and other site data</span>
                <p className="text-[11px] text-violet-400/80">Signs you out of websites and clears locally stored trackers and tokens.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-900/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={clearCache}
                onChange={(e) => setClearCache(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-violet-700 bg-violet-950"
              />
              <div className="flex-1">
                <span className="font-semibold text-violet-200">Cached images and files</span>
                <p className="text-[11px] text-violet-400/80">Frees local disk memory. Some sites may load a fraction slower on next visit.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-900/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={clearDownloads}
                onChange={(e) => setClearDownloads(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-violet-700 bg-violet-950"
              />
              <div className="flex-1">
                <span className="font-semibold text-violet-200">Download history</span>
                <p className="text-[11px] text-violet-400/80">Clears browser download records (downloaded files remain on disk).</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-900/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={clearPermissions}
                onChange={(e) => setClearPermissions(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-violet-700 bg-violet-950"
              />
              <div className="flex-1">
                <span className="font-semibold text-violet-200">Site permissions & settings</span>
                <p className="text-[11px] text-violet-400/80">Resets location, camera, microphone, and popup choices back to default prompt.</p>
              </div>
            </label>
          </div>

          {/* Technical Privacy Disclosure */}
          <div className="p-3 bg-violet-950/60 border border-violet-800/40 rounded-xl text-[11px] text-violet-300/90 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Storage Deletion Standard:</span> Quantum Browser implements the strongest practical OS-supported deletion (truncating SQLite databases, unlinking cache files, zeroing ephemeral memory). Note that on modern solid-state drives (SSDs) and flash controllers, wear-leveling algorithms prevent guaranteed raw NAND physical block erasure unless operating under full-disk encryption.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#170a2c] border-t border-violet-800/40">
          <div className="text-[11px] text-emerald-400 font-medium">
            {resultMsg ? (
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {resultMsg}
              </span>
            ) : (
              <span className="text-violet-400">Zero cloud telemetry</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl border border-violet-700/50 hover:bg-violet-800/40 text-violet-300 transition text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isProcessing ? 'Purging Data...' : 'Clear Data Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
