import { BlockedLogItem, UBlockSettings } from '../types/browser';

// Default bundled uBlock Origin settings & filter lists
export const DEFAULT_UBLOCK_SETTINGS: UBlockSettings = {
  enabled: true,
  cosmeticFiltering: true,
  blockLargeMedia: false,
  strictBlocking: true,
  whitelistedDomains: [
    'localhost',
    '127.0.0.1',
    'quantum.internal',
    'about',
    'quantum',
  ],
  filterLists: [
    {
      id: 'ublock-filters',
      name: 'uBlock filters (built-in)',
      rulesCount: 38420,
      enabled: true,
      category: 'multipurpose',
      updatedAt: '2026-10-01'
    },
    {
      id: 'easylist',
      name: 'EasyList (Primary Ad-blocking)',
      rulesCount: 96800,
      enabled: true,
      category: 'ads',
      updatedAt: '2026-10-01'
    },
    {
      id: 'easyprivacy',
      name: 'EasyPrivacy (Trackers & Beacons)',
      rulesCount: 42150,
      enabled: true,
      category: 'privacy',
      updatedAt: '2026-10-01'
    },
    {
      id: 'peter-lowe',
      name: "Peter Lowe's Ad and tracking server list",
      rulesCount: 4120,
      enabled: true,
      category: 'multipurpose',
      updatedAt: '2026-09-28'
    },
    {
      id: 'malware-domains',
      name: 'Online Malicious URL Blocklist',
      rulesCount: 28900,
      enabled: true,
      category: 'malware',
      updatedAt: '2026-10-02'
    }
  ],
  customRules: [
    '@@||googlevideo.com^',
    '@@||ytimg.com^',
    '@@||ggpht.com^',
    '@@||youtube.com/s/player/',
    '@@||youtube.com/youtubei/',
    '@@||static.doubleclick.net/instream/*$domain=youtube.com',
    '@@||google.com/recaptcha/$script,subdocument,xmlhttprequest',
    '@@||gstatic.com/recaptcha/$script,subdocument,xmlhttprequest',
    '@@||recaptcha.net^',
    '||doubleclick.net^',
    '||google-analytics.com^',
    '||adnxs.com^',
    '###ad-slot',
    '##.sponsored-story'
  ]
};

/**
 * Check if a URL is an essential YouTube video playback, player asset, or metadata endpoint.
 * uBlock Origin must never block core video streaming or player initialization.
 */
