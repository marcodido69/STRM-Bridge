import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Server,
  ShieldCheck,
  FileCode,
  Zap,
  ArrowRight,
  ExternalLink,
  Globe
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 sm:p-8">
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
          Technical Reference Manual
        </span>
        <h2 className="text-xl font-bold text-slate-100 mt-1">
          Understanding the Media Library to STRM HTTPS Pipeline
        </h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          How Docker, Caddy/Nginx, and .strm stream pointers allow media servers (Jellyfin, Plex, Emby, Kodi) to ingest 50TB+ libraries without storing large media files locally.
        </p>
      </div>

      {/* Core Concept: What is an STRM file? */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            1. What is a .strm / .srtm File?
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          A <code className="text-cyan-300 font-mono">.strm</code> file is an industry-standard plain-text file supported natively by <strong>Jellyfin</strong>, <strong>Plex</strong>, <strong>Emby</strong>, <strong>Kodi</strong>, <strong>Infuse</strong>, and <strong>VLC</strong>.
          Its entire content is a single line containing a URL (e.g. <code className="text-emerald-400 font-mono">https://stream.server.lan/media/movie.mkv</code>).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-200">Traditional Media Storage</span>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Requires local multi-terabyte HDDs or SSD arrays.</li>
              <li>High disk wear, spin-up latency, and RAID rebuild overhead.</li>
              <li>Duplication of files across multiple homelab nodes.</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-2">
            <span className="text-xs font-semibold text-cyan-300">STRM over HTTPS Architecture</span>
            <ul className="text-xs text-cyan-200/80 space-y-1.5 list-disc list-inside">
              <li>Each movie is a tiny <strong>100-byte</strong> text file.</li>
              <li>Stream transmitted on-demand with TLS 1.3 encryption.</li>
              <li>Zero local storage needed for gigabyte/terabyte files.</li>
              <li>Seamless Direct Play seeking via <code className="font-mono text-cyan-300">Range: bytes</code> headers.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* The HTTPS Byte-Range Mechanism */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            2. How HTTP 206 Partial Content Enables Instant Video Seeking
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          When playing high-bitrate 4K MKV or MP4 files over the network, a player does not download the video from the beginning. Instead, it issues HTTP Range requests:
        </p>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-cyan-400 font-semibold">1. Initial Header Probe</div>
          <div className="pl-4 text-slate-400">GET /stream/Inception.mkv HTTP/2</div>
          <div className="pl-4 text-slate-400">Range: bytes=0-1048576 (First 1MB to read moov / MKV header)</div>

          <div className="text-emerald-400 font-semibold pt-2">2. User Jumps to 01:15:30 in Video Timeline</div>
          <div className="pl-4 text-slate-400">GET /stream/Inception.mkv HTTP/2</div>
          <div className="pl-4 text-slate-400">Range: bytes=32491000000-32501485760 (Jumps straight to the keyframe!)</div>

          <div className="text-amber-400 font-semibold pt-2">3. Caddy / Nginx Server Response</div>
          <div className="pl-4 text-slate-400">HTTP/2 206 Partial Content</div>
          <div className="pl-4 text-slate-400">Content-Range: bytes 32491000000-32501485760/54100000000</div>
        </div>

        <p className="text-xs text-slate-400">
          Because the Docker streaming container (Caddy / Nginx) has <code className="text-cyan-400 font-mono">Accept-Ranges: bytes</code> enabled, seeking takes <strong>under 150 milliseconds</strong> even across remote networks!
        </p>
      </div>

      {/* Docker Compose Pipeline Architecture */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            3. Docker Multi-Container Architecture
          </h3>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
          <pre className="text-cyan-300 whitespace-pre overflow-x-auto leading-relaxed">
{`┌────────────────────────────────────────────────────────┐
│                   DOCKER HOST SYSTEM                   │
│                                                        │
│  [ Host Storage: /mnt/media ]                          │
│         │                                              │
│         ├─(ro)─▶ [ Container: strm-transformer ]       │
│         │        • Python 3.11 inotify watcher         │
│         │        • Scans .mkv, .mp4, .avi              │
│         │        • Computes HMAC SHA-256 tokens        │
│         │        • Generates .strm + .nfo stubs        │
│         │                    │                         │
│         │                   (rw)                       │
│         │                    ▼                         │
│         │        [ Host: /mnt/strm-library ]           │
│         │                    │                         │
│         │                   (ro)                       │
│         │                    ▼                         │
│         ├─(ro)─▶ [ Container: https-media-server ]     │
│         │        • Caddy 2 with automated TLS          │
│         │        • HTTP/3 (QUIC) + HTTP/2              │
│         │        • Range: bytes seek acceleration      │
│         │                    │                         │
│         │                    ▼ (HTTPS Stream 206)      │
│         └──────▶ [ Container: jellyfin / plex ]        │
│                  • Mounts /mnt/strm-library            │
│                  • Client Direct Play streaming        │
└────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* Troubleshooting & Best Practices */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            4. Production Deployment Best Practices & Pitfalls
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-200">
              A. SSL / TLS Certificate Validation in Android TV / Apple TV
            </div>
            <p className="text-slate-400">
              Smart TVs and streaming sticks (Roku, FireTV, Apple TV) have strict root certificate stores. If using a custom local domain (e.g. <code className="font-mono text-cyan-300">*.internal</code>), either install the Caddy root CA certificate on the TV or use a valid public domain with Let's Encrypt DNS-01 validation (e.g. Cloudflare).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-200">
              B. Disable Reverse Proxy Buffering
            </div>
            <p className="text-slate-400">
              If putting another proxy (like Cloudflare or Traefik) in front of the stream server, ensure response buffering is turned off. Video streams must stream chunk-by-chunk; buffering an entire 40GB file will crash proxy memory.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-200">
              C. Strict RFC-3986 URL Encoding
            </div>
            <p className="text-slate-400">
              Media filenames often contain brackets, spaces, and periods (e.g. <code className="font-mono text-cyan-300">Movie [2024] (1080p).mkv</code>). The STRM engine ensures spaces are encoded as <code className="font-mono text-cyan-300">%20</code> so HTTP clients parse the stream URL without clipping.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: ZimaOS & CasaOS Specifics */}
      <div className="bg-[#0F172A] border border-cyan-500/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            5. ZimaOS & CasaOS Native Compatibility
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>ZimaOS</strong> (running on ZimaBoard, ZimaBlade, ZimaCube) and <strong>CasaOS</strong> manage containers using Docker Compose behind an intuitive Web UI. This engine is optimized for their environment:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-semibold text-cyan-300">x-casaos Schema Support</span>
            <p className="text-slate-400 leading-relaxed">
              Top-level and service-level <code className="text-cyan-400 font-mono">x-casaos</code> attributes are included. When you click <strong>"+" → "Import"</strong> in CasaOS/ZimaOS and paste this YAML, it auto-detects the app icon, title, description, HTTPS port, and web UI scheme!
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-semibold text-cyan-300">Standard /DATA/Media Volume Convention</span>
            <p className="text-slate-400 leading-relaxed">
              ZimaOS and CasaOS place all user drives and shares under <code className="text-cyan-400 font-mono">/DATA/Media</code> (or <code className="text-cyan-400 font-mono">/DATA/Storage</code> on ZimaCube RAID pools). The compose file binds directly to these paths.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-semibold text-cyan-300">Intel QuickSync (/dev/dri) on Zima Hardware</span>
            <p className="text-slate-400 leading-relaxed">
              ZimaBoard (Intel Celeron N3450/N3350) and ZimaCube (Intel Core 12th Gen) feature integrated graphics. The compose stack maps <code className="text-cyan-400 font-mono">/dev/dri:/dev/dri</code> into Jellyfin/Plex for hardware decode without configuration.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-semibold text-cyan-300">Multi-Arch: amd64 & arm64</span>
            <p className="text-slate-400 leading-relaxed">
              Images use official multi-architecture Docker registries (<code className="text-cyan-400 font-mono">python:3.11-alpine</code>, <code className="text-cyan-400 font-mono">caddy:2-alpine</code>, <code className="text-cyan-400 font-mono">jellyfin/jellyfin</code>), fully compatible with x86 ZimaBoards and ARM64 boards (e.g. Raspberry Pi running CasaOS).
            </p>
          </div>
        </div>
      </div>

      {/* Section 6: DuckDNS & Nginx Proxy Manager Setup */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            6. DuckDNS & Nginx Proxy Manager (NPM) for Universal Player Playback
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          To play .strm files on <strong>Plex</strong>, <strong>Emby</strong>, <strong>Jellyfin</strong>, and <strong>VLC</strong> outside your local network, pair <strong>DuckDNS</strong> (for dynamic DNS) with <strong>Nginx Proxy Manager</strong> (for automated Let's Encrypt SSL certificates):
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-cyan-300">A. Why DuckDNS?</span>
            <p className="text-slate-400 leading-relaxed">
              Most residential internet connections have dynamic IP addresses. DuckDNS creates a permanent domain (e.g. <code className="font-mono text-cyan-300">myhomelab.duckdns.org</code>) and the included <code className="font-mono text-cyan-300">duckdns</code> Docker container automatically updates your IP every 5 minutes.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-cyan-300">B. Why Nginx Proxy Manager & Disabling Buffering?</span>
            <p className="text-slate-400 leading-relaxed">
              Standard Nginx tries to buffer incoming files before sending them to the client. For 10GB–50GB video streams, buffering causes severe playback freeze and crashes memory. Adding <code className="font-mono text-cyan-300">proxy_buffering off;</code> and forwarding <code className="font-mono text-cyan-300">Range $http_range</code> allows Plex, Emby, Jellyfin, and VLC to stream directly and scrub instantly.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-cyan-300">C. Player Ingestion Checklist</span>
            <ul className="text-slate-400 space-y-1 list-disc list-inside">
              <li><strong>Plex:</strong> Point Movies Library to <code className="font-mono text-cyan-300">/DATA/AppData/strm-library</code>. Plex will parse the .strm files and pass the HTTPS stream to clients.</li>
              <li><strong>Emby:</strong> Point Library to <code className="font-mono text-cyan-300">/DATA/AppData/strm-library</code>. Sidecar subtitles like <code className="font-mono text-cyan-300">.en.srt</code> will auto-attach.</li>
              <li><strong>Jellyfin:</strong> Point Library to <code className="font-mono text-cyan-300">/data/movies</code>. Companion <code className="font-mono text-cyan-300">.nfo</code> metadata will populate movie details.</li>
              <li><strong>VLC:</strong> Drag and drop any <code className="font-mono text-cyan-300">.strm</code> file into VLC or go to <strong>Media → Open Network Stream</strong> to stream directly over HTTPS!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
