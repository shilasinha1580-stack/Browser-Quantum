# Building Quantum Browser

This document outlines how to build Quantum Browser across all officially supported targets.

---

## Target Platforms

| Platform | Target Architecture | Engine | Artifact |
|---|---|---|---|
| Android | ARM64 (`arm64-v8a`) | Mozilla GeckoView | `.apk` |
| Linux | 64-bit (`x86_64`) | Mozilla Gecko LibXUL | `.deb`, `.tar.gz` |
| Windows | 32-bit (`x86`) & 64-bit (`x86_64`) | Mozilla Gecko LibXUL | NSIS Installer `.exe` |

---

## 1. Android ARM64 Build

### Prerequisites
- JDK 17+ (e.g. Eclipse Temurin or OpenJDK)
- Android SDK (API Level 35, NDK 26+)
- Gradle 8.5+

### Build Steps
\`\`\`bash
cd android
chmod +x gradlew
./gradlew assembleArm64Release
\`\`\`
The generated APK will be located in:
\`android/app/build/outputs/apk/release/quantum-browser-arm64-release.apk\`

---

## 2. Linux 64-bit Debian Package (.deb)

### Prerequisites
\`\`\`bash
sudo apt-get update
sudo apt-get install -y build-essential dpkg-dev debhelper libxul-dev
\`\`\`

### Build Steps
\`\`\`bash
cd desktop/linux
dpkg-buildpackage -us -uc -b
\`\`\`
The generated package: \`../quantum-browser_1.0.0_amd64.deb\`

---

## 3. Windows 32-bit & 64-bit (NSIS)

### Prerequisites
- Nullsoft Scriptable Install System (NSIS 3.0+)
- Visual C++ Redistributable runtime

### Build Steps
\`\`\`cmd
cd desktop\\windows
makensis /DARCH=x64 quantum-browser.nsi
makensis /DARCH=x86 quantum-browser.nsi
\`\`\`
Installers will be placed in \`desktop\\windows\\output\\\`.

---

## 4. Web Workspace / Development Server

\`\`\`bash
npm install
npm run dev
\`\`\`
The browser workspace runs on \`http://localhost:3000\`.
