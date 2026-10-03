import { SearchEngineConfig, SearchEngineId } from '../types/browser';

export const SEARCH_ENGINES: Record<SearchEngineId, SearchEngineConfig> = {
  google: {
    id: 'google',
    name: 'Google',
    searchUrl: 'https://www.google.com/search?q=%s',
    icon: 'https://www.google.com/favicon.ico',
    homepage: 'https://www.google.com'
  },
  duckduckgo: {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    searchUrl: 'https://duckduckgo.com/?q=%s',
    icon: 'https://duckduckgo.com/favicon.ico',
    homepage: 'https://duckduckgo.com'
  },
  bing: {
    id: 'bing',
    name: 'Bing',
    searchUrl: 'https://www.bing.com/search?q=%s',
    icon: 'https://www.bing.com/favicon.ico',
    homepage: 'https://www.bing.com'
  },
  brave: {
    id: 'brave',
    name: 'Brave Search',
    searchUrl: 'https://search.brave.com/search?q=%s',
    icon: 'https://brave.com/static-assets/images/brave-favicon.png',
    homepage: 'https://search.brave.com'
  }
};

/**
 * Determine if an address bar string is a URL, an internal quantum: page, or a search query
 */
export function parseAddressInput(
  input: string,
  selectedEngine: SearchEngineId = 'google'
): { targetUrl: string; isInternal: boolean; displayUrl: string } {
  const trimmed = input.trim();

  if (!trimmed) {
    return { targetUrl: 'quantum:newtab', isInternal: true, displayUrl: '' };
  }

  // Handle internal quantum: / about: pages
  if (
    trimmed.startsWith('quantum:') ||
    trimmed.startsWith('about:')
  ) {
    let normalized = trimmed;
    if (normalized === 'about:blank' || normalized === 'about:home' || normalized === 'about:newtab') {
      normalized = 'quantum:newtab';
    } else if (normalized === 'about:addons' || normalized === 'about:ublock') {
      normalized = 'quantum:ublock';
    } else if (normalized === 'about:preferences' || normalized === 'about:settings') {
      normalized = 'quantum:settings';
    } else if (normalized === 'about:downloads') {
      normalized = 'quantum:downloads';
    } else if (normalized === 'about:history') {
      normalized = 'quantum:history';
    } else if (normalized === 'about:bookmarks') {
      normalized = 'quantum:bookmarks';
    } else if (normalized === 'about:about' || normalized === 'about:support') {
      normalized = 'quantum:about';
    }
    return {
      targetUrl: normalized,
      isInternal: true,
      displayUrl: normalized
    };
  }

  // Check for localhost or IP addresses
  if (
    /^localhost(:\d+)?(\/.*)?$/i.test(trimmed) ||
    /^127\.0\.0\.1(:\d+)?(\/.*)?$/.test(trimmed) ||
    /^192\.168\.\d+\.\d+(:\d+)?(\/.*)?$/.test(trimmed) ||
    /^10\.\d+\.\d+\.\d+(:\d+)?(\/.*)?$/.test(trimmed)
  ) {
    const fullUrl = `http://${trimmed}`;
    return { targetUrl: fullUrl, isInternal: false, displayUrl: trimmed };
  }

  // Check for explicit scheme (http://, https://, ftp://, data:, file:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    return { targetUrl: trimmed, isInternal: false, displayUrl: trimmed };
  }

  // Check if string looks like a standard domain with a TLD (e.g., example.com, test.org/path)
  // Must have a dot, no spaces, and a valid TLD or port
  const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/.*)?$/;
  if (!trimmed.includes(' ') && domainRegex.test(trimmed)) {
    return {
      targetUrl: `https://${trimmed}`,
      isInternal: false,
      displayUrl: trimmed
    };
  }

  // Otherwise, treat as search query for selected search engine
  const engine = SEARCH_ENGINES[selectedEngine] || SEARCH_ENGINES.google;
  const searchUrl = engine.searchUrl.replace('%s', encodeURIComponent(trimmed));

  return {
    targetUrl: searchUrl,
    isInternal: false,
    displayUrl: trimmed
  };
}

/**
 * Format displayed URL (strips redundant https://, internal frame params, and trailing / for clean UI)
 */
export function formatDisplayUrl(url: string): string {
  if (url.startsWith('quantum:')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      // Remove internal frame compatibility param from address bar display
      parsed.searchParams.delete('igu');
      const searchStr = parsed.search;
      const path = parsed.pathname === '/' && !searchStr ? '' : parsed.pathname;
      const formatted = parsed.hostname + path + searchStr;
      return formatted;
    }
    return url;
  } catch {
    return url;
  }
}