export function isYouTubeRequiredResource(urlStr: string): boolean {
  try {
    const u = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();

    // YouTube CDN streaming chunks, thumbnails, avatars, and embed domains
    if (
      host === 'googlevideo.com' || host.endsWith('.googlevideo.com') ||
      host === 'ytimg.com' || host.endsWith('.ytimg.com') ||
      host === 'ggpht.com' || host.endsWith('.ggpht.com') ||
      host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')
    ) {
      return true;
    }

    // YouTube player binaries, InnerTube API, and playback state pings
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (
        path.startsWith('/s/player/') ||
        path.startsWith('/s/desktop/') ||
        path.startsWith('/youtubei/') ||
        path.startsWith('/api/stats/playback') ||
        path.startsWith('/api/stats/qoe') ||
        path.startsWith('/api/stats/watchtime') ||
        path.startsWith('/embed') ||
        path.includes('base.js') ||
        path.includes('player')
      ) {
        return true;
      }
    }

    // Static doubleclick player asset loaded by YouTube player
    if (host.includes('doubleclick.net') && path.includes('/instream/')) {
      return true;
    }
  } catch {
    if (urlStr.includes('googlevideo.com') || urlStr.includes('ytimg.com') || urlStr.includes('/s/player/')) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a URL is an official Google reCAPTCHA or security verification endpoint.
 * uBlock Origin must never block security verification challenges.
 */
export function isGoogleRecaptchaResource(urlStr: string): boolean {
  try {
    const u = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();

    if (
      host === 'recaptcha.net' ||
      host.endsWith('.recaptcha.net') ||
      ((host === 'google.com' || host.endsWith('.google.com') || host === 'gstatic.com' || host.endsWith('.gstatic.com')) &&
        (path.includes('/recaptcha') || path.includes('/sorry/') || path.includes('/js/bg')))
    ) {
      return true;
    }
  } catch {
    if (urlStr.includes('/recaptcha/') || urlStr.includes('gstatic.com/recaptcha') || urlStr.includes('recaptcha.net')) {
      return true;
    }
  }
  return false;
}

// Known ad & tracker domains compiled into lookup maps for instant client-side evaluation
const AD_TRACKER_HOSTS = new Set([
  'google-analytics.com',
  'www.google-analytics.com',
  'analytics.google.com',
  'googlesyndication.com',
  'pagead2.googlesyndication.com',
  'doubleclick.net',
  'ad.doubleclick.net',
  'stats.g.doubleclick.net',
  'adservice.google.com',
  'adnxs.com',
  'ib.adnxs.com',
  'criteo.com',
  'static.criteo.net',
  'outbrain.com',
  'widgets.outbrain.com',
  'taboola.com',
  'cdn.taboola.com',
  'amazon-adsystem.com',
  'aax.amazon-adsystem.com',
  'connect.facebook.net',
  'scorecardresearch.com',
  'sb.scorecardresearch.com',
  'quantserve.com',
  'pixel.quantserve.com',
  'hotjar.com',
  'static.hotjar.com',
  'clarity.ms',
  'c.bing.com',
  'moatads.com',
  'rubiconproject.com',
  'pubmatic.com',
  'openx.net',
  'adtechus.com',
  'popads.net',
  'popcash.net',
  'exoclick.com',
  'smartadserver.com',
  'bidswitch.net',
  'casalemedia.com',
  'serving-sys.com',
  'advertising.com',
  'track.adform.net',
  'ads.pubmatic.com',
  'adserver.yahoo.com',
  'bat.bing.com'
]);

const AD_PATH_REGEXES = [
  /\/ads\//i,
  /\/ad-banner\//i,
  /\/adserver\//i,
  /\/gtag\/js/i,
  /\/fbevents\.js/i,
  /\/analytics\.js/i,
  /\/pixel\.[a-z]{2,4}/i,
  /\/tracking\//i,
  /\/telemetry\//i,
  /\/beacon\//i,
  /\/ad_frame/i
];

export class UBlockOriginEngine {
  private settings: UBlockSettings;
  private log: BlockedLogItem[] = [];
  private totalBlocked: number = 0;
  private listeners: (() => void)[] = [];

  constructor(initialSettings?: UBlockSettings) {
    this.settings = initialSettings || DEFAULT_UBLOCK_SETTINGS;
  }

  public getSettings(): UBlockSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<UBlockSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.notify();
  }

  public isWhitelisted(domainOrUrl: string): boolean {
    try {
      let hostname = domainOrUrl;
      if (domainOrUrl.includes('://')) {
        hostname = new URL(domainOrUrl).hostname;
      }
      return this.settings.whitelistedDomains.some(
        d => hostname === d || hostname.endsWith(`.${d}`)
      );
    } catch {
      return false;
    }
  }

  public toggleWhitelist(domainOrUrl: string): boolean {
    let hostname = domainOrUrl;
    try {
      if (domainOrUrl.includes('://')) {
        hostname = new URL(domainOrUrl).hostname;
      }
    } catch {
      // use raw
    }
    const isCurrentlyWhitelisted = this.isWhitelisted(hostname);
    if (isCurrentlyWhitelisted) {
      this.settings.whitelistedDomains = this.settings.whitelistedDomains.filter(
        d => d !== hostname && !hostname.endsWith(`.${d}`)
      );
    } else {
      this.settings.whitelistedDomains.push(hostname);
    }
    this.notify();
    return !isCurrentlyWhitelisted;
  }

  // Intercept and evaluate a network request
  public shouldBlockRequest(
    targetUrl: string,
    pageDomain: string,
    resourceType: BlockedLogItem['type'] = 'script',
    tabId: string = 'tab-current'
  ): { blocked: boolean; rule?: string; list?: string } {
    if (!this.settings.enabled) {
      return { blocked: false };
    }

    if (this.isWhitelisted(pageDomain)) {
      return { blocked: false };
    }

    // Google reCAPTCHA compatibility exception: never block required security challenges
    if (isGoogleRecaptchaResource(targetUrl)) {
      return { blocked: false };
    }

    // YouTube compatibility exception: never block required video playback and player assets
    if (isYouTubeRequiredResource(targetUrl)) {
      return { blocked: false };
    }

    try {
      const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      const reqHostname = urlObj.hostname.toLowerCase();

      // Check against known ad/tracker hosts
      for (const host of AD_TRACKER_HOSTS) {
        if (reqHostname === host || reqHostname.endsWith(`.${host}`)) {
          const rule = `||${host}^`;
          this.recordBlock(tabId, targetUrl, reqHostname, resourceType, rule, 'EasyList / EasyPrivacy');
          return { blocked: true, rule, list: 'EasyList' };
        }
      }

      // Check path regexes
      for (const regex of AD_PATH_REGEXES) {
        if (regex.test(urlObj.pathname)) {
          const rule = regex.toString();
          this.recordBlock(tabId, targetUrl, reqHostname, resourceType, rule, 'uBlock filters');
          return { blocked: true, rule, list: 'uBlock filters' };
        }
      }

      // Check custom rules
      for (const customRule of this.settings.customRules) {
        if (customRule.startsWith('||') && customRule.endsWith('^')) {
          const targetDomain = customRule.slice(2, -1);
          if (reqHostname === targetDomain || reqHostname.endsWith(`.${targetDomain}`)) {
            this.recordBlock(tabId, targetUrl, reqHostname, resourceType, customRule, 'My Rules');
            return { blocked: true, rule: customRule, list: 'My Rules' };
          }
        }
      }
    } catch {
      // Ignore malformed URLs
    }

    return { blocked: false };
  }

  private recordBlock(
    tabId: string,
    url: string,
    domain: string,
    type: BlockedLogItem['type'],
    rule: string,
    filterList: string
  ) {
    this.totalBlocked++;
    const item: BlockedLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      tabId,
      url,
      domain,
      type,
      rule,
      filterList,
      action: 'blocked'
    };

    // Keep up to 200 log items
    this.log.unshift(item);
    if (this.log.length > 200) {
      this.log.pop();
    }

    this.notify();
  }

  public getBlockedCountForTab(tabId: string): number {
    return this.log.filter(l => l.tabId === tabId && l.action === 'blocked').length;
  }

  public getTotalBlockedCount(): number {
    return this.totalBlocked;
  }

  public getLogs(): BlockedLogItem[] {
    return this.log;
  }

  public clearLogs() {
    this.log = [];
    this.notify();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

// Global singleton instance for the app
export const uBlockEngine = new UBlockOriginEngine();
