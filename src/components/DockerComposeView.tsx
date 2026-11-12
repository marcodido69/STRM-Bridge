import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  Cpu,
  Server,
  ShieldAlert,
  Play,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { StrmConfig } from '../types';
import { generateDockerArtifacts } from '../utils/dockerGenerator';

interface DockerComposeViewProps {
  config: StrmConfig;
  onUpdateConfig: (updated: Partial<StrmConfig>) => void;
  onDownloadZip: () => void;
  isDownloadingZip: boolean;
}

type FileTab = 'compose' | 'dockerfile' | 'script' | 'webserver' | 'npm' | 'env' | 'readme' | 'license' | 'publish';

export const DockerComposeView: React.FC<DockerComposeViewProps> = ({
  config,
  onUpdateConfig,
  onDownloadZip,
  isDownloadingZip
}) => {
  const [activeTab, setActiveTab] = useState<FileTab>('compose');
  const [copied, setCopied] = useState(false);

  const artifacts = generateDockerArtifacts(config);

  const tabs: { id: FileTab; filename: string; content: string; desc: string }[] = [
    {
      id: 'compose',
      filename: 'docker-compose.yml',
      content: artifacts.composeYaml,
      desc: 'Docker Compose YAML multi-container specification'
    },
    {
      id: 'dockerfile',
      filename: 'Dockerfile',
      content: artifacts.dockerfile,
      desc: 'Lightweight Python inotify daemon image definition'
    },
    {
      id: 'script',
      filename: 'generate_strm.py',
      content: artifacts.pythonScript,
      desc: 'Real-time media library watcher and STRM transformer'
    },
    {
      id: 'webserver',
      filename: artifacts.webServerConfig.filename,
      content: artifacts.webServerConfig.content,
      desc: `${config.webServer.toUpperCase()} HTTPS video server configuration`
    },
    {
      id: 'npm',
      filename: 'npm_advanced_config.txt',
      content: artifacts.npmAdvancedConfig,
      desc: 'Nginx Proxy Manager buffer-free streaming snippet for Plex/Emby/Jellyfin/VLC'
    },
    {
      id: 'env',
      filename: '.env',
      content: artifacts.envFile,
      desc: 'Environment variables for container paths and credentials'
    },
    {
      id: 'readme',
      filename: 'README.md',
      content: artifacts.readme,
      desc: 'Deployment instructions and curl verification guide'
    },
    {
      id: 'license',
      filename: 'LICENSE',
      content: artifacts.license,
      desc: 'GNU Affero General Public License v3.0 (AGPL-3.0)'
    },
    {
      id: 'publish',
      filename: 'publish_to_github.sh',
      content: artifacts.gitPublishCommands,
      desc: 'Automated GitHub push script under AGPLv3'
    }
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTab.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentTab.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentTab.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Live Docker Architecture Controls */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Docker Architecture Orchestrator
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                3 Services Configured
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-100 mt-0.5">
              Production Docker YAML for Media to STRM Stream Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Dynamically synthesized multi-service stack with inotify watcher, HTTPS reverse proxy with byte-range streaming, and target media server.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const nextPreset = config.platformPreset === 'standard' ? 'casaos' : config.platformPreset === 'casaos' ? 'zimaos' : 'standard';
                onUpdateConfig({
                  platformPreset: nextPreset,
                  enableCasaOsMetadata: nextPreset !== 'standard',
                  mediaLibraryHostPath: nextPreset !== 'standard' ? '/DATA/Media' : '/mnt/storage/media',
                  strmLibraryHostPath: nextPreset !== 'standard' ? '/DATA/AppData/strm-library' : '/mnt/storage/strm-library'
                });
              }}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer flex items-center gap-1.5"
              title="Click to toggle between CasaOS, ZimaOS, and Standard Docker format"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target: {config.platformPreset.toUpperCase()}</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : `Copy ${currentTab.filename}`}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button
              onClick={onDownloadZip}
              disabled={isDownloadingZip}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Stack (.zip)</span>
            </button>
          </div>
        </div>

        {/* CasaOS & ZimaOS Import Callout */}
        {(config.platformPreset === 'casaos' || config.platformPreset === 'zimaos') && (
          <div className="mt-4 p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0 border border-cyan-500/40">
                {config.platformPreset === 'zimaos' ? 'ZOS' : 'COS'}
              </div>
              <div>
                <p className="text-xs font-semibold text-cyan-200">
                  {config.platformPreset === 'zimaos' ? 'ZimaOS' : 'CasaOS'} 1-Click UI Import Ready
                </p>
                <p className="text-[11px] text-slate-300">
                  Formatted with <code className="font-mono text-cyan-300">x-casaos</code> metadata, <code className="font-mono text-cyan-300">/DATA/Media</code> storage mounts, and Intel QuickSync <code className="font-mono text-cyan-300">/dev/dri</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="text-[11px] font-mono text-slate-400">In CasaOS/ZimaOS:</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px]">
                "+" Icon → "Import" → Paste YAML → "Submit"
              </span>
            </div>
          </div>
        )}

        {/* Live Quick Toggles */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-500 block mb-1">PLATFORM PRESET</span>
            <select
              value={config.platformPreset}
              onChange={(e) => {
                const val = e.target.value as any;
                onUpdateConfig({
                  platformPreset: val,
                  enableCasaOsMetadata: val !== 'standard',
                  mediaLibraryHostPath: val !== 'standard' ? '/DATA/Media' : '/mnt/storage/media',
                  strmLibraryHostPath: val !== 'standard' ? '/DATA/AppData/strm-library' : '/mnt/storage/strm-library'
                });
              }}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="casaos">CasaOS (/DATA/Media)</option>
              <option value="zimaos">ZimaOS (ZimaBoard/Cube)</option>
              <option value="standard">Standard Linux Docker</option>
            </select>
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-500 block mb-1">WEB SERVER</span>
            <select
              value={config.webServer}
              onChange={(e) => onUpdateConfig({ webServer: e.target.value as any })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="caddy">Caddy 2 (Automatic HTTPS)</option>
              <option value="nginx">Nginx (High-Throughput)</option>
            </select>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-500 block mb-1">CONSUMER SERVER</span>
            <select
              value={config.targetMediaServer}
              onChange={(e) => onUpdateConfig({ targetMediaServer: e.target.value as any })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="jellyfin">Jellyfin (Port 8096)</option>
              <option value="plex">Plex (Port 32400)</option>
              <option value="emby">Emby (Port 8096)</option>
              <option value="standalone">Standalone (Stream Only)</option>
            </select>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-500 block mb-1">SECURITY / AUTH</span>
            <select
              value={config.authMode}
              onChange={(e) => onUpdateConfig({ authMode: e.target.value as any })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="token_hmac">HMAC SHA-256 Token</option>
              <option value="none">Open LAN HTTPS</option>
              <option value="basic_auth">HTTP Basic Auth</option>
            </select>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-500 block mb-1">STREAM EXTENSION</span>
            <select
              value={config.fileExtension}
              onChange={(e) => onUpdateConfig({ fileExtension: e.target.value as any })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value=".strm">.strm (Standard Player)</option>
              <option value=".srtm">.srtm (Custom Extension)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Code Editor / File Viewer Container */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* File Tabs Header */}
        <div className="flex items-center justify-between px-3 pt-2 bg-[#0F172A] border-b border-slate-800 overflow-x-auto no-scrollbar">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-t-md transition cursor-pointer ${
                    isActive
                      ? 'bg-[#0B0F17] text-cyan-300 border-t-2 border-t-cyan-400 border-x border-slate-800 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.filename}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden sm:block pr-2">
            {currentTab.desc}
          </div>
        </div>

        {/* Code Content */}
        <div className="relative">
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/90 text-slate-400 border border-slate-700 backdrop-blur-sm">
              {currentTab.content.split('\n').length} lines
            </span>
          </div>

          <pre className="p-4 sm:p-6 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto select-all">
            <code>{currentTab.content}</code>
          </pre>
        </div>
      </div>

      {/* Terminal Deployment Cheatsheet */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Host CLI Deployment Execution
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400">1. Launch Docker Compose Stack</span>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400">
              <code>docker compose up -d --build</code>
              <button
                onClick={() => navigator.clipboard.writeText('docker compose up -d --build')}
                className="text-slate-500 hover:text-slate-300"
                title="Copy command"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400">2. Monitor Inotify Transformation Logs</span>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-cyan-400">
              <code>docker compose logs -f strm-transformer</code>
              <button
                onClick={() => navigator.clipboard.writeText('docker compose logs -f strm-transformer')}
                className="text-slate-500 hover:text-slate-300"
                title="Copy command"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400">3. Test HTTPS Range: bytes Seeking via cURL</span>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-amber-300">
              <code className="truncate">
                curl -I -k -r 0-1048576 "https://{config.domain}:{config.httpsPort}{config.pathPrefix}/sample.mp4"
              </code>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `curl -I -k -r 0-1048576 "https://${config.domain}:${config.httpsPort}${config.pathPrefix}/sample.mp4"`
                  )
                }
                className="text-slate-500 hover:text-slate-300 shrink-0 ml-2"
                title="Copy command"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400">4. Inspect Generated STRM Files</span>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-purple-300">
              <code>docker compose exec strm-transformer ls -la /strm-output</code>
              <button
                onClick={() =>
                  navigator.clipboard.writeText('docker compose exec strm-transformer ls -la /strm-output')
                }
                className="text-slate-500 hover:text-slate-300"
                title="Copy command"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
