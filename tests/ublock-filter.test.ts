// Unit tests for Quantum Browser uBlock Origin engine
import { UBlockOriginEngine } from '../src/utils/filterEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Test failed: ${msg}`);
  }
}

export function runUBlockTests() {
  const engine = new UBlockOriginEngine();
  console.log('[Test] Running uBlock Origin Filter Engine tests...');

  // 1. Should block ad tracker domain
  const res1 = engine.shouldBlockRequest('https://google-analytics.com/analytics.js', 'example.org');
  assert(res1.blocked === true, 'Failed to block google-analytics.com');

  // 2. Should block doubleclick
  const res2 = engine.shouldBlockRequest('https://ad.doubleclick.net/ad_frame', 'example.org');
  assert(res2.blocked === true, 'Failed to block doubleclick.net');

  // 3. Should allow whitelisted domain
  engine.toggleWhitelist('trusted-site.com');
  const res3 = engine.shouldBlockRequest('https://google-analytics.com/analytics.js', 'trusted-site.com');
  assert(res3.blocked === false, 'Did not respect site whitelist exception');

  // 4. Custom rule evaluation
  engine.updateSettings({ customRules: ['||mybadtracker.net^'] });
  const res4 = engine.shouldBlockRequest('https://mybadtracker.net/pixel.gif', 'example.org');
  assert(res4.blocked === true, 'Did not enforce custom adblock rule');

  console.log('[Test] All uBlock Origin tests passed successfully! ✅');
}

// Run if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('ublock-filter')) {
  runUBlockTests();
}
