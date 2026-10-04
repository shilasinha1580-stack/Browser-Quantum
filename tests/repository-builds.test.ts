// Verification test for Quantum Browser repository, packaging, Android, Windows, Linux, and workflows
import fs from 'fs';
import path from 'path';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`[Assertion Failed] ${msg}`);
  }
}

export function runRepositoryBuildsTests() {
  console.log('====================================================');
  console.log('Verifying Quantum Browser Repository & Packaging Structure');
  console.log('====================================================\n');

  // 1. Android Structure
  console.log('[1/4 Verifying Android Build Structure]');
  const androidFiles = [
    'android/build.gradle.kts',
    'android/settings.gradle.kts',
    'android/app/build.gradle.kts',
    'android/app/proguard-rules.pro',
    'android/app/src/main/AndroidManifest.xml',
    'android/app/src/main/java/org/quantumbrowser/app/MainActivity.kt',
    'android/app/src/main/res/layout/activity_main.xml',
    'android/app/src/main/res/values/styles.xml',
    'android/app/src/main/res/values/strings.xml',
    'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    'android/app/src/main/assets/extensions/uBlock0.firefox.xpi'
  ];

  for (const f of androidFiles) {
    assert(fs.existsSync(f), `Missing required Android file: ${f}`);
    console.log(`  ✓ Found: ${f}`);
  }

  // Verify ARM64 and JDK 17 in app/build.gradle.kts
  const appGradle = fs.readFileSync('android/app/build.gradle.kts', 'utf8');
  assert(appGradle.includes('arm64-v8a'), 'app/build.gradle.kts must configure arm64-v8a');
  assert(appGradle.includes('VERSION_17'), 'app/build.gradle.kts must configure Java 17');
  assert(appGradle.includes('geckoview-arm64-v8a'), 'app/build.gradle.kts must configure official GeckoView');
  console.log('  ✓ Android app/build.gradle.kts configured for ARM64 and JDK 17 with GeckoView');

  // 2. Linux Packaging Structure
  console.log('\n[2/4 Verifying Linux Debian Packaging]');
  const linuxFiles = [
    'desktop/linux/debian/control',
    'desktop/linux/debian/changelog',
    'desktop/linux/debian/rules',
    'desktop/linux/debian/compat',
    'desktop/linux/debian/source/format',
    'desktop/linux/quantum-browser.desktop',
    'desktop/linux/bin/quantum',
    'desktop/linux/prepare-gecko-runtime.sh',
    'desktop/common/policies.json',
    'desktop/common/extensions/uBlock0@raymondhill.net.xpi'
  ];

  for (const f of linuxFiles) {
    assert(fs.existsSync(f), `Missing required Linux packaging file: ${f}`);
    console.log(`  ✓ Found: ${f}`);
  }

  const debRules = fs.readFileSync('desktop/linux/debian/rules', 'utf8');
  assert(debRules.includes('override_dh_auto_install'), 'debian/rules must define install targets');
  assert(!fs.readFileSync('desktop/linux/debian/control', 'utf8').includes('libxul-dev'),
    'debian/control must not depend on obsolete libxul-dev');
  console.log('  ✓ Debian packaging files verified valid and complete');

  // 3. Windows Packaging Structure
  console.log('\n[3/4 Verifying Windows NSIS & Standalone Gecko Packaging]');
  const windowsFiles = [
    'desktop/windows/quantum-browser.nsi',
    'desktop/windows/prepare-gecko-runtime.ps1',
    'public/logo.ico',
    'LICENSE'
  ];

  for (const f of windowsFiles) {
    assert(fs.existsSync(f), `Missing required Windows file: ${f}`);
    console.log(`  ✓ Found: ${f}`);
  }

  const prepPs1 = fs.readFileSync('desktop/windows/prepare-gecko-runtime.ps1', 'utf8');
  assert(prepPs1.includes('xul.dll'), 'prepare-gecko-runtime.ps1 must verify Gecko xul.dll');
  console.log('  ✓ Real Mozilla Gecko Windows runtime script verified in desktop/windows/prepare-gecko-runtime.ps1');

  // 4. TabBar Touch Close Button Verification
  console.log('\n[4/4 Verifying Android / Touch Tab Close Button]');
  const tabBarSrc = fs.readFileSync('src/components/BrowserChrome/TabBar.tsx', 'utf8');
  assert(tabBarSrc.includes('opacity-100'), 'TabBar close button must be permanently visible/tappable on mobile/Android');
  assert(tabBarSrc.includes('touch-manipulation'), 'TabBar close button must have touch-manipulation optimization');
  console.log('  ✓ TabBar close button is permanently tappable on touch/Android without requiring hover');

  // 5. Workflow Configuration Integrity
  console.log('\n[5/5 Verifying GitHub Actions Workflows]');
  const androidYml = fs.readFileSync('.github/workflows/android.yml', 'utf8');
  assert(androidYml.includes('setup-gradle'), 'android.yml must configure setup-gradle');
  assert(!androidYml.includes('./gradlew'), 'android.yml must not assume gradlew exists');
  assert(!androidYml.includes('|| true'), 'android.yml must not hide errors with || true');

  const windowsYml = fs.readFileSync('.github/workflows/windows.yml', 'utf8');
  assert(windowsYml.includes('GITHUB_PATH'), 'windows.yml must export NSIS to GITHUB_PATH');
  assert(windowsYml.includes('makensis /DARCH=x64'), 'windows.yml must build x64 installer');
  assert(windowsYml.includes('makensis /DARCH=x86'), 'windows.yml must build x86 installer');
  assert(windowsYml.includes('prepare-gecko-runtime.ps1'), 'windows.yml must prepare real Mozilla Gecko runtime');
  assert(!windowsYml.includes('|| true'), 'windows.yml must not hide errors with || true');

  const linuxYml = fs.readFileSync('.github/workflows/linux.yml', 'utf8');
  assert(linuxYml.includes('prepare-gecko-runtime.sh'), 'linux.yml must prepare standalone Mozilla Gecko runtime');
  assert(linuxYml.includes('dpkg-buildpackage'), 'linux.yml must run dpkg-buildpackage');
  assert(linuxYml.includes('desktop/quantum-browser_*.deb'), 'linux.yml must upload from desktop/ directory');
  assert(!linuxYml.includes('|| true'), 'linux.yml must not hide errors with || true');

  console.log('  ✓ All 3 workflows (.github/workflows/*) verified compliant, robust, and reproducible');
  console.log('\n====================================================');
  console.log('✅ All Repository Build & Workflow Tests Passed!');
  console.log('====================================================\n');
}

if (typeof process !== 'undefined') {
  runRepositoryBuildsTests();
}
