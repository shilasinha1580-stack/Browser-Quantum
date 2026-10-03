import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface UBlockOriginButtonProps {
  blockedCount: number;
  isEnabled: boolean;
  isWhitelisted: boolean;
  onClick: () => void;
}

export const UBlockOriginButton: React.FC<UBlockOriginButtonProps> = ({
  blockedCount,
  isEnabled,
  isWhitelisted,
  onClick,
}) => {
  const isBlocking = isEnabled && !isWhitelisted;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`uBlock Origin (v1.62.0 bundled) - ${
        !isEnabled
          ? 'Protection Disabled'
          : isWhitelisted
          ? 'Site Whitelisted'
          : `${blockedCount} requests blocked on this page`
      }`}
      aria-label="uBlock Origin"
      className={`relative p-1.5 rounded-lg transition flex items-center justify-center shrink-0 ${
        isBlocking
          ? 'text-violet-300 hover:bg-violet-800/40 hover:text-white'
          : 'text-violet-500/50 hover:bg-violet-800/20 hover:text-violet-300'
      }`}
    >
      <div className="relative">
        {/* Shield Icon */}
        {!isEnabled ? (
          <ShieldAlert className="w-4 h-4 text-amber-500/70" />
        ) : isWhitelisted ? (
          <Shield className="w-4 h-4 text-violet-400/50" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-violet-300" />
        )}

        {/* Blocked Count Badge */}
        {isBlocking && blockedCount > 0 && (
          <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 bg-violet-600 border border-violet-900 rounded-full text-[9px] font-mono font-bold text-white flex items-center justify-center leading-none shadow-sm">
            {blockedCount > 99 ? '99+' : blockedCount}
          </span>
        )}
      </div>
    </button>
  );
};
