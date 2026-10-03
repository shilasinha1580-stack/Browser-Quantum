export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  favicon?: string;
  isLoading: boolean;
  isPrivate: boolean;
  isPinned: boolean;
  isMuted: boolean;
  zoom: number; // 0.5 to 2.0 (default 1.0)
  history: string[];
  historyIndex: number;
  blockedCount: number;
  securityState: 'secure' | 'insecure' | 'internal' | 'blocked';
  lastAccessed: number;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folder: string;
  dateAdded: number;
  favicon?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: number;
  isPrivate?: boolean;
}

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  sizeBytes: number;
  receivedBytes: number;
  status: 'downloading' | 'completed' | 'cancelled' | 'error';
  mimeType: string;
  startTime: number;
  speed: string;
}

export type PermissionType = 'geolocation' | 'camera' | 'microphone' | 'notifications' | 'popups';
export type PermissionState = 'allow' | 'block' | 'ask';

export interface SitePermission {
  origin: string;
  permission: PermissionType;
  state: PermissionState;
}

export type SearchEngineId = 'google' | 'bing' | 'duckduckgo' | 'brave';

export interface SearchEngineConfig {
  id: SearchEngineId;
  name: string;
  searchUrl: string; // e.g. "https://www.google.com/search?q=%s"
  icon: string;
  homepage: string;
}

export interface UBlockSettings {
  enabled: boolean;
  cosmeticFiltering: boolean;
  blockLargeMedia: boolean;
  strictBlocking: boolean;
  whitelistedDomains: string[];
  filterLists: {
    id: string;
    name: string;
    rulesCount: number;
    enabled: boolean;
    category: 'ads' | 'privacy' | 'malware' | 'multipurpose';
    updatedAt: string;
  }[];
  customRules: string[];
}

export interface BlockedLogItem {
  id: string;
  timestamp: number;
  tabId: string;
  url: string;
  domain: string;
  type: 'script' | 'image' | 'stylesheet' | 'xmlhttprequest' | 'subdocument' | 'other';
  rule: string;
  filterList: string;
  action: 'blocked' | 'cosmetic-hidden' | 'allowed';
}

export interface BrowserPreferences {
  theme: 'system' | 'violet-dark' | 'violet-light';
  searchEngine: SearchEngineId;
  homePage: string;
  httpsOnlyMode: boolean;
  doNotTrack: boolean;
  showBookmarksBar: boolean;
  trackingProtection: 'standard' | 'strict' | 'custom';
  cookiePolicy: 'allow-all' | 'block-third-party' | 'block-all';
  clearOnExit: {
    history: boolean;
    cookies: boolean;
    cache: boolean;
  };
}
