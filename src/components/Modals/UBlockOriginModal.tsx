import React, { useState } from 'react';
import {
  Power,
  Sliders,
  FileText,
  Eye,
  EyeOff,
  Code,
  Image,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react';
import { uBlockEngine } from '../../utils/filterEngine';

interface UBlockOriginModalProps {
  currentUrl: string;
  tabId: string;
  onClose: () => void;
  onOpenDashboard: () => void;
  onOpenLogger: () => void;
  onReloadPage: () => void;
}

export const UBlockOriginModal: React.FC<UBlockOriginModalProps> = ({
  currentUrl,
  tabId,
  onClose,
  onOpenDashboard,
  onOpenLogger,
  onReloadPage,
}) => {
  const settings = uBlockEngine.getSettings();
  let domain = 'internal';
  try {
    if (currentUrl.includes('://')) {
      domain = new URL(currentUrl).hostname;
    } else {
      domain = currentUrl;
    }
  } catch {
    domain = currentUrl;
  }

  const isWhitelisted = uBlockEngine.isWhitelisted(domain);
  const isGlobalEnabled = settings.enabled;
  const isSiteProtected = isGlobalEnabled && !isWhitelisted;
  const pageBlockedCount = uBlockEngine.getBlockedCountForTab(tabId);
  const totalBlockedCount = uBlockEngine.getTotalBlockedCount();

  const [cosmeticFiltering, setCosmeticFiltering] = useState(settings.cosmeticFiltering);
  const [blockLargeMedia, setBlockLargeMedia] = useState(settings.blockLargeMedia);

  const handleToggleSitePower = () => {
    uBlockEngine.toggleWhitelist(domain);
    onReloadPage();
  };

  const handleToggleGlobalPower = () => {
    uBlockEngine.updateSettings({ enabled: !isGlobalEnabled });
    onReloadPage();
  };

  const handleToggleCosmetic = () => {
    const nextVal = !cosmeticFiltering;
    setCosmeticFiltering(nextVal);
    uBlockEngine.updateSettings({ cosmeticFiltering: nextVal });
    onReloadPage();
  };

  const handleToggleMedia = () => {
    const nextVal = !blockLargeMedia;
    setBlockLargeMedia(nextVal);
    uBlockEngine.updateSettings({ blockLargeMedia: nextVal });
    onReloadPage();
  };

  return (
    <div className="absolute top-12 right-4 w-80 bg-[#1a0c32] border border-violet-600/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 text-violet-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#251048] border-b border-violet-700/40">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-violet-600 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              uBlock Origin
              <span className="text-[10px] font-mono font-normal text-violet-300 bg-violet-900/60 px-1 py-0.2 rounded border border-violet-700/40">
                v1.62.0
              </span>
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-violet-700/50 rounded-lg text-violet-400 hover:text-white transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Power Area */}
      <div className="p-4 flex flex-col items-center border-b border-violet-900/40 bg-gradient-to-b from-[#200e3f] to-[#1a0c32]">
        {/* Big Power Button */}
        <button
          type="button"
          onClick={handleToggleSitePower}
          title={
            isSiteProtected
              ? 'Click to disable filtering on this site'
              : 'Click to enable filtering on this site'
          }
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 ${
            isSiteProtected
              ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-500 border-violet-400 hover:scale-105 shadow-violet-600/30'
              : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
          }`}
        >
          <Power className={`w-10 h-10 ${isSiteProtected ? 'text-white' : 'text-slate-500'}`} />
        </button>

        {/* Site Hostname */}
        <div className="mt-3 text-center">
          <span className="text-xs font-semibold text-violet-200 truncate max-w-[240px] block">
            {domain}
          </span>
          <span className="text-[10px] text-violet-400 font-mono">
            {isSiteProtected ? 'Protection Active' : isWhitelisted ? 'Whitelisted' : 'Disabled Globally'}
          </span>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 divide-x divide-violet-900/40 bg-[#16092b] py-2 border-b border-violet-900/40 text-center text-xs">
        <div className="px-2">
          <div className="text-[10px] text-violet-400 uppercase tracking-wider">On this page</div>
          <div className="text-base font-bold font-mono text-violet-100 mt-0.5">
            {pageBlockedCount}
          </div>
        </div>
        <div className="px-2">
          <div className="text-[10px] text-violet-400 uppercase tracking-wider">All-time blocked</div>
          <div className="text-base font-bold font-mono text-fuchsia-300 mt-0.5">
            {totalBlockedCount}
          </div>
        </div>
      </div>

      {/* Per-Page Quick Feature Toggles */}
      <div className="p-3 bg-[#1a0c32] space-y-2 border-b border-violet-900/40">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-violet-300 text-[11px]">
            {cosmeticFiltering ? <Eye className="w-3.5 h-3.5 text-violet-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            Cosmetic element hiding
          </span>
          <button
            type="button"
            onClick={handleToggleCosmetic}
            className={`w-8 h-4 rounded-full transition-colors relative ${
              cosmeticFiltering ? 'bg-violet-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                cosmeticFiltering ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-violet-300 text-[11px]">
            <Image className="w-3.5 h-3.5 text-violet-400" />
            Block media &gt; 50 KB
          </span>
          <button
            type="button"
            onClick={handleToggleMedia}
            className={`w-8 h-4 rounded-full transition-colors relative ${
              blockLargeMedia ? 'bg-violet-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                blockLargeMedia ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Quick Tool Links */}
      <div className="grid grid-cols-2 divide-x divide-violet-900/40 bg-[#170a2c] text-xs">
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenLogger();
          }}
          className="flex items-center justify-center gap-1.5 py-2 text-violet-300 hover:text-white hover:bg-violet-800/40 transition text-[11px]"
        >
          <FileText className="w-3.5 h-3.5 text-violet-400" />
          The Logger
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenDashboard();
          }}
          className="flex items-center justify-center gap-1.5 py-2 text-violet-300 hover:text-white hover:bg-violet-800/40 transition text-[11px]"
        >
          <Sliders className="w-3.5 h-3.5 text-violet-400" />
          Dashboard
        </button>
      </div>

      {/* Footer / Attribution Notice */}
      <div className="px-3 py-1.5 bg-[#120722] text-[10px] text-violet-400/70 border-t border-violet-950/60 flex items-center justify-between">
        <span>GPLv3 &bull; Raymond Hill (gorhill)</span>
        <button
          type="button"
          onClick={handleToggleGlobalPower}
          className="hover:underline text-violet-300"
        >
          {isGlobalEnabled ? 'Turn off globally' : 'Turn on globally'}
        </button>
      </div>
    </div>
  );
};
