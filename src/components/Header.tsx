import React from 'react';
import { ShieldCheck, HardDrive, Download, Cpu, Luggage } from 'lucide-react';
import { StrmConfig } from '../types';

interface HeaderProps {
  config: StrmConfig;
  onOpenConfig: () => void;
  onDownloadZip: () => void;
  isDownloadingZip: boolean;
  onDownloadPortableStrms?: () => void;
  isDownloadingPortable?: boolean;
  totalItems: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenConfig,
  onDownloadZip,
  isDownloadingZip,
  onDownloadPortableStrms,
  isDownloadingPortable,
  totalItems
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                Docker STRM HTTPS Stream Engine
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {config.platformPreset === 'zimaos' ? 'ZimaOS Native' : config.platformPreset === 'casaos' ? 'CasaOS / ZimaOS' : 'Docker v2'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
              <span>{config.protocol.toUpperCase()}://{config.domain}:{config.httpsPort}</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">{config.fileExtension} Stream Pointers</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{totalItems} Media Items</span>
            </p>
          </div>
        </div>

        {/* Center/Right: Badges & Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Quick System Indicators */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              TLS 1.3
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              {config.authMode === 'token_hmac' ? 'HMAC Signed' : 'Direct HTTPS'}
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-indigo-300">
              {config.webServer.toUpperCase()} + {config.targetMediaServer.toUpperCase()}
            </span>
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenConfig}
            className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Configure Domain, Ports, Auth, and Storage Paths"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            Config
          </button>

          {/* Portable STRM download button */}
          {onDownloadPortableStrms && (
            <button
              onClick={onDownloadPortableStrms}
              disabled={isDownloadingPortable}
              className="px-3 py-2 text-xs font-medium text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 rounded-md border border-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download Lightweight Zero-Storage Portable .STRM files & Master M3U8 Playlist"
            >
              <Luggage className="w-3.5 h-3.5 text-cyan-400" />
              {isDownloadingPortable ? 'Exporting...' : 'Portable STRMs'}
            </button>
          )}

          {/* Download Full Docker Stack CTA */}
          <button
            onClick={onDownloadZip}
            disabled={isDownloadingZip}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-md shadow-md shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isDownloadingZip ? 'Packaging...' : 'Docker Stack (.zip)'}
          </button>
        </div>
      </div>
    </header>
  );
};
