import React, { useState } from 'react';
import {
  Film,
  Tv,
  FileVideo,
  ExternalLink,
  Copy,
  Check,
  Download,
  Plus,
  Search,
  Upload,
  Play,
  FileText,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  FolderTree
} from 'lucide-react';
import { MediaFile, StrmConfig, StrmItem } from '../types';
import { formatBytes, formatDuration } from '../utils/strmGenerator';

interface TransformerPanelProps {
  files: MediaFile[];
  strmItems: StrmItem[];
  selectedItem: StrmItem | null;
  onSelectItem: (item: StrmItem) => void;
  config: StrmConfig;
  onAddCustomFiles: (files: FileList) => void;
  onSelectPreset: (presetId: string) => void;
  activePresetId: string;
  onPlayInSimulator: (item: StrmItem) => void;
  onUpdateFileMapping: (fileId: string, updates: { relativePath?: string; customOutputPath?: string; name?: string }) => void;
  onUpdateConfig: (updated: Partial<StrmConfig>) => void;
}

export const TransformerPanel: React.FC<TransformerPanelProps> = ({
  files,
  strmItems,
  selectedItem,
  onSelectItem,
  config,
  onAddCustomFiles,
  onSelectPreset,
  activePresetId,
  onPlayInSimulator,
  onUpdateFileMapping,
  onUpdateConfig
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'episode' | 'clip'>('all');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedStrm, setCopiedStrm] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const filteredItems = strmItems.filter((item) => {
    const matchesSearch =
      item.mediaFile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.strmRelativePath.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.mediaFile.mediaType === filterType;
    return matchesSearch && matchesType;
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyStrm = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedStrm(true);
    setTimeout(() => setCopiedStrm(false), 2000);
  };

  const handleDownloadSingleStrm = (item: StrmItem) => {
    const blob = new Blob([item.strmContent], { type: 'text/plain;charset=utf-8' });
    const filename = item.strmRelativePath.split('/').pop() || 'media.strm';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddCustomFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Presets & Real File Dropzone */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Media Source Library
            </span>
            <h2 className="text-sm font-semibold text-slate-100 mt-0.5">
              Select Sample Media Dataset or Drop Your Local Video Files
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Each raw media file in your library is analyzed and transformed into a lightweight {config.fileExtension} stream file containing the exact HTTPS streaming URI for Jellyfin/Plex direct play.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectPreset('cinema-tv')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition ${
                activePresetId === 'cinema-tv'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Cinema & 4K Series
            </button>
            <button
              onClick={() => onSelectPreset('cloud-debrid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition ${
                activePresetId === 'cloud-debrid'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Cloud S3 / Debrid Mount
            </button>

            {/* Custom file upload input */}
            <label className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 cursor-pointer flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drop Local Video</span>
              <input
                type="file"
                multiple
                accept="video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onAddCustomFiles(e.target.files);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`mt-4 border-2 border-dashed rounded-lg p-3 text-center transition ${
            dragActive
              ? 'border-cyan-400 bg-cyan-950/20 text-cyan-200'
              : 'border-slate-800 bg-slate-950/30 text-slate-500 hover:border-slate-700'
          }`}
        >
          <p className="text-xs font-mono">
            Drag & drop raw video files (.mp4, .mkv, .mov, .avi) here to test live transformation
          </p>
        </div>

        {/* Global Directory Mapping Configuration */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-sans font-medium">
              Source Input Directory
            </label>
            <input
              type="text"
              value={config.mediaLibraryHostPath}
              onChange={(e) => onUpdateConfig({ mediaLibraryHostPath: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              placeholder="/DATA/Media"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-sans font-medium">
              Destination STRM Directory
            </label>
            <input
              type="text"
              value={config.strmLibraryHostPath}
              onChange={(e) => onUpdateConfig({ strmLibraryHostPath: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              placeholder="/DATA/AppData/strm-library"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-sans font-medium">
              Directory Structure Strategy
            </label>
            <select
              value={config.pathMappingMode || 'mirror'}
              onChange={(e) => onUpdateConfig({ pathMappingMode: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="mirror">Mirror Folders (e.g. Movies/Title/file.strm)</option>
              <option value="flat">Flat Root (e.g. The General (1926).strm)</option>
              <option value="folder_per_movie">Folder Per Movie (e.g. Title/Title.strm)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media File Catalog (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files or paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0F172A] border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex gap-1 bg-[#0F172A] p-0.5 rounded-lg border border-slate-800">
              {(['all', 'movie', 'episode'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-1 text-[11px] font-medium rounded capitalize transition ${
                    filterType === t
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/60 max-h-[620px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No matching media files found.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.mediaFile.id === item.mediaFile.id;
                const file = item.mediaFile;
                return (
                  <div
                    key={file.id}
                    onClick={() => onSelectItem(item)}
                    className={`p-3.5 transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/30 border-l-2 border-l-cyan-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                        file.mediaType === 'movie'
                          ? 'bg-blue-500/10 text-blue-400'
                          : file.mediaType === 'episode'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {file.mediaType === 'movie' ? (
                        <Film className="w-4 h-4" />
                      ) : file.mediaType === 'episode' ? (
                        <Tv className="w-4 h-4" />
                      ) : (
                        <FileVideo className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-medium truncate ${
                            isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-200'
                          }`}
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {formatBytes(file.sizeBytes)}
                        </span>
                      </div>

                      <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                        {file.relativePath}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {file.resolution || '1080p'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatDuration(file.durationSec)}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400/90 ml-auto flex items-center gap-1">
                          <span>→</span>
                          <span>{config.fileExtension}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Deep-Dive Transformation Inspector (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                      Pipeline Inspector
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      HTTPS Stream Ready
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 truncate mt-1">
                    {selectedItem.mediaFile.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPlayInSimulator(selectedItem)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Test Stream Player
                  </button>
                  <button
                    onClick={() => handleDownloadSingleStrm(selectedItem)}
                    className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition"
                    title={`Download ${config.fileExtension} file`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Transformation Flow Visualization */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-slate-400 font-medium">
                  Transformation Architecture
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left: Input */}
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-slate-500">SOURCE MEDIA ({config.mediaLibraryHostPath})</span>
                      <span className="font-mono text-slate-400">{formatBytes(selectedItem.mediaFile.sizeBytes)}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-200 break-all font-semibold">
                      {selectedItem.mediaFile.relativePath}
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1 flex items-center gap-2">
                      <span>Codec: {selectedItem.mediaFile.codec || 'H.264 / AAC'}</span>
                      <span>•</span>
                      <span>Res: {selectedItem.mediaFile.resolution || '1080p'}</span>
                    </div>
                  </div>

                  {/* Right: Output */}
                  <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-cyan-400">
                      <span className="font-mono">STREAM POINTER ({config.strmLibraryHostPath})</span>
                      <span className="font-mono text-cyan-300">{selectedItem.strmContent.length} bytes</span>
                    </div>
                    <p className="text-xs font-mono text-cyan-200 break-all font-semibold">
                      {selectedItem.strmRelativePath}
                    </p>
                    <div className="text-[11px] font-mono text-cyan-400/80 pt-1">
                      {Math.round((1 - (selectedItem.strmContent.length / selectedItem.mediaFile.sizeBytes)) * 10000) / 100}% storage reduction!
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive File Input & Output Directory Path Editor */}
              <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5" />
                    Edit File Input & Output Mapping
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Example: The General (1926).mp4 → The General (1926).strm
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">
                      SOURCE INPUT PATH (Inside {config.mediaLibraryHostPath})
                    </label>
                    <input
                      type="text"
                      value={selectedItem.mediaFile.relativePath}
                      onChange={(e) =>
                        onUpdateFileMapping(selectedItem.mediaFile.id, {
                          relativePath: e.target.value,
                          name: e.target.value.split('/').pop() || e.target.value
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. The General (1926).mp4"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">
                      STRM OUTPUT PATH (Inside {config.strmLibraryHostPath})
                    </label>
                    <input
                      type="text"
                      value={selectedItem.strmRelativePath}
                      onChange={(e) =>
                        onUpdateFileMapping(selectedItem.mediaFile.id, {
                          customOutputPath: e.target.value
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. The General (1926).strm"
                    />
                  </div>
                </div>

                {/* Quick preset buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                  <span className="text-slate-500 text-[10px]">QUICK OUTPUT PRESETS:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const base = selectedItem.mediaFile.name.substring(0, selectedItem.mediaFile.name.lastIndexOf('.')) || selectedItem.mediaFile.name;
                      onUpdateFileMapping(selectedItem.mediaFile.id, {
                        customOutputPath: `${base}${config.fileExtension}`
                      });
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    Direct Flat ({selectedItem.mediaFile.name.substring(0, selectedItem.mediaFile.name.lastIndexOf('.')) || selectedItem.mediaFile.name}{config.fileExtension})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const base = selectedItem.mediaFile.name.substring(0, selectedItem.mediaFile.name.lastIndexOf('.')) || selectedItem.mediaFile.name;
                      onUpdateFileMapping(selectedItem.mediaFile.id, {
                        customOutputPath: `Movies/${base}/${base}${config.fileExtension}`
                      });
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    Folder per Movie
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateFileMapping(selectedItem.mediaFile.id, {
                        relativePath: 'The General (1926).mp4',
                        customOutputPath: 'The General (1926).strm',
                        name: 'The General (1926).mp4'
                      });
                    }}
                    className="px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                  >
                    Load "The General (1926)" Example
                  </button>
                </div>
              </div>

              {/* Generated STRM File Content Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400 font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    Generated {config.fileExtension} Content (Single-line HTTPS URL)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyStrm(selectedItem.strmContent)}
                      className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition flex items-center gap-1"
                    >
                      {copiedStrm ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedStrm ? 'Copied' : 'Copy Content'}</span>
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                    {selectedItem.strmContent.trim()}
                  </pre>
                </div>
                <p className="text-[11px] text-slate-400">
                  Media players read this exact file, connect to the HTTPS endpoint over TLS 1.3, and direct-stream the media with instant seeking.
                </p>
              </div>

              {/* URL Breakdown & Token Auth */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-mono uppercase text-slate-400 font-medium flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  HTTPS Stream Protocol Breakdown
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[11px] block">TARGET PROTOCOL & CIPHER</span>
                    <span className="text-slate-200">TLS 1.3 / HTTP/2 + HTTP/3 QUIC</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">SEEK ACCELERATION</span>
                    <span className="text-emerald-400">Range: bytes (HTTP 206 Partial Content)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">SECURITY SIGNATURE</span>
                    <span className="text-cyan-300">
                      {config.authMode === 'token_hmac' ? 'HMAC-SHA256 Expirable Hash' : 'Direct LAN Stream'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">CLIENT DIRECT PLAY</span>
                    <span className="text-slate-200">{config.targetMediaServer.toUpperCase()} Native Compatible</span>
                  </div>
                </div>
              </div>

              {/* Companion Files: NFO & SRT Subtitles */}
              {selectedItem.companionFiles && selectedItem.companionFiles.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase text-slate-400 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Companion Metadata & Subtitles Generated
                  </span>
                  <div className="space-y-2">
                    {selectedItem.companionFiles.map((comp, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                          <span className="text-cyan-400">{comp.filename}</span>
                          <span className="text-slate-500">{comp.content.length} bytes</span>
                        </div>
                        <pre className="text-[11px] font-mono text-slate-400 max-h-24 overflow-y-auto bg-slate-950 p-2 rounded">
                          {comp.content.slice(0, 300)}...
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              <FileVideo className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-300">No Media Item Selected</p>
              <p className="text-xs text-slate-500 mt-1">
                Select a media file from the list on the left to inspect its HTTPS stream pipeline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
