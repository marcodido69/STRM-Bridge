import { MediaFile, StrmConfig, StrmItem } from '../types';

// Simple deterministic hash for HMAC simulation in browser
function pseudoHmac(secret: string, message: string): string {
  let hash = 0x811c9dc5;
  const combined = secret + ':' + message;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8) + 'a9f28c11e4b';
}

export function generateStrmItem(file: MediaFile, config: StrmConfig): StrmItem {
  // Determine relative path replacing video extension with .strm / .srtm
  const pathParts = file.relativePath.split('/');
  const filename = pathParts[pathParts.length - 1];
  const lastDot = filename.lastIndexOf('.');
  const baseName = lastDot > 0 ? filename.substring(0, lastDot) : filename;
  const newFilename = `${baseName}${config.fileExtension}`;
  
  let strmRelativePath: string;
  if (file.customOutputPath && file.customOutputPath.trim()) {
    strmRelativePath = file.customOutputPath.trim();
  } else if (config.pathMappingMode === 'flat') {
    strmRelativePath = newFilename;
  } else if (config.pathMappingMode === 'folder_per_movie') {
    strmRelativePath = `${baseName}/${newFilename}`;
  } else {
    // 'mirror' default
    strmRelativePath = pathParts.length > 1
      ? [...pathParts.slice(0, -1), newFilename].join('/')
      : newFilename;
  }

  // Build the target HTTPS URL
  const portSegment = (config.protocol === 'https' && config.httpsPort === 443) ||
                      (config.protocol === 'http' && config.httpPort === 80)
    ? ''
    : `:${config.protocol === 'https' ? config.httpsPort : config.httpPort}`;

  const cleanPrefix = config.pathPrefix.startsWith('/') ? config.pathPrefix : `/${config.pathPrefix}`;
  const encodedPath = config.urlEncoding
    ? file.relativePath.split('/').map(segment => encodeURIComponent(segment)).join('/')
    : file.relativePath;

  let streamUrl = `${config.protocol}://${config.domain}${portSegment}${cleanPrefix}/${encodedPath}`;

  // Apply Auth Mode
  if (config.authMode === 'token_hmac') {
    const expiresAt = Math.floor(Date.now() / 1000) + (config.tokenTtlMinutes * 60);
    const token = pseudoHmac(config.tokenSecret, `${file.relativePath}:${expiresAt}`);
    streamUrl += `?token=${token}&expires=${expiresAt}`;
  } else if (config.authMode === 'basic_auth') {
    streamUrl = streamUrl.replace('://', '://mediauser:streamP@ss99@');
  } else if (config.authMode === 'bearer') {
    streamUrl += `?auth_bearer=eyJhY2Nlc3MiOiJtZWRpYV9zdHJlYW0ifQ`;
  }

  // The actual contents of the .strm file is the stream URL followed by a newline
  const strmContent = streamUrl + '\n';

  // Companion NFO or Subtitle files
  const companionFiles: { filename: string; content: string }[] = [];

  if (config.includeNfoStubs) {
    const nfoFilename = `${baseName}.nfo`;
    const isMovie = file.mediaType === 'movie';
    const nfoXml = isMovie
      ? `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<movie>
  <title>${baseName.replace(/\./g, ' ')}</title>
  <originaltitle>${baseName}</originaltitle>
  <plot>Secure HTTPS Stream generated via Docker STRM Engine. Stream Source: ${streamUrl}</plot>
  <outline>Transmitted over HTTPS TLS 1.3</outline>
  <runtime>${Math.round((file.durationSec || 7200) / 60)}</runtime>
  <fileinfo>
    <streamdetails>
      <video>
        <codec>${file.codec?.split('/')[0]?.trim() || 'h264'}</codec>
        <aspect>1.78</aspect>
        <width>${file.resolution?.split('x')[0] || '1920'}</width>
        <height>${file.resolution?.split('x')[1] || '1080'}</height>
      </video>
    </streamdetails>
  </fileinfo>
</movie>`
      : `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<episodedetails>
  <title>${baseName.replace(/\./g, ' ')}</title>
  <plot>Automated STRM stream pointer transmitted over HTTPS.</plot>
  <runtime>${Math.round((file.durationSec || 3000) / 60)}</runtime>
</episodedetails>`;

    companionFiles.push({
      filename: [...pathParts.slice(0, -1), nfoFilename].join('/'),
      content: nfoXml
    });
  }

  if (config.includeSubtitles) {
    const srtFilename = `${baseName}.en.srt`;
    const srtContent = `1
00:00:01,000 --> 00:00:04,500
[Encrypted HTTPS Media Stream Active]

2
00:00:05,000 --> 00:00:09,000
Streaming via Docker STRM Engine over TLS 1.3
`;
    companionFiles.push({
      filename: [...pathParts.slice(0, -1), srtFilename].join('/'),
      content: srtContent
    });
  }

  return {
    mediaFile: file,
    strmRelativePath,
    strmContent,
    httpsUrl: streamUrl,
    companionFiles
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '--:--';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}
