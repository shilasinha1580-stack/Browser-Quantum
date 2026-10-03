import React, { useState } from 'react';
import { Lock, ShieldCheck, Globe, X, Check, AlertCircle } from 'lucide-react';
import { StorageService } from '../../utils/storage';

interface CertificateModalProps {
  url: string;
  isSecure: boolean;
  onClose: () => void;
  onRefreshPermissions: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  url,
  isSecure,
  onClose,
  onRefreshPermissions,
}) => {
  let hostname = 'quantum.internal';
  try {
    if (url.includes('://')) {
      hostname = new URL(url).hostname;
    } else {
      hostname = url;
    }
  } catch {
    hostname = url;
  }

  const isInternal = url.startsWith('quantum:');
  const [activeTab, setActiveTab] = useState<'security' | 'permissions'>('security');

  const permissions = StorageService.getPermissions();
  const getPermState = (perm: any) => {
    const found = permissions.find(p => p.origin.includes(hostname) && p.permission === perm);
    return found ? found.state : 'ask';
  };

  const handleUpdatePerm = (perm: any, state: any) => {
    StorageService.setSitePermission(`https://${hostname}`, perm, state);
    onRefreshPermissions();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-[#1b0d36] border border-violet-600/50 rounded-2xl w-full max-w-md shadow-2xl text-violet-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#251148] border-b border-violet-800/40">
          <div className="flex items-center gap-2">
            {isInternal ? (
              <ShieldCheck className="w-4 h-4 text-violet-400" />
            ) : isSecure ? (
              <Lock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Globe className="w-4 h-4 text-amber-400" />
            )}
            <h3 className="text-xs font-bold text-white truncate max-w-[280px]">
              {hostname}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-violet-800/40 rounded-lg text-violet-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-violet-800/40 bg-[#16092b] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 font-medium text-center border-b-2 transition ${
              activeTab === 'security'
                ? 'border-violet-500 text-violet-100 bg-violet-900/30'
                : 'border-transparent text-violet-400 hover:text-violet-200'
            }`}
          >
            Security & Certificate
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-2 font-medium text-center border-b-2 transition ${
              activeTab === 'permissions'
                ? 'border-violet-500 text-violet-100 bg-violet-900/30'
                : 'border-transparent text-violet-400 hover:text-violet-200'
            }`}
          >
            Permissions ({hostname})
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs space-y-3">
          {activeTab === 'security' ? (
            <>
              <div className="p-3 bg-violet-950/60 border border-violet-800/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-violet-400 text-[11px]">Connection Status</span>
                  <span className={`font-semibold flex items-center gap-1 ${isSecure ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isSecure ? 'Encrypted & Verified' : 'Standard Connection'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-violet-400 text-[11px]">Protocol</span>
                  <span className="font-mono text-violet-200">TLS 1.3 (Gecko Engine)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-violet-400 text-[11px]">Cipher Suite</span>
                  <span className="font-mono text-[10px] text-violet-300">TLS_AES_256_GCM_SHA384</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-violet-400 text-[11px]">uBlock Origin Shield</span>
                  <span className="text-violet-300 font-semibold">Active & Pre-Bundled</span>
                </div>
              </div>

              <div className="p-3 bg-[#130724] border border-violet-900/60 rounded-xl space-y-1.5 text-[11px] text-violet-300/80">
                <div className="font-semibold text-violet-200">Local Privacy Enforcement</div>
                <p>
                  Quantum Browser keeps all cookies, cached files, and credentials purely local. Zero telemetry or telemetry beacons are transmitted.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-violet-400">Configure site permissions for this host:</div>
              {(['geolocation', 'camera', 'microphone', 'notifications', 'popups'] as const).map((perm) => (
                <div key={perm} className="flex items-center justify-between p-2 rounded-lg bg-violet-950/40 border border-violet-900/40">
                  <span className="capitalize text-violet-200 font-medium text-[11px]">{perm}</span>
                  <select
                    value={getPermState(perm)}
                    onChange={(e) => handleUpdatePerm(perm, e.target.value)}
                    className="bg-[#140827] border border-violet-700/60 rounded-lg px-2 py-1 text-[11px] text-violet-100 outline-none"
                  >
                    <option value="allow">Allow</option>
                    <option value="ask">Ask every time</option>
                    <option value="block">Block</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#15092a] border-t border-violet-800/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
