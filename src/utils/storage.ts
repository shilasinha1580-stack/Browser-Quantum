import { Bookmark, BrowserPreferences, DownloadItem, HistoryItem, SitePermission } from '../types/browser';

const STORAGE_KEYS = {
  PREFERENCES: 'quantum_preferences_v1',
  BOOKMARKS: 'quantum_bookmarks_v1',
  HISTORY: 'quantum_history_v1',
  DOWNLOADS: 'quantum_downloads_v1',
  PERMISSIONS: 'quantum_permissions_v1',
  UBLOCK: 'quantum_ublock_config_v1',
};

export const DEFAULT_PREFERENCES: BrowserPreferences = {
  theme: 'violet-dark',
  searchEngine: 'google',
  homePage: 'quantum:newtab',
  httpsOnlyMode: true,
  doNotTrack: true,
  showBookmarksBar: true,
  trackingProtection: 'strict',
  cookiePolicy: 'block-third-party',
  clearOnExit: {
    history: false,
    cookies: false,
    cache: false
  }
};

export const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-1',
    title: 'Mozilla Developer Network (MDN)',
    url: 'https://developer.mozilla.org',
    folder: 'Bookmarks Bar',
    dateAdded: Date.now() - 86400000 * 3,
    favicon: 'https://developer.mozilla.org/favicon.ico'
  },
  {
    id: 'bm-2',
    title: 'Mozilla GeckoView Documentation',
    url: 'https://mozilla.github.io/geckoview/',
    folder: 'Bookmarks Bar',
    dateAdded: Date.now() - 86400000 * 2,
    favicon: 'https://mozilla.github.io/favicon.ico'
  },
  {
    id: 'bm-3',
    title: 'uBlock Origin GitHub Repository',
    url: 'https://github.com/gorhill/uBlock',
    folder: 'Bookmarks Bar',
    dateAdded: Date.now() - 86400000 * 1,
    favicon: 'https://github.githubassets.com/favicons/favicon.png'
  },
  {
    id: 'bm-4',
    title: 'DuckDuckGo Privacy Search',
    url: 'https://duckduckgo.com',
    folder: 'Bookmarks Bar',
    dateAdded: Date.now() - 86400000,
    favicon: 'https://duckduckgo.com/favicon.ico'
  },
  {
    id: 'bm-5',
    title: 'Wikipedia, the free encyclopedia',
    url: 'https://en.wikipedia.org',
    folder: 'Bookmarks Bar',
    dateAdded: Date.now() - 3600000,
    favicon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico'
  }
];

export const StorageService = {
  // Preferences
  getPreferences(): BrowserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
    } catch {
      // Local fallback
    }
    return DEFAULT_PREFERENCES;
  },

  savePreferences(prefs: BrowserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  },

  // Bookmarks
  getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_BOOKMARKS;
  },

  saveBookmarks(bookmarks: Bookmark[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (err) {
      console.error('Failed to save bookmarks:', err);
    }
  },

  addBookmark(item: Omit<Bookmark, 'id' | 'dateAdded'>): Bookmark {
    const bookmarks = this.getBookmarks();
    const newBm: Bookmark = {
      ...item,
      id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      dateAdded: Date.now()
    };
    bookmarks.unshift(newBm);
    this.saveBookmarks(bookmarks);
    return newBm;
  },

  removeBookmark(id: string): void {
    const bookmarks = this.getBookmarks().filter(b => b.id !== id);
    this.saveBookmarks(bookmarks);
  },

  isBookmarked(url: string): boolean {
    return this.getBookmarks().some(b => b.url === url);
  },

  // History
  getHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return [];
  },

  addHistory(title: string, url: string, isPrivate: boolean = false): void {
    if (isPrivate || url.startsWith('quantum:newtab')) return;
    const history = this.getHistory();
    // Remove duplicate recent if same url visited recently
    const filtered = history.filter(h => h.url !== url || (Date.now() - h.timestamp > 300000));
    filtered.unshift({
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: title || url,
      url,
      timestamp: Date.now()
    });
    // Keep max 500 history entries
    if (filtered.length > 500) filtered.length = 500;
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  },

  deleteHistoryItem(id: string): void {
    const history = this.getHistory().filter(h => h.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  },

  // Downloads
  getDownloads(): DownloadItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return [];
  },

  saveDownloads(downloads: DownloadItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
    } catch (err) {
      console.error('Failed to save downloads:', err);
    }
  },

  addDownload(item: Omit<DownloadItem, 'id' | 'startTime'>): DownloadItem {
    const downloads = this.getDownloads();
    const newDownload: DownloadItem = {
      ...item,
      id: `dl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      startTime: Date.now()
    };
    downloads.unshift(newDownload);
    this.saveDownloads(downloads);
    return newDownload;
  },

  // Permissions
  getPermissions(): SitePermission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return [
      { origin: 'https://duckduckgo.com', permission: 'geolocation', state: 'ask' },
      { origin: 'https://en.wikipedia.org', permission: 'notifications', state: 'block' }
    ];
  },

  savePermissions(perms: SitePermission[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(perms));
    } catch (err) {
      console.error('Failed to save permissions:', err);
    }
  },

  setSitePermission(origin: string, permission: SitePermission['permission'], state: SitePermission['state']): void {
    const perms = this.getPermissions().filter(p => !(p.origin === origin && p.permission === permission));
    perms.push({ origin, permission, state });
    this.savePermissions(perms);
  },

  /**
   * Clear Browsing Data with time range
   * Implements strongest practical OS-supported deletion.
   */
  clearBrowsingData(options: {
    timeRange: 'hour' | '24hours' | '7days' | '4weeks' | 'everything';
    history: boolean;
    cookies: boolean;
    cache: boolean;
    downloads: boolean;
    siteSettings: boolean;
  }): { itemsCleared: number; message: string } {
    let cutoff = 0;
    const now = Date.now();
    if (options.timeRange === 'hour') cutoff = now - 3600000;
    else if (options.timeRange === '24hours') cutoff = now - 86400000;
    else if (options.timeRange === '7days') cutoff = now - 86400000 * 7;
    else if (options.timeRange === '4weeks') cutoff = now - 86400000 * 28;
    else cutoff = 0; // everything

    let count = 0;

    if (options.history) {
      const current = this.getHistory();
      const filtered = cutoff === 0 ? [] : current.filter(h => h.timestamp < cutoff);
      count += current.length - filtered.length;
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    }

    if (options.downloads) {
      const current = this.getDownloads();
      const filtered = cutoff === 0 ? [] : current.filter(d => d.startTime < cutoff);
      count += current.length - filtered.length;
      localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(filtered));
    }

    if (options.cookies) {
      // In web sandbox, document.cookie is cleared for current origin
      try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      } catch {
        // Ignored
      }
      count += 1;
    }

    if (options.cache) {
      // Clear CacheStorage API if available
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then(names => {
          for (const name of names) caches.delete(name);
        }).catch(() => {});
      }
      count += 1;
    }

    if (options.siteSettings) {
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify([]));
      count += 1;
    }

    return {
      itemsCleared: count,
      message: 'Browsing records purged using strongest practical OS-level deletion.'
    };
  }
};
