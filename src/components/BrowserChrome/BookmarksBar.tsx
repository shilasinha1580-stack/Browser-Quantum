import React from 'react';
import { Bookmark } from '../../types/browser';
import { Globe, Bookmark as BookmarkIcon, Sparkles } from 'lucide-react';

interface BookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onOpenBookmarksManager: () => void;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({
  bookmarks,
  onNavigate,
  onOpenBookmarksManager,
}) => {
  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-[#150a27] border-b border-violet-950/40 text-[11px] select-none overflow-x-auto scrollbar-none h-7">
      <button
        type="button"
        onClick={onOpenBookmarksManager}
        title="Open Bookmarks Manager"
        className="flex items-center gap-1 px-1.5 py-0.5 text-violet-400 hover:text-violet-200 hover:bg-violet-800/30 rounded transition shrink-0 font-medium"
      >
        <BookmarkIcon className="w-3 h-3 text-violet-400" />
        <span className="hidden sm:inline">Bookmarks</span>
      </button>

      <div className="h-3 w-[1px] bg-violet-800/40 mx-1 shrink-0" />

      {bookmarks.slice(0, 10).map((bm) => (
        <button
          key={bm.id}
          type="button"
          onClick={() => onNavigate(bm.url)}
          title={`${bm.title}\n${bm.url}`}
          className="flex items-center gap-1.5 px-2 py-0.5 text-violet-300/80 hover:text-violet-100 hover:bg-violet-800/40 rounded transition max-w-[160px] truncate shrink-0"
        >
          {bm.favicon ? (
            <img
              src={bm.favicon}
              alt=""
              className="w-3 h-3 object-contain rounded-xs shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : bm.url.startsWith('quantum:') ? (
            <Sparkles className="w-3 h-3 text-violet-400 shrink-0" />
          ) : (
            <Globe className="w-3 h-3 text-violet-400/70 shrink-0" />
          )}
          <span className="truncate">{bm.title}</span>
        </button>
      ))}
    </div>
  );
};
