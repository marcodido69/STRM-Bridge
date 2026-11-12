import React from 'react';
import { X, Sliders, Shield, Globe, HardDrive, KeyRound, Server } from 'lucide-react';
import { StrmConfig, WebServerType, MediaServerType, AuthMode, SslMode } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StrmConfig;
  onUpdateConfig: (updated: Partial<StrmConfig>) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                HTTPS Streaming & Docker Stack Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure your domain, ports, auth tokens, and volume mount paths
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Domain & Network */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Network & HTTPS Endpoint
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Stream Domain / Hostname / IP
                </label>
                <input
                  type="text"
                  value={config.domain}
                  onChange={(e) => onUpdateConfig({ domain: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. media-stream.homelab.internal"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Domain used inside the generated .strm pointer files
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    HTTPS Port
                  </label>
                  <input
                    type="number"
                    value={config.httpsPort}
                    onChange={(e) => onUpdateConfig({ httpsPort: parseInt(e.target.value) || 443 })}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    HTTP Port
                  </label>
                  <input
                    type="number"
                    value={config.httpPort}
                    onChange={(e) => onUpdateConfig({ httpPort: parseInt(e.target.value) || 80 })}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Stream Path Prefix
                </label>
                <input
                  type="text"
                  value={config.pathPrefix}
                  onChange={(e) => onUpdateConfig({ pathPrefix: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="/stream"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  File Extension Format
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ fileExtension: '.strm' })}
                    className={`flex-1 py-2 text-xs font-mono font-medium rounded-md border transition ${
                      config.fileExtension === '.strm'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    .strm (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ fileExtension: '.srtm' })}
                    className={`flex-1 py-2 text-xs font-mono font-medium rounded-md border transition ${
                      config.fileExtension === '.srtm'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    .srtm (Custom)
                  </button>
                </div>
              </div>

              {/* DuckDNS Dynamic Domain & NPM */}
              <div className="md:col-span-2 p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400 font-mono flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    DuckDNS & Nginx Proxy Manager (NPM)
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.useDuckDns}
                      onChange={(e) => onUpdateConfig({ useDuckDns: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500"
                    />
                    Enable DuckDNS DDNS
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      DuckDNS Subdomain
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={config.duckDnsSubdomain}
                        onChange={(e) => {
                          const sub = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          onUpdateConfig({
                            duckDnsSubdomain: sub,
                            domain: `${sub || 'myhomelab'}.duckdns.org`
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-l text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                        placeholder="myhomelab"
                      />
                      <span className="px-2 py-1.5 bg-slate-800 border border-l-0 border-slate-700 rounded-r text-slate-400 font-mono text-[11px]">
                        .duckdns.org
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      DuckDNS Token
                    </label>
                    <input
                      type="text"
                      value={config.duckDnsToken}
                      onChange={(e) => onUpdateConfig({ duckDnsToken: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. duckdns-token-xxxx"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.useNginxProxyManager}
                      onChange={(e) => onUpdateConfig({ useNginxProxyManager: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500"
                    />
                    Include Nginx Proxy Manager in Docker Compose
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">NPM Web Port:</span>
                    <input
                      type="number"
                      value={config.npmAdminPort}
                      onChange={(e) => onUpdateConfig({ npmAdminPort: parseInt(e.target.value) || 81 })}
                      className="w-16 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Security & Authentication */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              Security & Stream Access Control
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Authentication Mode
                </label>
                <select
                  value={config.authMode}
                  onChange={(e) => onUpdateConfig({ authMode: e.target.value as AuthMode })}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="token_hmac">HMAC SHA-256 Token with Expiration (Recommended)</option>
                  <option value="none">Direct Open HTTPS (Internal Network / VPN)</option>
                  <option value="basic_auth">HTTP Basic Authentication</option>
                  <option value="bearer">Static Bearer Token</option>
                </select>
              </div>

              {config.authMode === 'token_hmac' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      HMAC Signing Secret Key
                    </label>
                    <input
                      type="text"
                      value={config.tokenSecret}
                      onChange={(e) => onUpdateConfig({ tokenSecret: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Stream Token TTL (Minutes)
                    </label>
                    <input
                      type="number"
                      value={config.tokenTtlMinutes}
                      onChange={(e) => onUpdateConfig({ tokenTtlMinutes: parseInt(e.target.value) || 60 })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  TLS / SSL Certificate Mode
                </label>
                <select
                  value={config.sslMode}
                  onChange={(e) => onUpdateConfig({ sslMode: e.target.value as SslMode })}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="self_signed">Caddy Internal CA / Self-Signed (Local / LAN)</option>
                  <option value="letsencrypt">Let's Encrypt Automated ACME (Public Domain)</option>
                  <option value="custom_certs">Custom Certificates (./certs/cert.pem)</option>
                </select>
              </div>

              {config.sslMode === 'letsencrypt' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    ACME Email for Let's Encrypt
                  </label>
                  <input
                    type="email"
                    value={config.letsEncryptEmail}
                    onChange={(e) => onUpdateConfig({ letsEncryptEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Docker Services */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Host Platform & Container Architecture
            </h3>

            {/* Platform Selector */}
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-200">
                Target Operating System & Homelab Environment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({
                      platformPreset: 'casaos',
                      enableCasaOsMetadata: true,
                      mediaLibraryHostPath: '/DATA/Media',
                      strmLibraryHostPath: '/DATA/AppData/strm-library'
                    })
                  }
                  className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                    config.platformPreset === 'casaos'
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">CasaOS</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    1-Click App Store Import (/DATA/Media)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({
                      platformPreset: 'zimaos',
                      enableCasaOsMetadata: true,
                      mediaLibraryHostPath: '/DATA/Media',
                      strmLibraryHostPath: '/DATA/AppData/strm-library'
                    })
                  }
                  className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                    config.platformPreset === 'zimaos'
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">ZimaOS (ZimaBoard / Cube)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Intel QuickSync + PCIe/SATA paths
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({
                      platformPreset: 'standard',
                      enableCasaOsMetadata: false,
                      mediaLibraryHostPath: '/mnt/storage/media',
                      strmLibraryHostPath: '/mnt/storage/strm-library'
                    })
                  }
                  className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                    config.platformPreset === 'standard'
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">Standard Docker CLI</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Generic Linux, Unraid, TrueNAS
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Web & Streaming Reverse Proxy
                </label>
                <select
                  value={config.webServer}
                  onChange={(e) => onUpdateConfig({ webServer: e.target.value as WebServerType })}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="caddy">Caddy 2 (Recommended - Zero Config HTTPS & HTTP/3)</option>
                  <option value="nginx">Nginx Alpine (Classic High-Throughput)</option>
                  <option value="traefik">Traefik v2.10 (Cloud Native)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Consumer Media Server
                </label>
                <select
                  value={config.targetMediaServer}
                  onChange={(e) => onUpdateConfig({ targetMediaServer: e.target.value as MediaServerType })}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="jellyfin">Jellyfin Media Server (Open Source, Port 8096)</option>
                  <option value="plex">Plex Media Server (Port 32400)</option>
                  <option value="emby">Emby Server (Port 8096)</option>
                  <option value="standalone">Standalone (Stream Engine Only, No Player)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Host Media Directory (Input)
                </label>
                <input
                  type="text"
                  value={config.mediaLibraryHostPath}
                  onChange={(e) => onUpdateConfig({ mediaLibraryHostPath: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="/mnt/storage/media"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Host STRM Output Directory (Destination)
                </label>
                <input
                  type="text"
                  value={config.strmLibraryHostPath}
                  onChange={(e) => onUpdateConfig({ strmLibraryHostPath: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="/mnt/storage/strm-library"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={config.includeNfoStubs}
                  onChange={(e) => onUpdateConfig({ includeNfoStubs: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                Generate Companion .nfo metadata stubs for scrapers
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={config.includeSubtitles}
                  onChange={(e) => onUpdateConfig({ includeSubtitles: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                Generate sample .srt subtitle tracks
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={config.urlEncoding}
                  onChange={(e) => onUpdateConfig({ urlEncoding: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                Strict RFC-3986 URL Encoding (%20 for spaces)
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
