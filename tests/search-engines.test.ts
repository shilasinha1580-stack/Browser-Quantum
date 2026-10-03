// Automated tests for Google, Bing, DuckDuckGo, and Brave Search integrations in Quantum Browser
import { parseAddressInput, formatDisplayUrl, SEARCH_ENGINES } from '../src/utils/searchEngines';
import { UBlockOriginEngine, isGoogleRecaptchaResource } from '../src/utils/filterEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`[Assertion Failed] ${msg}`);
  }
}

export function runSearchEngineTests() {
  console.log('====================================================');
  console.log('Starting Quantum Browser Search Engine Test Suite');
  console.log('====================================================');

  // 1. Google Search Test
  console.log('\n[1/4 Testing Google Search Integration]');
  const googleRes = parseAddressInput('quantum physics gecko', 'google');
  assert(googleRes.targetUrl === 'https://www.google.com/search?q=quantum%20physics%20gecko',
    `Google search URL mismatch: ${googleRes.targetUrl}`);
  assert(googleRes.isInternal === false, 'Google search must not be marked internal');
  
  const googleDisplay = formatDisplayUrl(googleRes.targetUrl);
  assert(!googleDisplay.includes('igu='), 'Google display URL must not expose internal frame compatibility params');
  console.log('  ✓ Google search URL generated properly:', googleRes.targetUrl);
  console.log('  ✓ Google address bar display formatted clean:', googleDisplay);

  // Test Google reCAPTCHA uBlock Origin compatibility
  console.log('  Testing Google reCAPTCHA uBlock Origin compatibility...');
  const ublock = new UBlockOriginEngine();
  const recaptchaUrls = [
    'https://www.google.com/recaptcha/enterprise.js',
    'https://www.google.com/recaptcha/api.js',
    'https://www.gstatic.com/recaptcha/releases/1234/recaptcha__en.js',
    'https://www.recaptcha.net/recaptcha/api2/anchor',
    'https://www.google.com/recaptcha/api2/bframe',
    'https://www.google.com/sorry/index?continue=https://www.google.com/search?q=test'
  ];

  for (const url of recaptchaUrls) {
    assert(isGoogleRecaptchaResource(url), `Failed to recognize reCAPTCHA resource: ${url}`);
    const blockCheck = ublock.shouldBlockRequest(url, 'google.com');
    assert(blockCheck.blocked === false, `uBlock Origin unintentionally blocked required Google reCAPTCHA resource: ${url}`);
    console.log(`    ✓ Verified allowed: ${url.split('?')[0]}`);
  }
  console.log('  ✓ Google reCAPTCHA compatibility exemption verified: Zero security checks blocked.');

  // 2. Bing Search Test
  console.log('\n[2/4 Testing Bing Search Integration]');
  const bingRes = parseAddressInput('mozilla gecko android', 'bing');
  assert(bingRes.targetUrl === 'https://www.bing.com/search?q=mozilla%20gecko%20android',
    `Bing search URL mismatch: ${bingRes.targetUrl}`);
  const bingDisplay = formatDisplayUrl(bingRes.targetUrl);
  assert(bingDisplay.includes('bing.com/search?q='), `Bing display URL incorrect: ${bingDisplay}`);
  console.log('  ✓ Bing search URL generated properly:', bingRes.targetUrl);
  console.log('  ✓ Bing display formatted properly:', bingDisplay);

  // 3. DuckDuckGo Search Test
  console.log('\n[3/4 Testing DuckDuckGo Search Integration]');
  const ddgRes = parseAddressInput('privacy browser without telemetry', 'duckduckgo');
  assert(ddgRes.targetUrl === 'https://duckduckgo.com/?q=privacy%20browser%20without%20telemetry',
    `DuckDuckGo search URL mismatch: ${ddgRes.targetUrl}`);
  const ddgDisplay = formatDisplayUrl(ddgRes.targetUrl);
  assert(ddgDisplay.includes('duckduckgo.com/?q='), `DuckDuckGo display URL incorrect: ${ddgDisplay}`);
  console.log('  ✓ DuckDuckGo search URL generated properly:', ddgRes.targetUrl);
  console.log('  ✓ DuckDuckGo display formatted properly:', ddgDisplay);

  // 4. Brave Search Test
  console.log('\n[4/4 Testing Brave Search Integration]');
  const braveRes = parseAddressInput('quantum browser source code', 'brave');
  assert(braveRes.targetUrl === 'https://search.brave.com/search?q=quantum%20browser%20source%20code',
    `Brave search URL mismatch: ${braveRes.targetUrl}`);
  const braveDisplay = formatDisplayUrl(braveRes.targetUrl);
  assert(braveDisplay.includes('search.brave.com/search?q='), `Brave display URL incorrect: ${braveDisplay}`);
  console.log('  ✓ Brave search URL generated properly:', braveRes.targetUrl);
  console.log('  ✓ Brave display formatted properly:', braveDisplay);

  console.log('\n====================================================');
  console.log('✅ All 4 Search Engine tests passed successfully!');
  console.log('====================================================\n');
}

// Run immediately if executed via node / tsx
if (typeof process !== 'undefined') {
  runSearchEngineTests();
}
