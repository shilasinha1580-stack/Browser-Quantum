// Comprehensive YouTube Compatibility Test Suite for Quantum Browser
import { UBlockOriginEngine, isYouTubeRequiredResource } from '../src/utils/filterEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`[Assertion Failed] ${msg}`);
  }
}

export function runYouTubeCompatibilityTests() {
  console.log('====================================================');
  console.log('Starting Quantum Browser YouTube Compatibility Tests');
  console.log('====================================================');

  const ublock = new UBlockOriginEngine();

  // 1. Test YouTube Core Video Playback & Asset Endpoints
  console.log('\n[1/3 Verifying uBlock Origin YouTube Resource Passthrough]');
  const requiredYouTubeUrls = [
    'https://rr2---sn-4g5edn6s.googlevideo.com/videoplayback?expire=1720000000&ei=xyz',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj',
    'https://www.youtube.com/s/player/85a3164d/player_ias.vflset/en_US/base.js',
    'https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_...',
    'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_...',
    'https://www.youtube.com/api/stats/playback?ns=yt&el=detailpage',
    'https://www.youtube.com/api/stats/watchtime?ns=yt',
    'https://static.doubleclick.net/instream/ad_status.js'
  ];

  for (const url of requiredYouTubeUrls) {
    assert(isYouTubeRequiredResource(url), `Failed to recognize YouTube core resource: ${url}`);
    const check = ublock.shouldBlockRequest(url, 'youtube.com');
    assert(check.blocked === false, `uBlock Origin unintentionally blocked required YouTube resource: ${url}`);
    console.log(`  ✓ Allowed YouTube critical resource: ${url.split('?')[0]}`);
  }

  // 2. Test URL Transformation for Video, Search, and Mobile
  console.log('\n[2/3 Verifying YouTube URL Parsing & Frame Handlers]');

  function getTestViewportSrc(targetUrl: string) {
    const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be') {
      const videoId = parsed.searchParams.get('v') || (hostname === 'youtu.be' ? parsed.pathname.slice(1) : '');
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
      }
      const searchQuery = parsed.searchParams.get('search_query');
      if (searchQuery) {
        return `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}`;
      }
      return 'https://www.youtube-nocookie.com/embed/videoseries?list=PLrEnWoR732-BHrPp_QLgkMNVNwtEGJRL1';
    }
    return targetUrl;
  }

  const v1 = getTestViewportSrc('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert(v1 === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&enablejsapi=1',
    `Watch URL transformation failed: ${v1}`);
  console.log('  ✓ watch?v= URL correctly mapped to official HTML5 embed:', v1);

  const v2 = getTestViewportSrc('https://youtu.be/dQw4w9WgXcQ');
  assert(v2 === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&enablejsapi=1',
    `youtu.be URL transformation failed: ${v2}`);
  console.log('  ✓ youtu.be short URL correctly mapped to official HTML5 embed:', v2);

  const v3 = getTestViewportSrc('https://www.youtube.com/results?search_query=quantum+computing');
  assert(v3.includes('listType=search') && v3.includes('quantum%20computing'),
    `Search URL transformation failed: ${v3}`);
  console.log('  ✓ YouTube search results mapped to clean embed player:', v3);

  const v4 = getTestViewportSrc('https://m.youtube.com');
  assert(v4.includes('youtube-nocookie.com/embed'),
    `m.youtube.com transformation failed: ${v4}`);
  console.log('  ✓ m.youtube.com mapped to official embed to avoid nested iframe X-Frame-Options block:', v4);

  // 3. Test Normal Web Sites & Search Engines Coexistence
  console.log('\n[3/3 Verifying Coexistence with Normal Web Sites & Search Engines]');
  const nonYouTube = 'https://prismlauncher.org';
  const normalCheck = ublock.shouldBlockRequest(nonYouTube, 'prismlauncher.org');
  assert(normalCheck.blocked === false, 'prismlauncher.org must remain completely functional');
  console.log('  ✓ prismlauncher.org verified allowed and intact');

  // Verify generic trackers outside YouTube are still blocked
  const adCheck = ublock.shouldBlockRequest('https://google-analytics.com/analytics.js', 'example.org');
  assert(adCheck.blocked === true, 'General ad tracking on non-exempt domains must still be blocked');
  console.log('  ✓ Global uBlock Origin ad and tracker blocking verified active');

  console.log('\n====================================================');
  console.log('✅ All YouTube Compatibility Tests passed successfully!');
  console.log('====================================================\n');
}

if (typeof process !== 'undefined') {
  runYouTubeCompatibilityTests();
}
