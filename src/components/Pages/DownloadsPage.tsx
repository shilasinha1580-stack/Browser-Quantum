import React, { useState } from 'react';
import { Download, Search, Trash2, CheckCircle2, File, ExternalLink, RefreshCw } from 'lucide-react';
import { DownloadItem } from '../../types/browser';
import { StorageService } from '../../utils/storage';

export const DownloadsPage: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    const list = StorageService.getDownloads();
    if (list.length === 0) {
      return [
        {
          id: 'dl-sample-1',
          filename: 'quantum-browser-1.0.0-arm64.apk',
          url: 'https://releases.quantumbrowser.org/android/quantum-browser-arm64.apk',
          sizeBytes: 68420100,
          receivedBytes: 68420100,
          status: 'completed',
          mimeType: 'application/vnd.android.package-archive',
          startTime: Date.now() - 3600000 * 2,
          speed: 'Done'
        },
        {
          id: 'dl-sample-2',
          filename: 'quantum-browser_1.0.0_amd64.deb',
          url: 'https://releases.quantumbrowser.org/linux/quantum-browser_amd64.deb',
          sizeBytes: 84120300,
          receivedBytes: 84120300,
          status: 'completed',
          mimeType: 'application/vnd.debian.binary-package',
          startTime: Date.now() - 3600000 * 5,
          speed: 'Done'
        }
      ];
    }
    return list;
  });

  const [search, setSearch] = useState('');

  const handleClearCompleted = () => {
    const active = downloads.filter(d => d.status === 'downloading');
    setDownloads(active);
    StorageService.saveDownloads(active);
  };

  const handleRemove = (id: string) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    StorageService.saveDownloads(updated);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filtered = downloads.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.filename.toLowerCase().includes(s) || d.url.toLowerCase().includes(s);
  });

  return (
    <div className="min-h-full bg-[#130728] text-violet-100 p-6 md:p-8 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-violet-800/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-700/50 border border-violet-500/40 flex items-center justify-center text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Downloads</h1>
              <p className="text-xs text-violet-300/80">Manage downloaded application packages and files</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-violet-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search downloads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1a0c32] border border-violet-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-violet-100 outline-none focus:border-violet-500"
              />
            </div>
            <button
              type="button"
              onClick={handleClearCompleted}
              className="px-3.5 py-2 bg-violet-900/40 hover:bg-violet-800 border border-violet-700/40 rounded-xl text-xs font-semibold text-violet-300 hover:text-white transition shrink-0"
            >
              Clear List
            </button>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-violet-400 border border-dashed border-violet-800/50 rounded-2xl bg-violet-950/10">
            No downloads recorded.
          </div>
        ) : (
          <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl overflow-hidden divide-y divide-violet-900/40 text-xs">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-violet-900/20 transition group">
                <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-4">
                  <div className="w-9 h-9 rounded-xl bg-violet-950/80 border border-violet-700/60 flex items-center justify-center text-violet-300 shrink-0">
                    <File className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-violet-100 truncate group-hover:text-white">
                      {item.filename}
                    </div>
                    <div className="text-[11px] text-violet-400/80 flex items-center gap-2 mt-0.5 font-mono">
                      <span>{formatBytes(item.sizeBytes)}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-sans">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={item.url}
                    download={item.filename}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-violet-700/60 hover:bg-violet-600 rounded-lg text-violet-100 transition text-[11px] font-medium"
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 text-violet-400 hover:text-red-400 rounded-lg hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition"
                    title="Remove from download list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
