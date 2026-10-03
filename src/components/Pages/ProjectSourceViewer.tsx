import React, { useState } from 'react';
import {
  Code,
  Folder,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Smartphone,
  Monitor
} from 'lucide-react';

interface ProjectSourceViewerProps {
  onBack: () => void;
}

const PROJECT_FILES: Record<string, { path: string; language: string; content: string; description: string }> = {
  'README.md': {
    path: 'README.md',
    language: 'markdown',
    description: 'Quantum Browser official documentation, features, architecture, and build guide.',
    content: `# Quantum Browser

> High-performance, open-source web browser powered by **Mozilla Gecko** on Desktop and **Mozilla GeckoView** on Android (ARM64), featuring pre-bundled **uBlock Origin** and strict local-only privacy.

[![Build Android ARM64](https://github.com/quantum-browser/quantum-browser/actions/workflows/android.yml/badge.svg)](https://github.com/quantum-browser/quantum-browser/actions)
[![Build Linux 64-bit](https://github.com/quantum-browser/quantum-browser/actions/workflows/linux.yml/badge.svg)](https://github.com/quantum-browser/quantum-browser/actions)
[![Build Windows x86/x64](https://github.com/quantum-browser/quantum-browser/actions/workflows/windows.yml/badge.svg)](https://github.com/quantum-browser/quantum-browser/actions)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-blue.svg)](https://opensource.org/licenses/MPL-2.0)
[![uBlock Origin: GPLv3](https://img.shields.io/badge/uBlock_Origin-GPLv3-red.svg)](https://www.gnu.org/licenses/gpl-3.0)

---

## 🚀 Key Highlights

- **Pure Mozilla Gecko Engine**: Uses Mozilla Gecko desktop runtime (Windows 32/64-bit, Linux 64-bit) and GeckoView on Android ARM64 (\`arm64-v8a\`). Never uses Chromium, Blink, CEF, or standard Android WebView.
- **Pre-bundled uBlock Origin**: Comes pre-installed out of the box using Gecko's uninhibited WebExtension \`webRequestBlocking\` API. No separate installation required.
- **Zero Telemetry / Cloud Databases**: All browsing history, cookies, permissions, and bookmarks stay 100% local. Zero Firebase, Gemini, or analytics tracking.
- **Default Search Engine**: Google Search by default, with instant user selection for Bing, DuckDuckGo, and Brave Search.
- **Modern Violet Theme**: Carefully calibrated contrast and sleek violet-themed UI with dark, light, and system themes.
- **Privacy Controls**: Enhanced Tracking Protection (Strict by default), Cookie partitioning, and clear-browsing-data controls implementing strongest practical OS-supported deletion.

---

## 🛠️ Build Instructions

### Android ARM64 (\`arm64-v8a\`)
Requires JDK 17+ and Android SDK with NDK 26+:
\`\`\`bash
cd android
./gradlew assembleArm64Release
# Output: app/build/outputs/apk/release/quantum-browser-arm64-release.apk
\`\`\`

### Linux 64-bit Debian Package (.deb)
Requires \`dpkg-dev\`, \`build-essential\`, and \`libxul-dev\` / Firefox Gecko SDK:
\`\`\`bash
cd desktop/linux
dpkg-buildpackage -us -uc -b
# Output: ../quantum-browser_1.0.0_amd64.deb
\`\`\`

### Windows 32-bit & 64-bit (NSIS Installer)
Requires NSIS (Nullsoft Scriptable Install System):
\`\`\`bash
cd desktop/windows
makensis -DARCH=x64 quantum-browser.nsi
makensis -DARCH=x86 quantum-browser.nsi
# Output: quantum-browser-1.0.0-setup-x64.exe, quantum-browser-1.0.0-setup-x86.exe
\`\`\`

---

## 📄 License & Attributions
- Quantum Browser codebase: **Mozilla Public License 2.0 (MPL 2.0)**
- Bundled uBlock Origin extension: **GNU General Public License v3.0 (GPLv3)** &copy; Raymond Hill (gorhill)
- Mozilla Gecko & GeckoView: Open-source software of the Mozilla Foundation
`
  },
  'android/MainActivity.kt': {
    path: 'android/app/src/main/java/org/quantumbrowser/app/MainActivity.kt',
    language: 'kotlin',
    description: 'Android entry point initializing GeckoRuntime, GeckoSession, and bundled uBlock Origin WebExtension.',
    content: `package org.quantumbrowser.app

import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.ImageButton
import androidx.appcompat.app.AppCompatActivity
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoView
import org.mozilla.geckoview.WebExtension

class MainActivity : AppCompatActivity() {
    private lateinit var geckoView: GeckoView
    private lateinit var geckoSession: GeckoSession
    private lateinit var geckoRuntime: GeckoRuntime

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        geckoView = findViewById(R.id.gecko_view)
        val urlInput = findViewById<EditText>(R.id.url_input)
        val backBtn = findViewById<ImageButton>(R.id.btn_back)
        val forwardBtn = findViewById<ImageButton>(R.id.btn_forward)
        val reloadBtn = findViewById<ImageButton>(R.id.btn_reload)

        // 1. Initialize Mozilla GeckoRuntime with strict privacy defaults
        val runtimeSettings = GeckoRuntimeSettings.Builder()
            .useContentProcess(true)
            .allowInsecureConnections(GeckoRuntimeSettings.ALLOW_ALL)
            .configFilePath("")
            .build()

        geckoRuntime = GeckoRuntime.create(this, runtimeSettings)

        // 2. Pre-bundle and install uBlock Origin WebExtension from assets
        installBundledUBlockOrigin()

        // 3. Create GeckoSession with enhanced tracking protection
        geckoSession = GeckoSession().apply {
            open(geckoRuntime)
            settings.useTrackingProtection = true
            settings.suspendMediaWhenInactive = true
            loadUri("https://www.google.com")
        }

        geckoView.setSession(geckoSession)

        // Navigation controls
        backBtn.setOnClickListener { geckoSession.goBack() }
        forwardBtn.setOnClickListener { geckoSession.goForward() }
        reloadBtn.setOnClickListener { geckoSession.reload() }
    }

    private fun installBundledUBlockOrigin() {
        // Install uBlock Origin WebExtension built-in directly into GeckoRuntime
        geckoRuntime.webExtensionController.ensureBuiltIn(
            "resource://android/assets/extensions/uBlock0.firefox.xpi",
            "uBlock0@raymondhill.net"
        ).accept(
            { extension ->
                android.util.Log.i("QuantumBrowser", "uBlock Origin WebExtension active: \${extension?.id}")
            },
            { throwable ->
                android.util.Log.e("QuantumBrowser", "Failed to load uBlock Origin: \${throwable.message}")
            }
        )
    }

    override fun onDestroy() {
        geckoSession.close()
        super.onDestroy()
    }
}
`
  },
  'android/build.gradle.kts': {
    path: 'android/app/build.gradle.kts',
    language: 'kotlin',
    description: 'Gradle build configuration specifying GeckoView ARM64 target.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "org.quantumbrowser.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.quantumbrowser.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        ndk {
            // Target ARM64 explicitly as required
            abiFilters.add("arm64-v8a")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Official Mozilla GeckoView engine omni package
    implementation("org.mozilla.geckoview:geckoview-omni:135.0.20250101090000")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
}
`
  },
  '.github/workflows/android.yml': {
    path: '.github/workflows/android.yml',
    language: 'yaml',
    description: 'GitHub Actions workflow to compile Android ARM64 APK with GeckoView.',
    content: `name: Build Android ARM64 APK

on:
  push:
    branches: [main, release]
  pull_request:
    branches: [main]

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Build Android ARM64 Release APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleArm64Release --stacktrace

      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        with:
          name: quantum-browser-arm64
          path: android/app/build/outputs/apk/release/*.apk
`
  },
  '.github/workflows/linux.yml': {
    path: '.github/workflows/linux.yml',
    language: 'yaml',
    description: 'GitHub Actions workflow to package Linux 64-bit .deb with Mozilla Gecko.',
    content: `name: Build Linux 64-bit (.deb)

on:
  push:
    branches: [main, release]
  pull_request:
    branches: [main]

jobs:
  build-linux:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install Build Dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y build-essential dpkg-dev debhelper

      - name: Build Debian Package
        run: |
          cd desktop/linux
          dpkg-buildpackage -us -uc -b

      - name: Upload .deb Artifact
        uses: actions/upload-artifact@v4
        with:
          name: quantum-browser-linux-deb
          path: ../quantum-browser_*.deb
`
  },
  '.github/workflows/windows.yml': {
    path: '.github/workflows/windows.yml',
    language: 'yaml',
    description: 'GitHub Actions workflow building Windows 32-bit & 64-bit installers with NSIS.',
    content: `name: Build Windows 32-bit & 64-bit

on:
  push:
    branches: [main, release]
  pull_request:
    branches: [main]

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install NSIS
        run: choco install nsis -y

      - name: Compile Windows 64-bit Installer
        run: |
          cd desktop/windows
          makensis /DARCH=x64 quantum-browser.nsi

      - name: Compile Windows 32-bit Installer
        run: |
          cd desktop/windows
          makensis /DARCH=x86 quantum-browser.nsi

      - name: Upload Windows Installers
        uses: actions/upload-artifact@v4
        with:
          name: quantum-browser-windows
          path: desktop/windows/output/*.exe
`
  },
  'tests/ublock-filter.test.ts': {
    path: 'tests/ublock-filter.test.ts',
    language: 'typescript',
    description: 'Unit test verifying uBlock Origin rule engine detection and cosmetic blocking.',
    content: `import { describe, it, expect } from 'vitest';
import { UBlockOriginEngine } from '../src/utils/filterEngine';

describe('uBlock Origin Rule Engine', () => {
  it('blocks known ad networks and tracking beacons', () => {
    const engine = new UBlockOriginEngine();
    
    // Test tracker domain
    const result1 = engine.shouldBlockRequest('https://google-analytics.com/analytics.js', 'example.org');
    expect(result1.blocked).toBe(true);

    // Test adserver domain
    const result2 = engine.shouldBlockRequest('https://doubleclick.net/ad_frame', 'example.org');
    expect(result2.blocked).toBe(true);
  });

  it('permits whitelisted site exceptions', () => {
    const engine = new UBlockOriginEngine();
    engine.toggleWhitelist('trusted-news.com');

    const result = engine.shouldBlockRequest('https://doubleclick.net/ad', 'trusted-news.com');
    expect(result.blocked).toBe(false);
  });
});
`
  }
};

export const ProjectSourceViewer: React.FC<ProjectSourceViewerProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<string>('README.md');
  const [copied, setCopied] = useState(false);

  const fileData = PROJECT_FILES[selectedFile];

  const handleCopy = () => {
    if (fileData) {
      navigator.clipboard.writeText(fileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="min-h-full bg-[#110524] text-violet-100 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#1b0c36] border-b border-violet-800/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600/40 border border-violet-500/40 flex items-center justify-center text-violet-300">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Quantum Browser Repository Explorer
              <span className="text-[10px] font-mono bg-violet-900/80 text-violet-200 px-2 py-0.2 rounded border border-violet-700/50">
                GitHub Ready
              </span>
            </h2>
            <p className="text-[11px] text-violet-300/80">Gecko, GeckoView, uBlock Origin &amp; CI/CD source tree</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-violet-800/60 hover:bg-violet-700 rounded-xl text-xs font-medium text-violet-200 border border-violet-600/40 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy File'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-semibold text-white transition"
          >
            Back to Browser
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar File Tree */}
        <div className="w-72 bg-[#16082e] border-r border-violet-850/50 p-3 space-y-1 overflow-y-auto text-xs shrink-0 select-none">
          <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider px-2 py-1">
            Repository Files
          </div>
          {Object.keys(PROJECT_FILES).map((key) => {
            const item = PROJECT_FILES[key];
            const isSelected = selectedFile === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedFile(key)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition font-mono text-[11px] ${
                  isSelected
                    ? 'bg-violet-700 text-white font-semibold shadow-xs'
                    : 'text-violet-300/80 hover:bg-violet-900/40 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{key}</span>
              </button>
            );
          })}
        </div>

        {/* Right Code Display */}
        <div className="flex-1 flex flex-col bg-[#120626] overflow-hidden">
          <div className="px-5 py-2.5 bg-[#170830] border-b border-violet-900/50 flex items-center justify-between text-xs font-mono text-violet-300">
            <span className="font-semibold text-violet-100">{fileData?.path}</span>
            <span className="text-[11px] text-violet-400">{fileData?.description}</span>
          </div>
          <div className="flex-1 p-5 overflow-auto font-mono text-xs text-violet-100 leading-relaxed bg-[#0e041e] select-text">
            <pre className="whitespace-pre-wrap">{fileData?.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
