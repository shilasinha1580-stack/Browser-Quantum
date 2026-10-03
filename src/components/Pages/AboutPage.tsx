import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Smartphone,
  Monitor,
  Terminal,
  FileText,
  ExternalLink,
  Code,
  Sparkles,
  Layers,
  HeartHandshake
} from 'lucide-react';

interface AboutPageProps {
  onOpenSourceViewer: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenSourceViewer }) => {
  return (
    <div className="min-h-full bg-[#130728] text-violet-100 p-6 md:p-10 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#230f4a] via-[#1c0c3b] to-[#120626] border border-violet-600/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl blur-md opacity-50" />
            <img
              src="/logo.png"
              alt="Quantum Browser Logo"
              className="relative w-24 h-24 rounded-2xl object-cover shadow-2xl border-2 border-violet-400/50 p-1.5 bg-[#170a2c]"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Quantum Browser</h1>
              <span className="text-xs font-mono bg-violet-800/80 text-violet-200 px-2.5 py-0.5 rounded-full border border-violet-600/60 font-semibold">
                v1.0.0 (Official)
              </span>
            </div>
            <p className="text-xs text-violet-300/90 leading-relaxed max-w-xl">
              A high-performance, open-source web browser built on <strong>Mozilla Gecko</strong> for desktop environments and <strong>GeckoView</strong> on Android ARM64. Features built-in, uninhibited uBlock Origin content filtering and strict local-only privacy.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={onOpenSourceViewer}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold shadow-md transition flex items-center gap-1.5"
              >
                <Code className="w-4 h-4" />
                View Native Source &amp; Workflows
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-violet-900/40 hover:bg-violet-800 border border-violet-700/50 text-violet-200 rounded-xl font-semibold transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-violet-400" />
                GitHub Repository
              </a>
            </div>
          </div>
        </div>

        {/* Technical Architecture Specs */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-violet-300/90 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            Core Engines &amp; Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Desktop Gecko */}
            <div className="p-5 bg-[#1c0d38] border border-violet-800/40 rounded-2xl space-y-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-violet-900/80 flex items-center justify-center text-violet-300">
                <Monitor className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Mozilla Gecko (Desktop)</h3>
              <p className="text-violet-300/80 leading-relaxed text-[11px]">
                Desktop engine compiled with LibXUL and Rust components. Zero Chromium, Blink, or CEF dependencies.
              </p>
              <div className="pt-2 text-[10px] font-mono text-violet-400">
                Targets: Linux x86_64 (.deb), Windows x86 &amp; x64 (NSIS)
              </div>
            </div>

            {/* Android GeckoView */}
            <div className="p-5 bg-[#1c0d38] border border-violet-800/40 rounded-2xl space-y-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-900/80 flex items-center justify-center text-fuchsia-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Mozilla GeckoView (Android)</h3>
              <p className="text-violet-300/80 leading-relaxed text-[11px]">
                Full GeckoView runtime on Android ARM64 (arm64-v8a). Replaces standard Android WebView with true Gecko rendering.
              </p>
              <div className="pt-2 text-[10px] font-mono text-fuchsia-400">
                Targets: Android 8.0+ ARM64 (arm64-v8a)
              </div>
            </div>

            {/* uBlock Origin WebExtension */}
            <div className="p-5 bg-[#1c0d38] border border-violet-800/40 rounded-2xl space-y-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-indigo-900/80 flex items-center justify-center text-indigo-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">uBlock Origin Bundled</h3>
              <p className="text-violet-300/80 leading-relaxed text-[11px]">
                Pre-installed WebExtension using Gecko's full <code>webRequestBlocking</code> system. No separate download or install required.
              </p>
              <div className="pt-2 text-[10px] font-mono text-indigo-400">
                License: GPLv3 (Raymond Hill)
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Philosophy & Storage Deletion Notice */}
        <div className="bg-[#1c0d38] border border-violet-800/40 rounded-2xl p-6 space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-violet-400" />
            Local Privacy Standard &amp; Storage Guarantee
          </h2>
          <p className="text-violet-300/90">
            Quantum Browser is engineered with strict local privacy defaults. We operate zero cloud databases, zero telemetry services, zero behavioral tracking, and zero artificial intelligence assistants.
          </p>
          <div className="p-3.5 bg-violet-950/60 border border-violet-800/40 rounded-xl text-[11px] text-violet-300/90">
            <strong className="text-white">OS-Level Sanitization Notice:</strong> Quantum Browser implements the strongest practical OS-supported deletion (truncating SQLite records, unlinking filesystem caches, zeroing temporary profile memory). We do not make misleading claims that physical raw flash memory bytes are irrevocably scrubbed on modern SSDs, where hardware wear-leveling controllers prevent direct sector overwriting without full-disk encryption.
          </div>
        </div>

        {/* Third-Party Notices & Licenses */}
        <div className="p-6 bg-[#16082c] border border-violet-900/50 rounded-2xl text-xs space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">
            Third-Party Notices &amp; Licensing
          </h3>
          <div className="text-[11px] text-violet-400 space-y-2 leading-relaxed">
            <p>
              Quantum Browser source code is licensed under the <strong>Mozilla Public License Version 2.0 (MPL 2.0)</strong>.
            </p>
            <p>
              uBlock Origin is copyright &copy; 2014-present Raymond Hill (gorhill) and licensed under the <strong>GNU General Public License Version 3.0 (GPLv3)</strong>. The bundled extension files remain under their respective upstream licenses.
            </p>
            <p>
              Mozilla Gecko and GeckoView are trademarks and open-source software of the Mozilla Foundation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
