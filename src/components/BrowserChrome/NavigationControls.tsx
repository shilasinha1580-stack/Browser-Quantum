import React from 'react';
import { ArrowLeft, ArrowRight, RotateCw, X, Home } from 'lucide-react';

interface NavigationControlsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onStop: () => void;
  onHome: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  canGoBack,
  canGoForward,
  isLoading,
  onBack,
  onForward,
  onReload,
  onStop,
  onHome,
}) => {
  return (
    <div className="flex items-center gap-0.5 shrink-0 text-violet-300">
      <button
        type="button"
        disabled={!canGoBack}
        onClick={onBack}
        title="Click to go back (Alt+Left)"
        aria-label="Back"
        className="p-1.5 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent hover:bg-violet-800/40 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        disabled={!canGoForward}
        onClick={onForward}
        title="Click to go forward (Alt+Right)"
        aria-label="Forward"
        className="p-1.5 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent hover:bg-violet-800/40 hover:text-white"
      >
        <ArrowRight className="w-4 h-4" />
      </button>

      {isLoading ? (
        <button
          type="button"
          onClick={onStop}
          title="Stop loading this page (Esc)"
          aria-label="Stop"
          className="p-1.5 rounded-lg transition hover:bg-violet-800/40 hover:text-white"
        >
          <X className="w-4 h-4 text-violet-300" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onReload}
          title="Reload current page (Ctrl+R / F5)"
          aria-label="Reload"
          className="p-1.5 rounded-lg transition hover:bg-violet-800/40 hover:text-white"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      )}

      <button
        type="button"
        onClick={onHome}
        title="Quantum Start Page (Alt+Home)"
        aria-label="Home"
        className="p-1.5 rounded-lg transition hover:bg-violet-800/40 hover:text-white"
      >
        <Home className="w-4 h-4" />
      </button>
    </div>
  );
};
