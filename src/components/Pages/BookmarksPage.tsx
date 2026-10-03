import React, { useState } from 'react';
import { Bookmark as BookmarkIcon, Search, Plus, Trash2, Globe, ExternalLink, Download, Upload } from 'lucide-react';
import { Bookmark } from '../../types/browser';
import { StorageService } from '../../utils/storage';

interface BookmarksPageProps {
  onNavigate: (url: string) => void;
  onRefreshBookmarks: () => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({
  onNavigate,
  onRefreshBookmarks,
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(StorageService.getBookmarks());
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.removeBookmark(id);
    const updated = StorageService.getBookmarks();
    setBookmarks(updated);
    onRefreshBookmarks();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    const title = newTitle.trim() || url;
    StorageService.addBookmark({
      title,
      url,
      folder: 'Bookmarks Bar',
      favicon: `${url}/favicon.ico`
    });
    setBookmarks(StorageService.getBookmarks());
    onRefreshBookmarks();
    setShowAddModal(false);
    setNewTitle('');
    setNewUrl('');
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `quantum_bookmarks_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filtered = bookmarks.filter(b => {
    if (!search) return true;
    const s = search.toLowerCase();
    return b.title.toLowerCase().includes(s) || b.url.toLowerCase().includes(s);
  });

  return (
    <div className="min-h-full bg-[#130728] text-violet-100 p-6 md:p-8 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-violet-800/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-700/50 border border-violet-500/40 flex items-center justify-center text-white">
              <BookmarkIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Bookmarks Manager</h1>
              <p className="text-xs text-violet-300/80">Manage favorite websites and quick navigation shortcuts</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-violet-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1a0c32] border border-violet-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-violet-100 outline-none focus:border-violet-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Bookmark
            </button>
            <button
              type="button"
              onClick={handleExport}
              title="Export Bookmarks as JSON"
              className="p-2 bg-violet-900/40 hover:bg-violet-800 border border-violet-700/40 rounded-xl text-violet-300 hover:text-white transition shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-violet-400 border border-dashed border-violet-800/50 rounded-2xl bg-violet-950/10">
            No bookmarks matching your search.
          </div>
        ) : (
          <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl overflow-hidden divide-y divide-violet-900/40 text-xs">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate(item.url)}
                className="flex items-center justify-between p-3.5 hover:bg-violet-900/30 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                  <div className="w-6 h-6 rounded-lg bg-violet-950/80 border border-violet-800/50 flex items-center justify-center shrink-0">
                    <Globe className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-violet-100 truncate group-hover:text-white">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-violet-400/80 truncate font-mono mt-0.5">
                      {item.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-violet-400 bg-violet-950 px-2 py-0.5 rounded border border-violet-800/40">
                    {item.folder}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-violet-400 hover:text-red-400 rounded-lg hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition"
                    title="Delete bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e0e3b] border border-violet-600/50 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-violet-100">
            <h3 className="text-sm font-bold text-white mb-3">Add Bookmark</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-violet-300 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Website name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#140827] border border-violet-700/60 rounded-xl px-3 py-2 text-violet-100 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-violet-300 mb-1">URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-[#140827] border border-violet-700/60 rounded-xl px-3 py-2 text-violet-100 outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-violet-700 text-violet-300 hover:bg-violet-800/40 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition"
                >
                  Save Bookmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
