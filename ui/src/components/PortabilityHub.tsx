import React, { useState, useMemo } from 'react';
import {
  Luggage,
  HardDrive,
  Download,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Radio,
  FileText,
  Share2,
  Tv,
  Smartphone,
  Server,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';
import { StrmConfig, StrmItem, PortabilityMode } from '../types';
import { formatBytes } from '../utils/strmGenerator';
import { createPortableStrmOnlyZipBundle, downloadBlob } from '../utils/zipExporter';

interface PortabilityHubProps {
  config: StrmConfig;
  onUpdateConfig: (updated: Partial<StrmConfig>) => void;
  strmItems: StrmItem[];
  selectedItem: StrmItem | null;
  onSelectItem: (item: StrmItem) => void;
  onPlayInSimulator?: (item: StrmItem) => void;
}

export const PortabilityHub: React.FC<PortabilityHubProps> = ({
  config,
  onUpdateConfig,
  strmItems,
  selectedItem,
  onSelectItem,
  onPlayInSimulator
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedM3u, setCopiedM3u] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [activePresetUrl, setActivePresetUrl] = useState<'duckdns' | 'tailscale' | 'lan' | 'custom'>('duckdns');

  // Calculate raw storage vs .strm storage
  const totalRawBytes = useMemo(() => {
    return strmItems.reduce((acc, item) => acc + item.mediaFile.sizeBytes, 0);
  }, [strmItems]);

  const totalStrmBytes = useMemo(() => {
    return strmItems.reduce((acc, item) => acc + (item.strmContent.length || 0), 0);
  }, [strmItems]);

  const compressionRatio = useMemo(() => {
    if (totalStrmBytes === 0) return '99.999%';
    const pct = ((1 - totalStrmBytes / totalRawBytes) * 100).toFixed(4);
    return `${pct}%`;
  }, [totalRawBytes, totalStrmBytes]);

  const currentItem = selectedItem || strmItems[0] || null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSingleStrm = (item: StrmItem) => {
    const blob = new Blob([item.strmContent], { type: 'text/plain;charset=utf-8' });
    const filename = item.strmRelativePath.split('/').pop() || `${item.mediaFile.name}.strm`;
    downloadBlob(blob, filename);
  };

  const handleExportPortableZip = async () => {
    try {
      setIsExportingZip(true);
      const blob = await createPortableStrmOnlyZipBundle(config, strmItems);
      downloadBlob(blob, `portable-strm-library-${config.domain}.zip`);
    } catch (err) {
      console.error('Failed to generate portable zip:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Generate Master M3U8 string
  const masterM3u8Content = useMemo(() => {
    let content = '#EXTM3U\n#EXTENC: UTF-8\n';
    for (const item of strmItems) {
      const cleanTitle = item.mediaFile.name.replace(/\.[^/.]+$/, '').replace(/\./g, ' ');
      const dur = item.mediaFile.durationSec || -1;
      content += `#EXTINF:${dur},${cleanTitle}\n${item.httpsUrl}\n\n`;
    }
    return content;
  }, [strmItems]);

  const handleDownloadM3u8 = () => {
    const blob = new Blob([masterM3u8Content], { type: 'application/vnd.apple.mpegurl;charset=utf-8' });
    downloadBlob(blob, `master_library_${config.domain}.m3u8`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Portability Concept Banner */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-[#0D1525] to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                <Luggage className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    The .STRM Portability Paradigm
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Zero Storage Footprint
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Decouple massive multi-terabyte disk arrays into lightweight plaintext pointer files.
                  A 50 TB movie and TV library compresses down to under 1 MB of text, letting you take your whole collection anywhere on a USB drive, cloud sync, or travel router.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportPortableZip}
              disabled={isExportingZip}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExportingZip ? 'Packaging Portable Archive...' : 'Export Portable .STRM Library (.zip)'}
            </button>
          </div>

          {/* Metric Comparison Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Physical Media Size</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-slate-200">{formatBytes(totalRawBytes)}</span>
                <span className="text-xs text-rose-400/80">on NAS / ZimaOS</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Requires multi-bay drives, high power, static hardware</p>
            </div>

            <div className="bg-slate-950/60 rounded-lg p-3.5 border border-cyan-500/30 bg-cyan-950/10">
              <span className="text-[11px] font-mono uppercase text-cyan-400 block mb-1">Portable .STRM Library</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-cyan-300">{formatBytes(totalStrmBytes)}</span>
                <span className="text-xs text-emerald-400 font-semibold">{compressionRatio} lighter</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Fits on a $2 USB stick, email attachment, or Git repo</p>
            </div>

            <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Network Mobility</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-indigo-300">HTTPS + HTTP/2</span>
                <span className="text-xs text-slate-400">TLS 1.3</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Zero latency seeking via HTTP 206 Partial Content</p>
            </div>

            <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Universal Compatibility</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-emerald-400">Plex • Emby • Jellyfin</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Native support in VLC, Infuse, Kodi & IPTV players</p>
            </div>
          </div>
        </div>
      </div>

      {/* Re-Targeting & Network Routing Profiles */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Portability Profile & Re-Targeting
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Change where the pointer URLs point to in 1-click. All .strm files immediately re-target without touching media files.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => {
                setActivePresetUrl('duckdns');
                onUpdateConfig({
                  portabilityMode: 'global_duckdns',
                  domain: config.duckDnsSubdomain ? `${config.duckDnsSubdomain}.duckdns.org` : 'myhomelab.duckdns.org',
                  protocol: 'https',
                  httpsPort: 443
                });
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                activePresetUrl === 'duckdns'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DuckDNS (Global)
            </button>
            <button
              onClick={() => {
                setActivePresetUrl('tailscale');
                onUpdateConfig({
                  portabilityMode: 'tailscale_vpn',
                  domain: 'zimaos-server.tailnet-xyz.ts.net',
                  protocol: 'https',
                  httpsPort: 443
                });
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                activePresetUrl === 'tailscale'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tailscale (Mesh VPN)
            </button>
            <button
              onClick={() => {
                setActivePresetUrl('lan');
                onUpdateConfig({
                  portabilityMode: 'local_lan',
                  domain: '192.168.1.150',
                  protocol: 'https',
                  httpsPort: 8443
                });
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                activePresetUrl === 'lan'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LAN / Travel Router
            </button>
          </div>
        </div>

        {/* Live Target Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Target Host / Domain</label>
            <input
              type="text"
              value={config.domain}
              onChange={(e) => onUpdateConfig({ domain: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              placeholder="e.g. myhomelab.duckdns.org"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Port (HTTPS)</label>
            <input
              type="number"
              value={config.httpsPort}
              onChange={(e) => onUpdateConfig({ httpsPort: parseInt(e.target.value, 10) || 443 })}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Auth Protection Mode</label>
            <select
              value={config.authMode}
              onChange={(e) => onUpdateConfig({ authMode: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="none">Public Direct Stream (IP whitelist / Home use)</option>
              <option value="token_hmac">HMAC Token Signed (Portable Auth)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Portability Workspace: Item Inspector & Master Playlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media File Selector */}
        <div className="lg:col-span-5 bg-slate-900/60 rounded-xl border border-slate-800 p-5 flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Portable Library Items ({strmItems.length})
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Click item to inspect pointer</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {strmItems.map((item) => {
              const isSelected = currentItem?.mediaFile.id === item.mediaFile.id;
              const isTheGeneral = item.mediaFile.name.toLowerCase().includes('general');

              return (
                <div
                  key={item.mediaFile.id}
                  onClick={() => onSelectItem(item)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {item.mediaFile.name}
                        </span>
                        {isTheGeneral && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            User Example
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-cyan-400/90 truncate mt-0.5">
                        {item.strmRelativePath}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-emerald-400 block">
                        {item.strmContent.length} B pointer
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {formatBytes(item.mediaFile.sizeBytes)} raw
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Item STRM Inspector & Master Playlist */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected .STRM Inspector Card */}
          {currentItem && (
            <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold tracking-wider">
                    Portable Pointer Inspection
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {currentItem.strmRelativePath}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target Media: <span className="text-slate-200 font-mono">{currentItem.mediaFile.relativePath}</span> ({formatBytes(currentItem.mediaFile.sizeBytes)})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSingleStrm(currentItem)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5"
                    title="Download this single .strm pointer file"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    Download .strm
                  </button>
                  {onPlayInSimulator && (
                    <button
                      onClick={() => onPlayInSimulator(currentItem)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition flex items-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      Test Stream
                    </button>
                  )}
                </div>
              </div>

              {/* Exact content inside the .strm file */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Exact Contents of <span className="text-cyan-300">{currentItem.strmRelativePath.split('/').pop()}</span> ({currentItem.strmContent.length} bytes):</span>
                  <button
                    onClick={() => handleCopy(currentItem.strmContent, currentItem.mediaFile.id)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === currentItem.mediaFile.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs text-emerald-300 break-all select-all">
                  {currentItem.strmContent}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Plex/Jellyfin/VLC will read this URL and request <code className="text-slate-400">Range: bytes=0-</code></span>
                  <span>Pure ASCII Text • 0 Disks Required</span>
                </div>
              </div>
            </div>
          )}

          {/* Master M3U8 Playlist Export Box */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Master M3U8 Streaming Playlist
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Combine all portable .strm streams into a single master playlist for instant VLC, Infuse, or IPTV drag-and-drop.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(masterM3u8Content);
                    setCopiedM3u(true);
                    setTimeout(() => setCopiedM3u(false), 2000);
                  }}
                  className="px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedM3u ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedM3u ? 'Copied' : 'Copy M3U8'}</span>
                </button>

                <button
                  onClick={handleDownloadM3u8}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .m3u8</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs text-slate-300 max-h-40 overflow-y-auto custom-scrollbar whitespace-pre">
              {masterM3u8Content}
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Portability Playbooks */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6">
        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Real-World Portability Playbooks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Playbook 1: Travel Router & Hotel Room */}
          <div className="bg-slate-950/70 rounded-lg p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/20">
                <Luggage className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold font-mono uppercase text-indigo-300">Travel Laptop & USB Key</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Save the exported <code className="text-cyan-300">.strm</code> files onto a 256MB USB thumb drive. Wherever you travel with your laptop or hotel Fire TV stick, open VLC and drag the files in. Full 4K HDR playback streams directly from your home ZimaOS via DuckDNS HTTPS.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              Payload: <span className="text-emerald-400">~24 KB</span> | Media on-demand
            </div>
          </div>

          {/* Playbook 2: Cloud VPS Media Server with 0 Disk Space */}
          <div className="bg-slate-950/70 rounded-lg p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 border border-cyan-500/20">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold font-mono uppercase text-cyan-300">Remote Cloud Jellyfin / Plex</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Run a Jellyfin or Plex container on a cheap $4/month cloud VPS with only 20 GB of disk space. Mount the portable <code className="text-cyan-300">/strm-library</code>. The VPS scrapes metadata and streams all 50 TB directly to friends and family without needing storage upgrades.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              Server Cost: <span className="text-emerald-400">$4/mo</span> | 0 Attached Disks
            </div>
          </div>

          {/* Playbook 3: AirDrop & Git Version Control */}
          <div className="bg-slate-950/70 rounded-lg p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
                <Share2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold font-mono uppercase text-emerald-300">Git & Cloud Sync Mobility</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Because .strm files are pure plaintext, your entire movie catalog can be committed to GitHub, synced via Syncthing, or AirDropped to an iPad. If you switch ISP or domain, a 2-second search-and-replace updates your entire collection.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              Format: <span className="text-emerald-400">100% Plain UTF-8 Text</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
