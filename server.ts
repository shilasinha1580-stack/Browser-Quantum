import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Known tracker and ad domains / regexes for the built-in uBlock Origin engine
const AD_TRACKER_PATTERNS = [
  /google-analytics\.com/i,
  /googlesyndication\.com/i,
  /doubleclick\.net/i,
  /adservice\.google\./i,
  /adnxs\.com/i,
  /criteo\.com/i,
  /criteo\.net/i,
  /outbrain\.com/i,
  /taboola\.com/i,
  /amazon-adsystem\.com/i,
  /facebook\.com\/tr/i,
  /connect\.facebook\.net.*\/fbevents\.js/i,
  /scorecardresearch\.com/i,
  /quantserve\.com/i,
  /hotjar\.com/i,
  /clarity\.ms/i,
  /moatads\.com/i,
  /rubiconproject\.com/i,
  /pubmatic\.com/i,
  /openx\.net/i,
  /adtechus\.com/i,
  /adsystem/i,
  /tracking/i,
  /telemetry/i,
  /analytics\.js/i,
  /gtag\/js/i,
  /adsense/i,
  /adsbox/i,
  /popads\.net/i,
  /popcash\.net/i,
  /exoclick\.com/i,
  /zedo\.com/i,
  /smartadserver\.com/i,
  /bidswitch\.net/i,
  /casalemedia\.com/i,
  /serving-sys\.com/i,
  /advertising\.com/i
];

// Cosmetic filtering CSS selector bundled from EasyList & uBlock Filters
const UBLOCK_COSMETIC_CSS = `
  /* Quantum Browser bundled uBlock Origin cosmetic rules */
  .adsbygoogle, [id*="google_ads_"], [id*="ad-slot"], [id*="ad_wrapper"],
  .advertisement, .ad-banner, .banner-ad, .ad-container, .sponsored-post,
  .trc_related_container, .outbrain-ads, .taboola-container,
  [data-ad-unit], [data-ad-client], .dfp-ad, .native-ad,
  .afs_ads, .ad_channel, #ad-leaderboard, .ad-leaderboard,
  .cookie-banner-annoyance, [class*="sponsored-links"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
`;

