// Unit tests for Quantum Browser Smart URL and Search input parser
import { parseAddressInput } from '../src/utils/searchEngines';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Test failed: ${msg}`);
  }
}

export function runUrlParserTests() {
  console.log('[Test] Running URL and Search Parser tests...');

  // 1. Direct domain should be parsed as https URL
  const res1 = parseAddressInput('example.com', 'google');
  assert(res1.targetUrl === 'https://example.com', 'Failed to parse example.com as https URL');
  assert(res1.isInternal === false, 'Internal flag wrongly set for example.com');

  // 2. Search query should be encoded with selected search engine (Google default)
  const res2 = parseAddressInput('mozilla gecko engine specs', 'google');
  assert(res2.targetUrl.startsWith('https://www.google.com/search?q='), 'Failed to route query to Google');

  // 3. DuckDuckGo search engine query
  const res3 = parseAddressInput('quantum privacy browser', 'duckduckgo');
  assert(res3.targetUrl.startsWith('https://duckduckgo.com/?q='), 'Failed to route query to DuckDuckGo');

  // 4. Internal quantum: page
  const res4 = parseAddressInput('quantum:settings');
  assert(res4.isInternal === true, 'Failed to identify quantum:settings as internal');

  // 5. Aliased about: page
  const res5 = parseAddressInput('about:blank');
  assert(res5.targetUrl === 'quantum:newtab', 'Failed to normalize about:blank to quantum:newtab');

  console.log('[Test] All URL parser tests passed successfully! ✅');
}

// Run if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('url-parser')) {
  runUrlParserTests();
}
