import React, { useState } from 'react';
import {
  GitBranch,
  Github,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Download,
  Terminal,
  BookOpen,
  CheckCircle2,
  FolderTree,
  FileCode,
  Sparkles
} from 'lucide-react';
import { StrmConfig } from '../types';
import { generateDockerArtifacts } from '../utils/dockerGenerator';

interface GitHubPublisherProps {
  config: StrmConfig;
  onUpdateConfig: (updated: Partial<StrmConfig>) => void;
  onDownloadZip: () => void;
  isDownloadingZip: boolean;
}

export const GitHubPublisher: React.FC<GitHubPublisherProps> = ({
  config,
  onUpdateConfig,
  onDownloadZip,
  isDownloadingZip
}) => {
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [copiedLicense, setCopiedLicense] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);

  const artifacts = generateDockerArtifacts(config);
  const owner = config.githubRepoOwner || 'marcodido69';
  const repoName = config.githubRepoName || 'docker-strm-https-engine';
  const repoUrl = `https://github.com/${owner}/${repoName}`;

  const gitCommands = `# 1. Initialize local Git repository
git init
git checkout -b main

# 2. Add all files (Compose YAML, Dockerfile, Caddyfile, Python script, and AGPLv3 LICENSE)
git add .

# 3. Create initial release commit
git commit -m "feat: initial release of Docker STRM HTTPS Stream Engine (AGPL-3.0)"

# 4. Link to your GitHub account repository (create at https://github.com/new)
git remote add origin ${repoUrl}.git

# 5. Push to GitHub
git push -u origin main`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2000);
  };

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(artifacts.license);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2000);
  };

  const handleCopyReadme = () => {
    navigator.clipboard.writeText(artifacts.readme);
    setCopiedReadme(true);
    setTimeout(() => setCopiedReadme(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: GitHub Repository Publisher */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 shadow-md shrink-0">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  GitHub Open Source Publishing Hub
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  GNU AGPLv3
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 mt-1">
                {repoUrl}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready to publish with full instructions so anyone can transform media files into HTTPS .strm stream pointers.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://github.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>Create Empty Repo on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={onDownloadZip}
              disabled={isDownloadingZip}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingZip ? 'Zipping...' : 'Download Git-Ready Archive (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* Repository Config inputs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">GITHUB USERNAME / ORG</label>
            <input
              type="text"
              value={config.githubRepoOwner}
              onChange={(e) => onUpdateConfig({ githubRepoOwner: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              placeholder="marcodido69"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">REPOSITORY NAME</label>
            <input
              type="text"
              value={config.githubRepoName}
              onChange={(e) => onUpdateConfig({ githubRepoName: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              placeholder="docker-strm-https-engine"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">LICENSE ACCREDITATION</label>
            <div className="px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded text-purple-300 font-mono text-xs flex items-center justify-between">
              <span>GNU AGPL-3.0</span>
              <Shield className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: CLI Commands & How Anyone Can Use It */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Git Push CLI (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  Publish to GitHub in 5 Commands
                </h3>
              </div>
              <button
                onClick={handleCopyCommands}
                className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
              >
                {copiedCommands ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommands ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto select-all">
              <code>{gitCommands}</code>
            </pre>

            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  The archive includes the <strong>official GNU AGPLv3 LICENSE</strong>, CasaOS/ZimaOS metadata, Python inotify daemon, and Caddy byte-range streaming proxy.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Supports editing file input/output directories (e.g. <em>The General (1926).mp4</em> → <em>The General (1926).strm</em>) directly via environment variables or the web UI.
                </span>
              </p>
            </div>
          </div>

          {/* AGPL-3.0 License Summary Box */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  GNU Affero General Public License v3.0 (AGPL-3.0)
                </h3>
              </div>
              <button
                onClick={handleCopyLicense}
                className="text-xs font-mono text-slate-400 hover:text-purple-300 transition flex items-center gap-1"
              >
                {copiedLicense ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLicense ? 'Copied' : 'Copy LICENSE'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The <strong>GNU AGPLv3</strong> is the premier copyleft license for network server applications. It requires anyone who runs a modified version of this engine over a network (LAN, VPN, or Internet) to provide the corresponding source code to users.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-emerald-400 block font-semibold">PERMISSIONS</span>
                Commercial use, Modification, Distribution, Network use
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-amber-400 block font-semibold">REQUIREMENTS</span>
                Disclose Source, License Notice, State Changes, Network Copyleft
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Public Usage Instructions (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  Included Instructions for Anyone to Use
                </h3>
              </div>
              <button
                onClick={handleCopyReadme}
                className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
              >
                {copiedReadme ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReadme ? 'Copied' : 'Copy README.md'}</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-cyan-300">Option 1: CasaOS & ZimaOS Users (1-Click UI)</span>
                <p className="text-slate-400">
                  1. In CasaOS / ZimaOS, click <strong>"+" (Install a customized app)</strong>.
                  <br />
                  2. Click the <strong>"Import"</strong> icon in the top right.
                  <br />
                  3. Paste the contents of <code className="font-mono text-cyan-300">docker-compose.yml</code> from this repo.
                  <br />
                  4. Click <strong>Submit</strong>! CasaOS mounts <code className="font-mono text-cyan-300">/DATA/Media</code> automatically.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-cyan-300">Option 2: Standard Linux / Docker CLI Users</span>
                <p className="text-slate-400">
                  Clone and run with standard Docker Compose:
                </p>
                <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-emerald-400">
                  git clone {repoUrl}.git
                  <br />
                  cd {repoName}
                  <br />
                  docker compose up -d
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-cyan-300">Editing Input & Output Directories</span>
                <p className="text-slate-400">
                  Users can edit input and output folders in <code className="font-mono text-cyan-300">.env</code>:
                </p>
                <pre className="p-2 rounded bg-slate-950 font-mono text-[11px] text-slate-300">
{`# Example:
MEDIA_DIR=/DATA/Media                    # Input directory
STRM_DIR=/DATA/AppData/strm-library      # Output directory

# Result:
# Input:  /DATA/Media/The General (1926).mp4
# Output: /DATA/AppData/strm-library/The General (1926).strm`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
