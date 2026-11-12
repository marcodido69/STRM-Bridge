export type MediaType = 'movie' | 'episode' | 'track' | 'clip';

export interface MediaFile {
  id: string;
  name: string;
  relativePath: string;
  sizeBytes: number;
  durationSec?: number;
  extension: string;
  resolution?: string;
  codec?: string;
  mediaType: MediaType;
  videoSrc?: string; // URL for in-browser playback simulation
  custom?: boolean;
  customOutputPath?: string; // Allows explicit output path override (e.g. "The General (1926).strm")
}

export type WebServerType = 'caddy' | 'nginx' | 'traefik';
export type MediaServerType = 'jellyfin' | 'plex' | 'emby' | 'standalone';
export type SslMode = 'letsencrypt' | 'self_signed' | 'custom_certs';
export type AuthMode = 'none' | 'token_hmac' | 'basic_auth' | 'bearer';
export type PathMappingMode = 'mirror' | 'flat' | 'folder_per_movie';

export type PlatformPreset = 'standard' | 'casaos' | 'zimaos';
export type PortabilityMode = 'global_duckdns' | 'tailscale_vpn' | 'local_lan' | 'custom_fqdn';

export interface StrmConfig {
  domain: string;
  httpsPort: number;
  httpPort: number;
  protocol: 'https' | 'http';
  pathPrefix: string;
  fileExtension: '.strm' | '.srtm';
  authMode: AuthMode;
  tokenSecret: string;
  tokenTtlMinutes: number;
  urlEncoding: boolean;
  targetMediaServer: MediaServerType;
  webServer: WebServerType;
  sslMode: SslMode;
  letsEncryptEmail: string;
  includeSubtitles: boolean;
  includeNfoStubs: boolean;
  mediaLibraryHostPath: string;
  strmLibraryHostPath: string;
  platformPreset: PlatformPreset;
  enableCasaOsMetadata: boolean;
  pathMappingMode: PathMappingMode;
  githubRepoOwner: string;
  githubRepoName: string;
  useDuckDns: boolean;
  duckDnsSubdomain: string;
  duckDnsToken: string;
  useNginxProxyManager: boolean;
  npmAdminPort: number;
  portabilityMode: PortabilityMode;
  tailscaleDomain: string;
  localMdnsDomain: string;
}

export interface PlayerAudit {
  name: 'Plex Server' | 'Emby Server' | 'Jellyfin Server' | 'VLC Player';
  status: 'passed' | 'warning';
  version: string;
  directPlay: boolean;
  byteRangeSupport: boolean;
  mimeVerification: string;
  checks: { title: string; passed: boolean; note: string }[];
}

export interface StrmItem {
  mediaFile: MediaFile;
  strmRelativePath: string;
  strmContent: string;
  httpsUrl: string;
  companionFiles?: {
    filename: string;
    content: string;
  }[];
}

export interface StreamTransmissionStats {
  bytesLoaded: number;
  totalBytes: number;
  bitrateMbps: number;
  ttfbMs: number;
  latencyMs: number;
  tlsCipher: string;
  httpVersion: string;
  statusCode: number;
  rangeHeader: string;
  contentRange: string;
  bufferedPercent: number;
}
