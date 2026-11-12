import JSZip from 'jszip';
import { StrmItem, StrmConfig } from '../types';
import { generateDockerArtifacts } from './dockerGenerator';

export async function createDockerZipBundle(
  config: StrmConfig,
  strmItems: StrmItem[]
): Promise<Blob> {
  const zip = new JSZip();
  const artifacts = generateDockerArtifacts(config);

  // Root Docker files
  zip.file('docker-compose.yml', artifacts.composeYaml);
  zip.file('Dockerfile', artifacts.dockerfile);
  zip.file('generate_strm.py', artifacts.pythonScript);
  zip.file(artifacts.webServerConfig.filename, artifacts.webServerConfig.content);
  zip.file('.env', artifacts.envFile);
  zip.file('README.md', artifacts.readme);
  zip.file('LICENSE', artifacts.license);
  zip.file('publish_to_github.sh', artifacts.gitPublishCommands, { unixPermissions: '755' });
  zip.file('npm_advanced_config.txt', artifacts.npmAdvancedConfig);

  // Shell helper script
  const startScript = `#!/usr/bin/env bash
set -e
echo "Starting Docker STRM HTTPS Stream Engine..."
docker compose up -d --build
echo "Containers running. Check logs with: docker compose logs -f"
`;
  zip.file('start.sh', startScript, { unixPermissions: '755' });

  // Add the generated STRM library folder!
  const strmFolder = zip.folder('strm-library');
  if (strmFolder) {
    for (const item of strmItems) {
      strmFolder.file(item.strmRelativePath, item.strmContent);
      if (item.companionFiles) {
        for (const comp of item.companionFiles) {
          strmFolder.file(comp.filename, comp.content);
        }
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

export async function createPortableStrmOnlyZipBundle(
  config: StrmConfig,
  strmItems: StrmItem[]
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Add all .strm files in their relative folder hierarchy
  for (const item of strmItems) {
    zip.file(item.strmRelativePath, item.strmContent);
    if (item.companionFiles) {
      for (const comp of item.companionFiles) {
        zip.file(comp.filename, comp.content);
      }
    }
  }

  // 2. Generate companion M3U8 Master Playlist for instant VLC / Infuse / IPTV import
  let m3uContent = '#EXTM3U\n#EXTENC: UTF-8\n';
  for (const item of strmItems) {
    const title = item.mediaFile.name.replace(/\.[^/.]+$/, '').replace(/\./g, ' ');
    const duration = item.mediaFile.durationSec || -1;
    m3uContent += `#EXTINF:${duration},${title}\n${item.httpsUrl}\n\n`;
  }
  zip.file('portable_master_playlist.m3u8', m3uContent);

  // 3. Portability Quick Start Guide
  const portableGuide = `# Portable STRM Media Library

## What is this?
This archive contains your entire media library represented purely as **lightweight .strm pointer files** (under 1MB total!).
Each .strm file contains a direct, secure HTTPS streaming URL pointing to your server (\`${config.domain}\`).

## Why .STRM Portability is Game-Changing
1. **Zero Storage Needed**: You can keep a 50 TB movie and TV catalog on a USB thumb drive, Google Drive, or email attachment.
2. **Instant Play Anywhere**: Drop these files into **Plex**, **Emby**, **Jellyfin**, **Infuse**, or **VLC** on any laptop, tablet, Smart TV, or remote VPS.
3. **Hardware Acceleration**: Video is streamed on-demand with HTTP \`Range: bytes\` keyframe seeking.

## How to Use on Different Players:
- **VLC**: Drag and drop any \`.strm\` file directly into VLC, or drag \`portable_master_playlist.m3u8\` to open all movies as a playlist!
- **Plex / Emby / Jellyfin**: Copy this folder into your media server's library directory. The server will scan the .strm files and download posters, actors, and metadata automatically.
- **Mobile (iOS / Android)**: Open \`portable_master_playlist.m3u8\` in VLC or Infuse.
`;
  zip.file('PORTABILITY_GUIDE.md', portableGuide);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
