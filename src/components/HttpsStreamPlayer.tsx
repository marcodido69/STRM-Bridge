import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ShieldCheck,
  Activity,
  ArrowRight,
  Wifi,
  Lock,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Server
} from 'lucide-react';
import { StrmItem, StrmConfig } from '../types';
import { formatBytes, formatDuration } from '../utils/strmGenerator';

interface HttpsStreamPlayerProps {
  strmItems: StrmItem[];
  selectedItem: StrmItem | null;
  onSelectItem: (item: StrmItem) => void;
  config: StrmConfig;
}

export const HttpsStreamPlayer: React.FC<HttpsStreamPlayerProps> = ({
  strmItems,
  selectedItem,
  onSelectItem,
  config
}) => {
  const activeItem = selectedItem || strmItems[0];
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [seekOffsetBytes, setSeekOffsetBytes] = useState(0);
  const [liveBitrate, setLiveBitrate] = useState(18.4);
  const [requestCount, setRequestCount] = useState(1);
  const [lastRequestTime, setLastRequestTime] = useState<Date>(new Date());

  // Derive video URL for in-browser playback
  const playbackUrl =
    activeItem?.mediaFile.videoSrc ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const totalFileSize = activeItem?.mediaFile.sizeBytes || 8400000000;

  // Handle time update and buffer progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setCurrentTime(cur);

      // Estimate byte offset based on media duration and total size
      const ratio = cur / dur;
      const byteOffset = Math.floor(ratio * totalFileSize);
      setSeekOffsetBytes(byteOffset);

      // Buffered ranges
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBufferedPercent(Math.min(100, Math.round((bufferedEnd / dur) * 100)));
      }

      // Fluctuating bitrate simulation
      setLiveBitrate(parseFloat((16 + Math.sin(cur) * 4.2).toFixed(1)));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setRequestCount((prev) => prev + 1);
      setLastRequestTime(new Date());

      const dur = videoRef.current.duration || 1;
      const byteOffset = Math.floor((newTime / dur) * totalFileSize);
      setSeekOffsetBytes(byteOffset);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                HTTPS Stream Transmission Lab
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                TLS 1.3 Handshake Verified
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-100 mt-0.5">
              Live In-Browser Stream Playback & Byte-Range Telemetry
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Simulates client media players (Jellyfin/Plex/Kodi) resolving the .strm URL and issuing encrypted Range: bytes requests to your Docker HTTPS endpoint.
            </p>
          </div>

          {/* Quick Stream Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Active Stream:</span>
            <select
              value={activeItem?.mediaFile.id}
              onChange={(e) => {
                const found = strmItems.find((item) => item.mediaFile.id === e.target.value);
                if (found) {
                  onSelectItem(found);
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setCurrentTime(0);
                    setRequestCount((prev) => prev + 1);
                  }
                }
              }}
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {strmItems.map((item) => (
                <option key={item.mediaFile.id} value={item.mediaFile.id}>
                  {item.mediaFile.name.slice(0, 40)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Player + Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Video Player (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0B0F17] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
            {/* Live Video Element */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src={playbackUrl}
                crossOrigin="anonymous"
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              />

              {/* Watermark overlay */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700/60 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 pointer-events-none">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>HTTPS 206 PARTIAL</span>
              </div>

              {/* Center Play Overlay when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 transition transform hover:scale-105 cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </button>
              )}
            </div>

            {/* Custom Player Controls */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
              {/* Timeline scrubber */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatDuration(currentTime)}</span>
                  <span className="text-cyan-400">
                    Seek Byte: {formatBytes(seekOffsetBytes)} / {formatBytes(totalFileSize)}
                  </span>
                  <span>{formatDuration(duration || activeItem?.mediaFile.durationSec)}</span>
                </div>
              </div>

              {/* Buttons row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <div className="text-xs font-mono text-slate-300">
                    {isMuted ? '(Muted for autoplay)' : 'Audio Active'}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>{liveBitrate} Mbps Stream</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stream Pointer Info Box */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Active .strm pointer file location
            </span>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 break-all">
              /strm-output/{activeItem?.strmRelativePath}
            </div>
            <div className="text-[11px] text-slate-400">
              When Jellyfin/Plex encounters this file, it directly connects to the HTTPS URL below without fetching the whole file to local disk.
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time HTTPS Transmission Inspector (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Real-Time Request / Response Header Monitor */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  HTTPS Protocol & Headers Monitor
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                HTTP/2 206 Partial Content
              </span>
            </div>

            {/* Request Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">CLIENT REQUEST #{requestCount}</span>
                <span>{lastRequestTime.toLocaleTimeString()}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300 overflow-x-auto">
                <div className="text-cyan-300 font-semibold">
                  GET {config.pathPrefix}/{encodeURIComponent(activeItem?.mediaFile.name || '')} HTTP/2
                </div>
                <div>Host: {config.domain}:{config.httpsPort}</div>
                <div>User-Agent: Jellyfin-MediaPlayer/10.9 (DirectStream; Linux x86_64)</div>
                <div className="text-amber-300 font-semibold">
                  Range: bytes={seekOffsetBytes}-{seekOffsetBytes + 10485760}
                </div>
                <div>Accept: */*</div>
                <div>Accept-Encoding: identity</div>
                {config.authMode === 'token_hmac' && (
                  <div className="text-slate-400">
                    X-Stream-Token: {config.tokenSecret.slice(0, 8)}... (HMAC-SHA256)
                  </div>
                )}
                <div>Sec-Fetch-Mode: cors</div>
              </div>
            </div>

            {/* Response Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400 font-semibold">SERVER RESPONSE ({config.webServer.toUpperCase()})</span>
                <span className="text-emerald-400">206 Partial Content</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300 overflow-x-auto">
                <div className="text-emerald-400 font-semibold">
                  HTTP/2 206 Partial Content
                </div>
                <div className="text-amber-300 font-semibold">
                  Content-Range: bytes {seekOffsetBytes}-{Math.min(totalFileSize, seekOffsetBytes + 10485760)}/{totalFileSize}
                </div>
                <div>Content-Length: 10485760</div>
                <div className="text-cyan-300 font-semibold">
                  Accept-Ranges: bytes
                </div>
                <div>Content-Type: video/{activeItem?.mediaFile.extension === 'mkv' ? 'x-matroska' : 'mp4'}</div>
                <div>Server: {config.webServer === 'caddy' ? 'Caddy' : 'nginx/1.25.4'}</div>
                <div>Strict-Transport-Security: max-age=31536000; includeSubDomains</div>
                <div>Access-Control-Allow-Origin: *</div>
                <div>Access-Control-Expose-Headers: Content-Range, Content-Length, Accept-Ranges</div>
              </div>
            </div>

            {/* TLS Handshake Specifications */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                TLS 1.3 Security Channel
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">CIPHER SUITE</span>
                  <span className="text-slate-200">TLS_AES_256_GCM_SHA384</span>
                </div>
                <div>
                  <span className="text-slate-500 block">KEY EXCHANGE</span>
                  <span className="text-slate-200">ECDH (X25519, 253 bits)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ALPN NEGOTIATION</span>
                  <span className="text-cyan-300">h2, h3 (HTTP/3 QUIC)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CERTIFICATE AUTHORITY</span>
                  <span className="text-slate-200">
                    {config.sslMode === 'letsencrypt' ? "Let's Encrypt R3" : 'Caddy Internal Root CA'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
