import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface FindInPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, matchCase: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  currentMatch: number;
  totalMatches: number;
}

export const FindInPageModal: React.FC<FindInPageModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onNext,
  onPrev,
  currentMatch,
  totalMatches,
}) => {
  const [query, setQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);

  useEffect(() => {
    if (isOpen) {
      onSearch(query, matchCase);
    }
  }, [query, matchCase, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-6 z-40 bg-[#1e0e3b] border border-violet-600/50 rounded-xl shadow-2xl p-1.5 flex items-center gap-1.5 text-xs text-violet-100 font-sans">
      <div className="flex items-center gap-1.5 bg-[#140827] border border-violet-800/60 rounded-lg px-2 py-1">
        <Search className="w-3.5 h-3.5 text-violet-400" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (e.shiftKey) onPrev();
              else onNext();
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
          placeholder="Find in page..."
          className="bg-transparent text-xs text-violet-100 placeholder-violet-500/60 outline-none w-36"
        />
        <span className="text-[10px] font-mono text-violet-400">
          {query ? `${currentMatch}/${totalMatches}` : ''}
        </span>
      </div>

      <button
        type="button"
        onClick={onPrev}
        disabled={totalMatches === 0}
        title="Previous match (Shift+Enter)"
        className="p-1 hover:bg-violet-800/50 rounded text-violet-300 disabled:opacity-30 transition"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={totalMatches === 0}
        title="Next match (Enter)"
        className="p-1 hover:bg-violet-800/50 rounded text-violet-300 disabled:opacity-30 transition"
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => setMatchCase(!matchCase)}
        title="Match case"
        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
          matchCase
            ? 'bg-violet-600 text-white border-violet-400'
            : 'bg-violet-950 text-violet-400 border-violet-800/60'
        }`}
      >
        Aa
      </button>

      <button
        type="button"
        onClick={onClose}
        title="Close find bar (Esc)"
        className="p-1 hover:bg-violet-800/50 rounded text-violet-400 hover:text-white transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