// Helper: Check if a URL is an official Google reCAPTCHA or security verification endpoint
function isGoogleRecaptchaResource(urlStr: string): boolean {
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

// Helper: Check if a URL is an essential YouTube video playback, player asset, or metadata endpoint
function isYouTubeRequiredResource(urlStr: string): boolean {
  try {
    const u = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();

    if (
      host === 'googlevideo.com' || host.endsWith('.googlevideo.com') ||
      host === 'ytimg.com' || host.endsWith('.ytimg.com') ||
      host === 'ggpht.com' || host.endsWith('.ggpht.com') ||
      host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')
    ) {
      return true;
    }

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

// Helper: Check if URL matches ad/tracker filter
function isAdOrTracker(urlStr: string): { blocked: boolean; pattern?: string } {
  // Google reCAPTCHA and security challenge resources are never blocked
  if (isGoogleRecaptchaResource(urlStr)) {
    return { blocked: false };
  }

  // YouTube core streaming, player assets, and InnerTube APIs are never blocked
  if (isYouTubeRequiredResource(urlStr)) {
    return { blocked: false };
  }

  for (const pattern of AD_TRACKER_PATTERNS) {
    if (pattern.test(urlStr)) {
      return { blocked: true, pattern: pattern.toString() };
    }
  }
  return { blocked: false };
}

// Endpoint: Check URL against uBO rules
app.get('/api/check-url', (req: Request, res: Response) => {
  const target = req.query.url as string;
  if (!target) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  const result = isAdOrTracker(target);
  return res.json(result);
});

// Endpoint: Suggestions for search engines
app.get('/api/suggest', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const engine = (req.query.engine as string) || 'google';
  if (!query || query.trim().length === 0) {
    return res.json([]);
  }

  try {
    let suggestUrl = '';
    if (engine === 'duckduckgo') {
      suggestUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
      const response = await fetch(suggestUrl, { signal: AbortSignal.timeout(2000) });
      const data = await response.json();
      return res.json(Array.isArray(data) && Array.isArray(data[1]) ? data[1].slice(0, 7) : []);
    } else if (engine === 'bing') {
      suggestUrl = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`;
      const response = await fetch(suggestUrl, { signal: AbortSignal.timeout(2000) });
      const data = await response.json();
      return res.json(Array.isArray(data) && Array.isArray(data[1]) ? data[1].slice(0, 7) : []);
    } else {
      // Default: Google suggestions
      suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
      const response = await fetch(suggestUrl, { signal: AbortSignal.timeout(2000) });
      const data = await response.json();
      return res.json(Array.isArray(data) && Array.isArray(data[1]) ? data[1].slice(0, 7) : []);
    }
  } catch {
    return res.json([]);
  }
});

// Endpoint: Proxy browsing with Gecko User-Agent and uBlock Origin filtering
app.get('/api/proxy', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  const ublockEnabled = req.query.ubo !== '0';

  if (!targetUrl) {
    return res.status(400).send('Missing target URL');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl.startsWith('http://') || targetUrl.startsWith('https://') ? targetUrl : `https://${targetUrl}`);
  } catch {
    return res.status(400).send('Invalid target URL');
  }

  // uBO Filter Check
  if (ublockEnabled) {
    const filterCheck = isAdOrTracker(parsedUrl.href);
    if (filterCheck.blocked) {
      res.setHeader('X-Quantum-Blocked-By', 'uBlockOrigin');
      res.setHeader('X-Quantum-Rule', filterCheck.pattern || 'ad-tracker');
      // If image or script requested, return empty 204 or transparent 1x1 gif
      if (req.headers.accept?.includes('image/')) {
        const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.setHeader('Content-Type', 'image/gif');
        return res.status(200).send(transparentGif);
      }
      return res.status(204).end();
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
      'Accept': req.headers.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    const upstreamResponse = await fetch(parsedUrl.href, {
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    // Forward status code
    res.status(upstreamResponse.status);

    // Copy safe headers
    const contentType = upstreamResponse.headers.get('content-type') || 'text/html';
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Quantum-Origin-Url', upstreamResponse.url);

    // If it's an HTML document, rewrite it to work nicely inside Quantum Browser
    if (contentType.includes('text/html')) {
      let html = await upstreamResponse.text();

      // If this is a Google reCAPTCHA or security challenge page, do not inject scripts or cosmetic rules
      if (isGoogleRecaptchaResource(upstreamResponse.url) || upstreamResponse.url.includes('/sorry/')) {
        return res.send(html);
      }

      // Ensure <base> tag points to original URL for relative assets
      const baseTag = `<base href="${upstreamResponse.url}">`;
      
      // Client-side script injected to bridge Quantum Browser
      const clientBridge = `
        <style>${ublockEnabled ? UBLOCK_COSMETIC_CSS : ''}</style>
        <script>
          (function() {
            // Quantum Browser In-Page Client Bridge
            window.__QUANTUM_BROWSER__ = {
              version: '1.0.0',
              engine: 'Mozilla Gecko/135.0',
              uBlockOrigin: ${ublockEnabled ? 'true' : 'false'},
              originUrl: "${upstreamResponse.url}"
            };

            // Intercept link clicks so navigation notifies Quantum Browser parent
            document.addEventListener('click', function(e) {
              var target = e.target.closest('a');
              if (target && target.href && !target.href.startsWith('javascript:')) {
                e.preventDefault();
                window.parent.postMessage({
                  type: 'QUANTUM_NAVIGATE',
                  url: target.href
                }, '*');
              }
            }, true);

            // Notify parent of title changes
            var observer = new MutationObserver(function() {
              window.parent.postMessage({
                type: 'QUANTUM_PAGE_INFO',
                title: document.title,
                url: window.location.href
              }, '*');
            });
            if (document.querySelector('title')) {
              observer.observe(document.querySelector('title'), { subtree: true, characterData: true, childList: true });
            }

            // Initial notify
            window.addEventListener('DOMContentLoaded', function() {
              window.parent.postMessage({
                type: 'QUANTUM_PAGE_LOADED',
                title: document.title || "${parsedUrl.hostname}",
                url: "${upstreamResponse.url}",
                favicon: (document.querySelector("link[rel*='icon']") || {}).href || "${parsedUrl.origin}/favicon.ico"
              }, '*');
            });
          })();
        </script>
      `;

      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}${clientBridge}`);
      } else if (html.includes('<html>')) {
        html = html.replace('<html>', `<html><head>${baseTag}${clientBridge}</head>`);
      } else {
        html = `${baseTag}${clientBridge}${html}`;
      }

      return res.send(html);
    } else {
      // Stream buffer for images, styles, scripts, binaries
      const arrayBuffer = await upstreamResponse.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.setHeader('Content-Type', 'text/html');
    return res.status(502).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quantum Browser - Connection Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #0f0728;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            background: #1e1035;
            border: 1px solid #7c3aed44;
            border-radius: 16px;
            padding: 32px;
            max-width: 520px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            text-align: center;
          }
          .icon {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #3b0764;
            color: #c084fc;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-bottom: 16px;
          }
          h2 { margin: 0 0 12px; color: #e9d5ff; font-size: 22px; }
          p { color: #a5b4fc; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
          .url { background: #2e1065; padding: 6px 12px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all; color: #d8b4fe; margin-bottom: 20px; display: inline-block; }
          .retry-btn {
            background: #7c3aed;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }
          .retry-btn:hover { background: #9333ea; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">⚠️</div>
          <h2>Unable to Connect</h2>
          <div class="url">${targetUrl}</div>
          <p>Quantum Browser (Gecko Engine) could not establish a secure connection to the specified address. The host might be unreachable or blocking direct proxy requests.</p>
          <p style="font-size: 12px; color: #94a3b8;">Diagnostic detail: ${errorMsg}</p>
          <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
      </html>
    `);
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Quantum Browser Server] Running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Quantum Browser Server] Startup failed:', err);
});
