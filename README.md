# Quantum Browser

[![Build Android ARM64](https://github.com/quantum-browser/quantum-browser/actions/workflows/android.yml/badge.svg)](https://github.com/quantum-browser/quantum-browser/actions)
[![Build Linux 64-bit](https://github.com/quantum-browser/quantum-browser/actions/workflows/linux.yml/badge.svg)](https://github.com/quantum-browser/quantum-browser/actions)
[![Build Windows x86/x64](https://github.com/quantum-browser/quantum-browser/actions/workflows/windows.yml/badge.svg)](https://github.com/quantum-browser/quantum-browser/actions)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-blue.svg)](https://opensource.org/licenses/MPL-2.0)
[![uBlock Origin: GPLv3](https://img.shields.io/badge/uBlock_Origin-GPLv3-red.svg)](https://www.gnu.org/licenses/gpl-3.0)

**Quantum Browser** is an open-source, high-performance web browser engineered with Mozilla Gecko as the desktop browser engine and Mozilla GeckoView on Android. It deliberately avoids Chromium, Blink, CEF, and Android WebView in order to preserve web engine diversity and support true, uninhibited WebExtension content filtering.

Quantum Browser bundles the complete **uBlock Origin** extension out of the box using Gecko's native WebExtension system with zero external configuration required.

---

## 🌟 Architecture & Features

### 1. Engine & Platform Support
- **Desktop (Windows 32-bit & 64-bit, Linux 64-bit)**: Powered by **Mozilla Gecko** with LibXUL embedding.
- **Android ARM64 (`arm64-v8a`)**: Powered by **Mozilla GeckoView**, replacing standard Android WebView.
- **Rejection of Chromium/Blink/CEF**: Safeguards open web standards and prevents reliance on Manifest V3 limitations (`declarativeNetRequest` rule quotas).

### 2. Pre-bundled uBlock Origin
- Installed natively via Gecko's `webRequestBlocking` WebExtension API.
- Fully pre-bundled in the application package (`assets/extensions/uBlock0.firefox.xpi`).
- Full filtering capability: EasyList, EasyPrivacy, Peter Lowe's Ad Server List, and Malware Domain List.
- Cosmetic element hiding, per-site whitelist exceptions, custom rule syntax, and the real-time request Logger.

### 3. Normal Browser Capabilities
- **Multi-Tab System**: Tab pinning, tab audio muting, duplicate tab, private window/tab sessions.
- **Address & Smart Search Bar**: Real-time URL and search query parsing. Default search engine is Google, with instant switching to Bing, DuckDuckGo, and Brave Search.
- **Navigation Controls**: Back, Forward, Reload, Stop, Home, and Hard Reload.
- **Bookmarks & History**: Hierarchical folder organization, JSON/HTML export, search, and date-grouped history.
- **Download Manager**: Real-time speed calculations, progress, open/cancel handlers.
- **Find in Page**: Match counter, forward/backward jumping, match-case toggles.
- **Zoom Controls**: Range from 50% to 200% with instant 100% reset.
- **Site Permission Manager**: Granular origin-level controls for Geolocation, Camera, Microphone, Notifications, and Pop-ups.

### 4. Privacy Philosophy & Storage Deletion
- **100% Local Storage**: Zero Firebase, Gemini, telemetry, or remote telemetry databases.
- **Clear Browsing Data**: Implements strongest practical OS-supported deletion (SQLite record truncation, cache directory unlinking, ephemeral token wiping).
- **Honest Technical Standard**: Clearly notes that modern solid-state drives (SSDs) utilize wear-leveling controllers where individual raw NAND flash physical bytes cannot be guaranteed erased without full-disk encryption.

---

## 📦 Building from Source

Refer to [BUILDING.md](BUILDING.md) for detailed prerequisites.

### Android ARM64 (`arm64-v8a`)
\`\`\`bash
cd android
./gradlew assembleArm64Release
\`\`\`

### Linux 64-bit Debian Package (`.deb`)
\`\`\`bash
cd desktop/linux
dpkg-buildpackage -us -uc -b
\`\`\`

### Windows 32-bit & 64-bit (NSIS)
\`\`\`bash
cd desktop/windows
makensis -DARCH=x64 quantum-browser.nsi
makensis -DARCH=x86 quantum-browser.nsi
\`\`\`

---

## 📜 Licenses & Attributions
- Quantum Browser application code is licensed under the **Mozilla Public License 2.0 (MPL-2.0)**.
- Bundled uBlock Origin is copyright &copy; 2014-present Raymond Hill (gorhill) and licensed under the **GNU General Public License v3.0 (GPLv3)**.
- See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [LICENSE](LICENSE) for full details.
