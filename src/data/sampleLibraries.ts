import { MediaFile } from '../types';

export const SAMPLE_MEDIA_LIBRARIES: { id: string; name: string; description: string; files: MediaFile[] }[] = [
  {
    id: 'cinema-tv',
    name: 'Home Cinema & 4K HDR Series',
    description: 'Popular mixed library of 4K/1080p feature films, multi-episode TV seasons, and audio tracks.',
    files: [
      {
        id: 'the-general-1926',
        name: 'The General (1926).mp4',
        relativePath: 'The General (1926).mp4',
        customOutputPath: 'The General (1926).strm',
        sizeBytes: 1540000000,
        durationSec: 4740,
        extension: 'mp4',
        resolution: '1920x1080',
        codec: 'AVC / Mono Audio',
        mediaType: 'movie',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        id: 'mov-1',
        name: 'Inception.2010.2160p.UHD.Remux.HEVC.TrueHD.mkv',
        relativePath: 'Movies/Inception (2010)/Inception.2010.2160p.UHD.Remux.HEVC.TrueHD.mkv',
        sizeBytes: 54100000000,
        durationSec: 8880,
        extension: 'mkv',
        resolution: '3840x2160',
        codec: 'HEVC / TrueHD Atmos',
        mediaType: 'movie',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        id: 'mov-2',
        name: 'Dune.Part.Two.2024.1080p.WEBRip.DDP5.1.Atmos.x264.mkv',
        relativePath: 'Movies/Dune Part Two (2024)/Dune.Part.Two.2024.1080p.WEBRip.DDP5.1.Atmos.x264.mkv',
        sizeBytes: 8400000000,
        durationSec: 9960,
        extension: 'mkv',
        resolution: '1920x1080',
        codec: 'H.264 / E-AC-3',
        mediaType: 'movie',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
      },
      {
        id: 'mov-3',
        name: 'Interstellar.2014.IMAX.1080p.BluRay.x265.10bit.DTS-HD.MA.5.1.mkv',
        relativePath: 'Movies/Interstellar (2014)/Interstellar.2014.IMAX.1080p.BluRay.x265.10bit.DTS-HD.MA.5.1.mkv',
        sizeBytes: 14200000000,
        durationSec: 10140,
        extension: 'mkv',
        resolution: '1920x1080',
        codec: 'HEVC 10bit / DTS-HD MA',
        mediaType: 'movie',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
      },
      {
        id: 'tv-1',
        name: 'Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mkv',
        relativePath: 'TV Shows/Breaking Bad/Season 01/Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mkv',
        sizeBytes: 3100000000,
        durationSec: 3480,
        extension: 'mkv',
        resolution: '1920x1080',
        codec: 'H.264 / AC-3 5.1',
        mediaType: 'episode',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      },
      {
        id: 'tv-2',
        name: 'Breaking.Bad.S01E02.Cat.in.the.Bag.1080p.BluRay.x264.mkv',
        relativePath: 'TV Shows/Breaking Bad/Season 01/Breaking.Bad.S01E02.Cat.in.the.Bag.1080p.BluRay.x264.mkv',
        sizeBytes: 2950000000,
        durationSec: 2880,
        extension: 'mkv',
        resolution: '1920x1080',
        codec: 'H.264 / AC-3 5.1',
        mediaType: 'episode',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
      },
      {
        id: 'tv-3',
        name: 'Severance.S01E01.Good.News.About.Hell.2160p.ATVP.WEB-DL.mkv',
        relativePath: 'TV Shows/Severance/Season 01/Severance.S01E01.Good.News.About.Hell.2160p.ATVP.WEB-DL.mkv',
        sizeBytes: 5200000000,
        durationSec: 3360,
        extension: 'mkv',
        resolution: '3840x2160',
        codec: 'HEVC Dolby Vision / Atmos',
        mediaType: 'episode',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
      }
    ]
  },
  {
    id: 'cloud-debrid',
    name: 'Cloud S3 / WebDAV / Debrid Mount',
    description: 'High-bandwidth remote media streams mapped via virtual filesystem into lightweight STRM stubs.',
    files: [
      {
        id: 'cld-1',
        name: 'Oppenheimer.2023.2160p.UHD.BluRay.x265.TrueHD.mkv',
        relativePath: 'CloudMedia/Movies/Oppenheimer (2023)/Oppenheimer.2023.2160p.UHD.BluRay.x265.TrueHD.mkv',
        sizeBytes: 78500000000,
        durationSec: 10800,
        extension: 'mkv',
        resolution: '3840x2160',
        codec: 'HEVC HDR10 / TrueHD 7.1',
        mediaType: 'movie',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        id: 'cld-2',
        name: 'Planet.Earth.III.S01E01.Coasts.2160p.UHD.HDR.mkv',
        relativePath: 'CloudMedia/Documentaries/Planet Earth III (2023)/S01E01.Coasts.2160p.UHD.HDR.mkv',
        sizeBytes: 11200000000,
        durationSec: 3540,
        extension: 'mkv',
        resolution: '3840x2160',
        codec: 'HEVC HLG / E-AC-3',
        mediaType: 'episode',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
      },
      {
        id: 'cld-3',
        name: 'Cosmos.Laundromat.First.Cycle.1080p.mp4',
        relativePath: 'CloudMedia/Shorts/Cosmos Laundromat (2015)/Cosmos.Laundromat.First.Cycle.1080p.mp4',
        sizeBytes: 1800000000,
        durationSec: 720,
        extension: 'mp4',
        resolution: '1920x1080',
        codec: 'AVC / AAC Stereo',
        mediaType: 'clip',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
      }
    ]
  }
];

export const DEFAULT_CONFIG: import('../types').StrmConfig = {
  domain: 'myhomelab.duckdns.org',
  httpsPort: 443,
  httpPort: 80,
  protocol: 'https',
  pathPrefix: '/stream',
  fileExtension: '.strm',
  authMode: 'token_hmac',
  tokenSecret: 'k3y_s3cr3t_str34m_h4sh_9921',
  tokenTtlMinutes: 1440, // 24 hours
  urlEncoding: true,
  targetMediaServer: 'jellyfin',
  webServer: 'caddy',
  sslMode: 'letsencrypt',
  letsEncryptEmail: 'marcodido69@gmail.com',
  includeSubtitles: true,
  includeNfoStubs: true,
  mediaLibraryHostPath: '/DATA/Media',
  strmLibraryHostPath: '/DATA/AppData/strm-library',
  platformPreset: 'casaos',
  enableCasaOsMetadata: true,
  pathMappingMode: 'mirror',
  githubRepoOwner: 'marcodido69',
  githubRepoName: 'docker-strm-https-engine',
  useDuckDns: true,
  duckDnsSubdomain: 'myhomelab',
  duckDnsToken: 'duckdns-token-demo-84920',
  useNginxProxyManager: true,
  npmAdminPort: 81,
  portabilityMode: 'global_duckdns',
  tailscaleDomain: 'my-nas.tailnet-xyz.ts.net',
  localMdnsDomain: 'zimaos.local'
};
