import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  ShieldCheck,
  Star,
  Search,
  ChevronDown,
  Globe,
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { SearchEngineId } from '../../types/browser';
import { SEARCH_ENGINES } from '../../utils/searchEngines';

interface AddressBarProps {
  currentUrl: string;
  displayUrl: string;
  isSecure: boolean;
  isBookmarked: boolean;
  currentEngine: SearchEngineId;
  zoomLevel: number;
  onNavigate: (input: string) => void;
  onToggleBookmark: () => void;
  onSelectEngine: (engine: SearchEngineId) => void;
  onOpenSecurityModal: () => void;
  onResetZoom: () => void;
  onToggleReaderMode?: () => void;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  currentUrl,
  displayUrl,
  isSecure,
  isBookmarked,
  currentEngine,
  zoomLevel,
  onNavigate,
  onToggleBookmark,
  onSelectEngine,
  onOpenSecurityModal,
  onResetZoom,
}) => {
  const [inputValue, setInputValue] = useState(displayUrl || currentUrl);
  const [isFocused, setIsFocused] = useState(false);
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external displayUrl changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(displayUrl || currentUrl);
    }
  }, [displayUrl, currentUrl, isFocused]);

  // Fetch search suggestions
  useEffect(() => {
    if (!isFocused || !inputValue || inputValue.startsWith('quantum:') || inputValue.includes('://')) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(inputValue)}&engine=${currentEngine}`, {
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSuggestions(data.slice(0, 6));
          }
        }
      } catch {
        // Ignored
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [inputValue, isFocused, currentEngine]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setShowEngineDropdown(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (valueToSubmit?: string) => {
    const finalVal = valueToSubmit !== undefined ? valueToSubmit : inputValue;
    if (finalVal.trim()) {
      onNavigate(finalVal);
      setIsFocused(false);
      setSuggestions([]);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        handleSubmit(suggestions[selectedSuggestionIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev > -1 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSuggestions([]);
      setInputValue(displayUrl || currentUrl);
      inputRef.current?.blur();
    }
  };

  const currentEngineObj = SEARCH_ENGINES[currentEngine] || SEARCH_ENGINES.google;
  const isInternal = currentUrl.startsWith('quantum:');

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[200px] max-w-4xl mx-1 z-30">
      <div
        className={`flex items-center gap-1.5 h-8 px-2.5 rounded-full border transition-all duration-150 ${
          isFocused
            ? 'bg-[#1e0e38] border-violet-500 shadow-[0_0_12px_rgba(168,85,247,0.25)] ring-1 ring-violet-500/50'
            : 'bg-[#180b2d] border-violet-900/60 hover:border-violet-700/60 hover:bg-[#1d0e36]'
        }`}
      >
        {/* Security / Identity Indicator */}
        <button
          type="button"
          onClick={onOpenSecurityModal}
          title={
            isInternal
              ? 'Quantum Browser Built-in Component'
              : isSecure
              ? 'Connection is Secure (TLS Verified)'
              : 'Connection is Not Secure'
          }
          className="flex items-center gap-1 text-xs px-1 py-0.5 rounded hover:bg-violet-800/40 text-violet-300 transition shrink-0"
        >
          {isInternal ? (
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          ) : isSecure ? (
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-amber-400" />
          )}
        </button>

        {/* Engine Switcher */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEngineDropdown(!showEngineDropdown)}
            title={`Search Engine: ${currentEngineObj.name}`}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-violet-300/80 hover:text-violet-100 hover:bg-violet-800/40 transition"
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] text-violet-300 bg-violet-950 rounded-sm border border-violet-700/50">
              {currentEngine[0].toUpperCase()}
            </span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {/* Engine Dropdown */}
          {showEngineDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#1e0e38] border border-violet-700/50 rounded-xl shadow-2xl py-1 z-50 overflow-hidden text-xs">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-violet-400/80 uppercase tracking-wider border-b border-violet-800/40">
                Default Search Engine
              </div>
              {Object.values(SEARCH_ENGINES).map((eng) => (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => {
                    onSelectEngine(eng.id);
                    setShowEngineDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-violet-800/50 transition ${
                    currentEngine === eng.id
                      ? 'text-violet-200 font-semibold bg-violet-900/40'
                      : 'text-violet-300/90'
                  }`}
                >
                  <span className="w-4 h-4 rounded bg-violet-950 flex items-center justify-center font-mono text-[10px] text-violet-300 border border-violet-700/60">
                    {eng.id[0].toUpperCase()}
                  </span>
                  <span>{eng.name}</span>
                  {currentEngine === eng.id && (
                    <span className="ml-auto text-[10px] text-violet-400 font-mono">active</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* URL / Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            inputRef.current?.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Search with ${currentEngineObj.name} or enter address`}
          className="flex-1 bg-transparent text-xs text-violet-100 placeholder-violet-400/40 outline-none min-w-0"
          spellCheck={false}
          autoComplete="off"
        />

        {/* Zoom Reset Badge if not 100% */}
        {zoomLevel !== 1 && (
          <button
            type="button"
            onClick={onResetZoom}
            title="Reset Zoom to 100%"
            className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-violet-800/60 hover:bg-violet-700 text-violet-200 rounded transition shrink-0"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
        )}

        {/* Bookmark Star Button */}
        <button
          type="button"
          onClick={onToggleBookmark}
          title={isBookmarked ? 'Edit this bookmark' : 'Bookmark this tab (Ctrl+D)'}
          aria-label="Bookmark"
          className="p-1 rounded hover:bg-violet-800/40 text-violet-300 transition shrink-0"
        >
          <Star
            className={`w-3.5 h-3.5 transition-colors ${
              isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-violet-400/70 hover:text-violet-200'
            }`}
          />
        </button>
      </div>

      {/* Search Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a0c32] border border-violet-700/50 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={() => handleSubmit(suggestion)}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
              className={`flex items-center gap-2.5 px-3 py-1.5 text-xs cursor-pointer transition ${
                selectedSuggestionIndex === index
                  ? 'bg-violet-800/50 text-violet-100 font-medium'
                  : 'text-violet-300/80 hover:bg-violet-800/30'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="truncate flex-1">{suggestion}</span>
              <span className="text-[10px] text-violet-500 font-mono">
                {currentEngineObj.name} Search
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
