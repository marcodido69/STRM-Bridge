import React, { useState, useMemo } from 'react';
import { StrmConfig, MediaFile, StrmItem } from './types';
import { SAMPLE_MEDIA_LIBRARIES, DEFAULT_CONFIG } from './data/sampleLibraries';
import { generateStrmItem } from './utils/strmGenerator';
import { createDockerZipBundle, createPortableStrmOnlyZipBundle, downloadBlob } from './utils/zipExporter';
import { Header } from './components/Header';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { TransformerPanel } from './components/TransformerPanel';
import { PortabilityHub } from './components/PortabilityHub';
import { DockerComposeView } from './components/DockerComposeView';
import { HttpsStreamPlayer } from './components/HttpsStreamPlayer';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { ConfigModal } from './components/ConfigModal';
import { GitHubPublisher } from './components/GitHubPublisher';

import { PlayerCompatibilityLab } from './components/PlayerCompatibilityLab';

export default function App() {
  const [config, setConfig] = useState<StrmConfig>(DEFAULT_CONFIG);
  const [activePresetId, setActivePresetId] = useState<string>('cinema-tv');
  const [customFiles, setCustomFiles] = useState<MediaFile[]>([]);
  const [fileOverrides, setFileOverrides] = useState<Record<string, Partial<MediaFile>>>({});
  const [activeTab, setActiveTab] = useState<TabType>('transformer');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isDownloadingPortable, setIsDownloadingPortable] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Compute active media files with overrides applied
  const currentFiles = useMemo(() => {
    let baseFiles: MediaFile[] = [];
    if (activePresetId === 'custom') {
      baseFiles = customFiles;
    } else {
      const preset = SAMPLE_MEDIA_LIBRARIES.find((p) => p.id === activePresetId);
      baseFiles = preset ? [...preset.files, ...customFiles] : customFiles;
    }

    return baseFiles.map((file) => {
      const override = fileOverrides[file.id];
      return override ? { ...file, ...override } : file;
    });
  }, [activePresetId, customFiles, fileOverrides]);

  const handleUpdateFileMapping = (
    fileId: string,
    updates: { relativePath?: string; customOutputPath?: string; name?: string }
  ) => {
    setFileOverrides((prev) => ({
      ...prev,
      [fileId]: { ...prev[fileId], ...updates }
    }));
  };

  // Compute generated STRM items dynamically based on current configuration
  const strmItems = useMemo(() => {
    return currentFiles.map((file) => generateStrmItem(file, config));
  }, [currentFiles, config]);

  // Find currently selected item
  const selectedItem = useMemo(() => {
    if (!selectedItemId && strmItems.length > 0) {
      return strmItems[0];
    }
    return strmItems.find((item) => item.mediaFile.id === selectedItemId) || strmItems[0] || null;
  }, [strmItems, selectedItemId]);

  const handleUpdateConfig = (updated: Partial<StrmConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    setSelectedItemId(null);
  };

  const handleAddCustomFiles = (fileList: FileList) => {
    const newItems: MediaFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const extension = f.name.split('.').pop()?.toLowerCase() || 'mp4';
      const isVideo = ['mp4', 'mkv', 'webm', 'mov', 'avi', 'ts'].includes(extension);
      const isAudio = ['flac', 'mp3', 'wav', 'aac', 'm4a'].includes(extension);

      // Create an object URL for in-browser playback testing if it's a browser-friendly video
      let videoSrc: string | undefined = undefined;
      if (['mp4', 'webm'].includes(extension)) {
        try {
          videoSrc = URL.createObjectURL(f);
        } catch {
          // fallback
        }
      }

      newItems.push({
        id: `custom-${Date.now()}-${i}`,
        name: f.name,
        relativePath: `CustomUploads/${f.name}`,
        sizeBytes: f.size || 1024 * 1024 * 50,
        durationSec: 3600,
        extension,
        mediaType: isVideo ? 'movie' : isAudio ? 'track' : 'clip',
        resolution: '1920x1080',
        codec: isVideo ? 'AVC / AAC' : 'FLAC Audio',
        videoSrc,
        custom: true
      });
    }

    setCustomFiles((prev) => [...newItems, ...prev]);
    if (newItems.length > 0) {
      setSelectedItemId(newItems[0].id);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      const blob = await createDockerZipBundle(config, strmItems);
      downloadBlob(blob, `docker-strm-https-stack-${config.domain}.zip`);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleDownloadPortableZip = async () => {
    try {
      setIsDownloadingPortable(true);
      const blob = await createPortableStrmOnlyZipBundle(config, strmItems);
      downloadBlob(blob, `portable-strm-library-${config.domain}.zip`);
    } catch (err) {
      console.error('Failed to generate portable zip:', err);
    } finally {
      setIsDownloadingPortable(false);
    }
  };

  const handlePlayInSimulator = (item: StrmItem) => {
    setSelectedItemId(item.mediaFile.id);
    setActiveTab('player');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Header */}
      <Header
        config={config}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onDownloadZip={handleDownloadZip}
        isDownloadingZip={isDownloadingZip}
        onDownloadPortableStrms={handleDownloadPortableZip}
        isDownloadingPortable={isDownloadingPortable}
        totalItems={strmItems.length}
      />

      {/* Main Tab Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        strmCount={strmItems.length}
      />

      {/* Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'transformer' && (
          <TransformerPanel
            files={currentFiles}
            strmItems={strmItems}
            selectedItem={selectedItem}
            onSelectItem={(item) => setSelectedItemId(item.mediaFile.id)}
            config={config}
            onAddCustomFiles={handleAddCustomFiles}
            onSelectPreset={handleSelectPreset}
            activePresetId={activePresetId}
            onPlayInSimulator={handlePlayInSimulator}
            onUpdateFileMapping={handleUpdateFileMapping}
            onUpdateConfig={handleUpdateConfig}
          />
        )}

        {activeTab === 'portability' && (
          <PortabilityHub
            config={config}
            onUpdateConfig={handleUpdateConfig}
            strmItems={strmItems}
            selectedItem={selectedItem}
            onSelectItem={(item) => setSelectedItemId(item.mediaFile.id)}
            onPlayInSimulator={handlePlayInSimulator}
          />
        )}

        {activeTab === 'docker' && (
          <DockerComposeView
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onDownloadZip={handleDownloadZip}
            isDownloadingZip={isDownloadingZip}
          />
        )}

        {activeTab === 'compatibility' && (
          <PlayerCompatibilityLab
            config={config}
            onUpdateConfig={handleUpdateConfig}
            strmItems={strmItems}
            selectedItem={selectedItem}
            onSelectItem={(item) => setSelectedItemId(item.mediaFile.id)}
          />
        )}

        {activeTab === 'player' && (
          <HttpsStreamPlayer
            strmItems={strmItems}
            selectedItem={selectedItem}
            onSelectItem={(item) => setSelectedItemId(item.mediaFile.id)}
            config={config}
          />
        )}

        {activeTab === 'github' && (
          <GitHubPublisher
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onDownloadZip={handleDownloadZip}
            isDownloadingZip={isDownloadingZip}
          />
        )}

        {activeTab === 'guide' && <ArchitectureGuide />}
      </main>

      {/* Settings Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070A0F] py-4 text-center text-xs text-slate-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Docker STRM HTTPS Stream Engine • High-Performance Byte-Range 206 Streaming</span>
          <span className="text-slate-500">Supports Jellyfin, Plex, Emby, Kodi, and Infuse</span>
        </div>
      </footer>
    </div>
  );
}
