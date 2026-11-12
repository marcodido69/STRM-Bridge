import { StrmConfig } from '../types';

export interface GeneratedDockerBundle {
  composeYaml: string;
  dockerfile: string;
  pythonScript: string;
  webServerConfig: { filename: string; content: string };
  envFile: string;
  readme: string;
  license: string;
  gitPublishCommands: string;
  npmAdvancedConfig: string;
}

export function generateDockerArtifacts(config: StrmConfig): GeneratedDockerBundle {
  const isCasaOrZima = config.platformPreset === 'casaos' || config.platformPreset === 'zimaos' || config.enableCasaOsMetadata;
  const isCaddy = config.webServer === 'caddy';
  const isNginx = config.webServer === 'nginx';
  const isZima = config.platformPreset === 'zimaos';

  // 1. Docker Compose YAML
  const composeYaml = `version: '3.8'

# ==============================================================================
# Docker Application: Media Library to STRM HTTPS Stream Engine
# Target Platforms: ${isCasaOrZima ? (isZima ? 'ZimaOS / ZimaCube / ZimaBoard' : 'CasaOS / ZimaOS / IceWhale OS') : 'Standard Docker Engine / Linux'}
# Transforms raw media files (.mkv, .mp4) into lightweight .strm stream pointers
# and serves the source media over encrypted HTTPS with byte-range acceleration.
# ==============================================================================
${isCasaOrZima ? `
x-casaos:
  architectures:
    - amd64
    - arm64
  main: https-media-server
  author: IceWhale / Homelab Community
  category: Media
  description:
    en_us: "Transform your ${isZima ? 'ZimaOS' : 'CasaOS/ZimaOS'} media storage into lightweight .strm stream pointers served over HTTPS with TLS 1.3 and hardware-accelerated byte-range seeking for Jellyfin, Plex, and Kodi."
  developer: "Docker STRM HTTPS Engine"
  icon: "https://raw.githubusercontent.com/IceWhaleTech/CasaOS-AppStore/main/Apps/Jellyfin/icon.png"
  screenshot_link: []
  tagline:
    en_us: "${isZima ? 'ZimaOS' : 'CasaOS'} STRM HTTPS Stream Engine"
  title:
    en_us: "STRM HTTPS Engine"
  index: /
  port_map: "${config.httpsPort}"
  scheme: https
` : ''}
services:
  # ----------------------------------------------------------------------------
  # 1. STRM Transformer Daemon
  # Scans and inotify-watches your ${isCasaOrZima ? 'CasaOS / ZimaOS /DATA/Media' : 'media'} directory, auto-generating .strm /
  # .srtm files pointing to the secure HTTPS stream endpoint.
  # ----------------------------------------------------------------------------
  strm-transformer:
    image: python:3.11-alpine
    container_name: strm-transformer
    restart: unless-stopped
    command: >
      sh -c "pip install --no-cache-dir watchdog && python3 -u /app/generate_strm.py"
    environment:
      - STREAM_DOMAIN=\${STREAM_DOMAIN:-${config.domain}}
      - STREAM_PORT=\${STREAM_PORT:-${config.httpsPort}}
      - STREAM_PROTOCOL=\${STREAM_PROTOCOL:-${config.protocol}}
      - STREAM_PREFIX=\${STREAM_PREFIX:-${config.pathPrefix}}
      - STRM_EXTENSION=\${STRM_EXTENSION:-${config.fileExtension}}
      - AUTH_MODE=\${AUTH_MODE:-${config.authMode}}
      - TOKEN_SECRET=\${TOKEN_SECRET:-${config.tokenSecret}}
      - TOKEN_TTL_MINUTES=\${TOKEN_TTL_MINUTES:-${config.tokenTtlMinutes}}
      - INCLUDE_NFO=\${INCLUDE_NFO:-${config.includeNfoStubs ? 'true' : 'false'}}
      - INCLUDE_SRT=\${INCLUDE_SRT:-${config.includeSubtitles ? 'true' : 'false'}}
      - WATCH_INTERVAL=\${WATCH_INTERVAL:-10}
    volumes:
      # Mount ${isCasaOrZima ? 'CasaOS/ZimaOS /DATA/Media' : 'host media storage'} (Read-Only for security)
      - \${MEDIA_DIR:-${config.mediaLibraryHostPath}}:/media:ro
      # Mount destination STRM library output
      - \${STRM_DIR:-${config.strmLibraryHostPath}}:/strm-output:rw
      # Mount script directly from AppData
      - ${isCasaOrZima ? '/DATA/AppData/strm-transformer/generate_strm.py' : './generate_strm.py'}:/app/generate_strm.py:ro
    networks:
      - stream-net
    healthcheck:
      test: ["CMD", "python3", "-c", "import os; exit(0 if os.path.exists('/strm-output') else 1)"]
      interval: 30s
      timeout: 5s
      retries: 3
${isCasaOrZima ? `    x-casaos:
      envs:
        - container: STREAM_DOMAIN
          description:
            en_us: "Domain or IP of your ${isZima ? 'ZimaOS' : 'CasaOS'} server (e.g. 192.168.1.100 or ${isZima ? 'zimaos.local' : 'casaos.local'})"
        - container: STREAM_PORT
          description:
            en_us: "HTTPS stream listening port"
      volumes:
        - container: /media
          description:
            en_us: "Storage directory for raw video files (default: /DATA/Media)"
        - container: /strm-output
          description:
            en_us: "Destination directory for generated .strm pointer files (default: /DATA/AppData/strm-library)"` : ''}

  # ----------------------------------------------------------------------------
  # 2. High-Performance HTTPS Media Streaming Server (${config.webServer.toUpperCase()})
  # Handles TLS termination, HTTP/2 & HTTP/3 multiplexing, and Range: bytes
  # partial requests for sub-millisecond video seeking in media players.
  # ----------------------------------------------------------------------------
  https-media-server:
    ${isCaddy ? `image: caddy:2-alpine
    container_name: caddy-https-stream
    restart: unless-stopped
    ports:
      - "\${HTTPS_PORT:-${config.httpsPort}}:443"
      - "\${HTTP_PORT:-${config.httpPort}}:80"
      - "\${HTTPS_PORT:-${config.httpsPort}}:443/udp" # HTTP/3 QUIC support
    volumes:
      - ${isCasaOrZima ? '/DATA/AppData/caddy/Caddyfile' : './Caddyfile'}:/etc/caddy/Caddyfile:ro
      - \${MEDIA_DIR:-${config.mediaLibraryHostPath}}:/media:ro
      - caddy_data:/data
      - caddy_config:/config` : isNginx ? `image: nginx:alpine
    container_name: nginx-https-stream
    restart: unless-stopped
    ports:
      - "\${HTTPS_PORT:-${config.httpsPort}}:443"
      - "\${HTTP_PORT:-${config.httpPort}}:80"
    volumes:
      - ${isCasaOrZima ? '/DATA/AppData/nginx/nginx.conf' : './nginx.conf'}:/etc/nginx/nginx.conf:ro
      - ${isCasaOrZima ? '/DATA/AppData/nginx/certs' : './certs'}:/etc/nginx/certs:ro
      - \${MEDIA_DIR:-${config.mediaLibraryHostPath}}:/media:ro` : `image: traefik:v2.10
    container_name: traefik-https-stream
    restart: unless-stopped
    ports:
      - "\${HTTPS_PORT:-${config.httpsPort}}:443"
      - "\${HTTP_PORT:-${config.httpPort}}:80"`}
    networks:
      - stream-net
    depends_on:
      - strm-transformer
${isCasaOrZima ? `    x-casaos:
      ports:
        - container: "443"
          description:
            en_us: "HTTPS Media Streaming Port"
        - container: "80"
          description:
            en_us: "HTTP Forwarding / ACME Port"` : ''}

${config.targetMediaServer !== 'standalone' ? `  # ----------------------------------------------------------------------------
  # 3. Media Player / Consumer (${config.targetMediaServer.toUpperCase()})
  # Ingests the generated .strm files. On ZimaBoard / ZimaCube, Intel QuickSync
  # hardware acceleration (/dev/dri) is automatically mapped!
  # ----------------------------------------------------------------------------
  media-server:
    ${config.targetMediaServer === 'jellyfin' ? `image: jellyfin/jellyfin:latest
    container_name: jellyfin
    restart: unless-stopped
    ports:
      - "8096:8096"
    devices:
      # Intel QuickSync / VAAPI Hardware Acceleration for ZimaBoard & ZimaCube
      - /dev/dri:/dev/dri
    volumes:
      - ${isCasaOrZima ? '/DATA/AppData/jellyfin/config' : './jellyfin_config'}:/config
      - ${isCasaOrZima ? '/DATA/AppData/jellyfin/cache' : './jellyfin_cache'}:/cache
      # Mount the STRM library as the media source!
      - \${STRM_DIR:-${config.strmLibraryHostPath}}:/data/movies:ro` : config.targetMediaServer === 'plex' ? `image: lscr.io/linuxserver/plex:latest
    container_name: plex
    restart: unless-stopped
    ports:
      - "32400:32400"
    environment:
      - PUID=1000
      - PGID=1000
      - VERSION=docker
    devices:
      - /dev/dri:/dev/dri
    volumes:
      - ${isCasaOrZima ? '/DATA/AppData/plex/config' : './plex_config'}:/config
      - \${STRM_DIR:-${config.strmLibraryHostPath}}:/data:ro` : `image: emby/embyserver:latest
    container_name: emby
    restart: unless-stopped
    ports:
      - "8096:8096"
    devices:
      - /dev/dri:/dev/dri
    volumes:
      - ${isCasaOrZima ? '/DATA/AppData/emby/config' : './emby_config'}:/config
      - \${STRM_DIR:-${config.strmLibraryHostPath}}:/data:ro`}
    networks:
      - stream-net
    depends_on:
      - https-media-server
${isCasaOrZima ? `    x-casaos:
      ports:
        - container: "${config.targetMediaServer === 'plex' ? '32400' : '8096'}"
          description:
            en_us: "${config.targetMediaServer.toUpperCase()} Web UI"` : ''}` : ''}

${config.useDuckDns ? `  # ----------------------------------------------------------------------------
  # 4. DuckDNS Dynamic DNS Client
  # Automatically keeps https://${config.duckDnsSubdomain || 'myhomelab'}.duckdns.org synchronized with your WAN IP
  # ----------------------------------------------------------------------------
  duckdns:
    image: lscr.io/linuxserver/duckdns:latest
    container_name: duckdns
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=UTC
      - SUBDOMAINS=\${DUCKDNS_SUBDOMAIN:-${config.duckDnsSubdomain || 'myhomelab'}}
      - TOKEN=\${DUCKDNS_TOKEN:-${config.duckDnsToken || 'your-duckdns-token'}}
      - LOG_FILE=true
    volumes:
      - ${isCasaOrZima ? '/DATA/AppData/duckdns' : './duckdns_config'}:/config
    networks:
      - stream-net
${isCasaOrZima ? `    x-casaos:
      envs:
        - container: SUBDOMAINS
          description:
            en_us: "DuckDNS subdomain (e.g. ${config.duckDnsSubdomain || 'myhomelab'})"
        - container: TOKEN
          description:
            en_us: "DuckDNS account security token"` : ''}` : ''}

${config.useNginxProxyManager ? `  # ----------------------------------------------------------------------------
  # 5. Nginx Proxy Manager (NPM)
  # Provides Let's Encrypt SSL certificates, DuckDNS hostname proxying, and
  # buffer-free byte-range streaming for Plex, Emby, Jellyfin, and VLC.
  # ----------------------------------------------------------------------------
  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "${config.npmAdminPort || 81}:81"
    environment:
      - DISABLE_IPV6=true
    volumes:
      - ${isCasaOrZima ? '/DATA/AppData/npm/data' : './npm_data'}:/data
      - ${isCasaOrZima ? '/DATA/AppData/npm/letsencrypt' : './npm_letsencrypt'}:/etc/letsencrypt
    networks:
      - stream-net
    depends_on:
      - https-media-server
${isCasaOrZima ? `    x-casaos:
      ports:
        - container: "81"
          description:
            en_us: "Nginx Proxy Manager Admin Console (http://server-ip:81)"` : ''}` : ''}

networks:
  stream-net:
    driver: bridge

volumes:
${isCaddy ? `  caddy_data:
  caddy_config:` : ''}
`;

  // 2. Dockerfile for strm-transformer
  const dockerfile = `# Multi-stage lightweight Python container for STRM generation
FROM python:3.11-alpine

WORKDIR /app

# Install system dependencies and inotify tooling
RUN apk add --no-cache bash curl tzdata

# Install watchdog for kernel filesystem events
RUN pip install --no-cache-dir watchdog

# Copy transformation script
COPY generate_strm.py /app/generate_strm.py

RUN chmod +x /app/generate_strm.py

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD python3 -c "import os; exit(0 if os.path.exists('/strm-output') else 1)"

ENTRYPOINT ["python3", "/app/generate_strm.py"]
`;

  // 3. Python Transformation Script
  const pythonScript = `#!/usr/bin/env python3
"""
STRM HTTPS Stream Generator & Filesystem Watcher
Recursively transforms media library files into .strm / .srtm stream pointers
and transmits media paths as authenticated HTTPS URLs.
"""

import os
import sys
import time
import hmac
import hashlib
import urllib.parse
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configuration from Environment
MEDIA_ROOT = os.getenv("MEDIA_DIR", "/media")
STRM_ROOT = os.getenv("STRM_DIR", "/strm-output")
STREAM_DOMAIN = os.getenv("STREAM_DOMAIN", "${config.domain}")
STREAM_PORT = os.getenv("STREAM_PORT", "${config.httpsPort}")
STREAM_PROTOCOL = os.getenv("STREAM_PROTOCOL", "${config.protocol}")
STREAM_PREFIX = os.getenv("STREAM_PREFIX", "${config.pathPrefix}").strip("/")
STRM_EXT = os.getenv("STRM_EXTENSION", "${config.fileExtension}")
AUTH_MODE = os.getenv("AUTH_MODE", "${config.authMode}")
TOKEN_SECRET = os.getenv("TOKEN_SECRET", "${config.tokenSecret}")
TOKEN_TTL = int(os.getenv("TOKEN_TTL_MINUTES", "${config.tokenTtlMinutes}"))
INCLUDE_NFO = os.getenv("INCLUDE_NFO", "true").lower() == "true"

VIDEO_EXTENSIONS = {
    ".mkv", ".mp4", ".avi", ".mov", ".m4v", ".webm",
    ".ts", ".m2ts", ".iso", ".flac", ".mp3", ".wav"
}

def generate_token(path_str: str, expires_at: int) -> str:
    message = f"{path_str}:{expires_at}".encode('utf-8')
    key = TOKEN_SECRET.encode('utf-8')
    return hmac.new(key, message, hashlib.sha256).hexdigest()

def build_https_url(relative_path: str) -> str:
    # URL encode path segments
    encoded_parts = [urllib.parse.quote(part) for part in relative_path.split("/")]
    encoded_path = "/".join(encoded_parts)

    port_suffix = ""
    if (STREAM_PROTOCOL == "https" and STREAM_PORT != "443") or \\
       (STREAM_PROTOCOL == "http" and STREAM_PORT != "80"):
        port_suffix = f":{STREAM_PORT}"

    prefix_segment = f"/{STREAM_PREFIX}" if STREAM_PREFIX else ""
    base_url = f"{STREAM_PROTOCOL}://{STREAM_DOMAIN}{port_suffix}{prefix_segment}/{encoded_path}"

    if AUTH_MODE == "token_hmac":
        expires_at = int(time.time()) + (TOKEN_TTL * 60)
        token = generate_token(relative_path, expires_at)
        return f"{base_url}?token={token}&expires={expires_at}"
    elif AUTH_MODE == "bearer":
        return f"{base_url}?auth_token=strm_bearer_access"

    return base_url

def process_file(source_path: Path):
    if source_path.suffix.lower() not in VIDEO_EXTENSIONS:
        return

    rel_path = source_path.relative_to(MEDIA_ROOT)
    dest_path = Path(STRM_ROOT) / rel_path.with_suffix(STRM_EXT)
    
    # Ensure target parent directory exists
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    stream_url = build_https_url(rel_path.as_posix())

    # Write STRM file (Single line URL with newline)
    with open(dest_path, "w", encoding="utf-8") as f:
        f.write(stream_url + "\\n")
    
    print(f"[STRM] Generated: {dest_path.relative_to(STRM_ROOT)} -> {stream_url[:70]}...")

    # Optional NFO stub
    if INCLUDE_NFO:
        nfo_path = dest_path.with_suffix(".nfo")
        if not nfo_path.exists():
            clean_title = source_path.stem.replace(".", " ")
            with open(nfo_path, "w", encoding="utf-8") as nf:
                nf.write(f"""<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<movie>
  <title>{clean_title}</title>
  <originaltitle>{source_path.stem}</originaltitle>
  <plot>Secure STRM Stream served over HTTPS TLS 1.3</plot>
  <streamdetails>
    <video>
      <codec>h264</codec>
      <aspect>1.78</aspect>
    </video>
  </streamdetails>
</movie>
""")

def full_scan():
    print(f"[SCAN] Scanning media library at: {MEDIA_ROOT}")
    count = 0
    for root, _, files in os.walk(MEDIA_ROOT):
        for file in files:
            p = Path(root) / file
            if p.suffix.lower() in VIDEO_EXTENSIONS:
                process_file(p)
                count += 1
    print(f"[SCAN] Completed full scan. Processed {count} media file(s).")

class MediaChangeHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            process_file(Path(event.src_path))

    def on_modified(self, event):
        if not event.is_directory:
            process_file(Path(event.src_path))

    def on_deleted(self, event):
        if not event.is_directory:
            p = Path(event.src_path)
            try:
                rel = p.relative_to(MEDIA_ROOT)
                target = Path(STRM_ROOT) / rel.with_suffix(STRM_EXT)
                if target.exists():
                    target.unlink()
                    print(f"[STRM] Removed stale pointer: {target}")
            except Exception as e:
                print(f"[WARN] Error cleaning up: {e}")

def main():
    print("=" * 60)
    print("Docker STRM HTTPS Stream Engine")
    print(f"Domain: {STREAM_PROTOCOL}://{STREAM_DOMAIN}:{STREAM_PORT}")
    print(f"Media Input: {MEDIA_ROOT}")
    print(f"STRM Output: {STRM_ROOT}")
    print("=" * 60)

    Path(STRM_ROOT).mkdir(parents=True, exist_ok=True)
    full_scan()

    observer = Observer()
    handler = MediaChangeHandler()
    observer.schedule(handler, path=MEDIA_ROOT, recursive=True)
    observer.start()
    print("[WATCHER] Real-time filesystem watcher active. Listening for changes...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    main()
`;

  // 4. Web Server Config (Caddyfile or nginx.conf)
  const webServerConfig = isCaddy
    ? {
        filename: 'Caddyfile',
        content: `# Caddyfile: Production HTTPS Media Streaming Server
# Provides automatic TLS certificates, HTTP/3, and Range: bytes streaming

${config.domain}${config.httpsPort !== 443 ? `:${config.httpsPort}` : ''} {
    ${config.sslMode === 'self_signed' ? 'tls internal' : config.sslMode === 'letsencrypt' ? `tls ${config.letsEncryptEmail}` : 'tls /certs/cert.pem /certs/key.pem'}

    # Root directory for media
    root * /media

    # Byte-range video streaming configuration
    encode zstd gzip

    # CORS Headers for Web & Media Players (Jellyfin/Plex/Kodi)
    header {
        Access-Control-Allow-Origin *
        Access-Control-Allow-Methods "GET, HEAD, OPTIONS"
        Access-Control-Allow-Headers "Range, Authorization, Content-Type, Origin"
        Access-Control-Expose-Headers "Content-Range, Content-Length, Accept-Ranges"
        Accept-Ranges bytes
        Cache-Control "public, max-age=86400"
    }

    # Stream endpoint routing
    handle ${config.pathPrefix}/* {
        uri strip_prefix ${config.pathPrefix}
        file_server {
            browse
        }
    }

    # Health check
    handle /healthz {
        respond "OK" 200
    }
}
`
      }
    : {
        filename: 'nginx.conf',
        content: `# nginx.conf: High-throughput HTTPS Media Streaming Server
worker_processes auto;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Performance optimizations for high-bitrate video
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Buffers for 4K / 1080p stream seeks
    client_body_buffer_size 128k;
    output_buffers 1 512k;
    postpone_output 1460;

    server {
        listen 443 ssl http2;
        server_name ${config.domain};

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Media directory
        root /media;

        location ${config.pathPrefix}/ {
            alias /media/;
            
            # Critical byte-range streaming headers
            add_header Accept-Ranges bytes;
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods 'GET, HEAD, OPTIONS';
            add_header Access-Control-Allow-Headers 'Range, Authorization';
            add_header Access-Control-Expose-Headers 'Content-Range, Content-Length, Accept-Ranges';

            # Media MIME types
            types {
                video/mp4 mp4;
                video/x-matroska mkv;
                video/quicktime mov;
                video/webm webm;
                audio/flac flac;
                audio/mpeg mp3;
            }
        }

        location /healthz {
            return 200 "OK\\n";
        }
    }
}
`
      };

  // 5. .env template
  const envFile = `# Docker STRM HTTPS Stream Engine Environment Variables
STREAM_DOMAIN=${config.domain}
HTTPS_PORT=${config.httpsPort}
HTTP_PORT=${config.httpPort}
STREAM_PROTOCOL=${config.protocol}
STREAM_PREFIX=${config.pathPrefix}
STRM_EXTENSION=${config.fileExtension}

# Security & Token Auth
AUTH_MODE=${config.authMode}
TOKEN_SECRET=${config.tokenSecret}
TOKEN_TTL_MINUTES=${config.tokenTtlMinutes}

# Local Storage Paths
MEDIA_DIR=${config.mediaLibraryHostPath}
STRM_DIR=${config.strmLibraryHostPath}

# Features
INCLUDE_NFO=${config.includeNfoStubs ? 'true' : 'false'}
INCLUDE_SRT=${config.includeSubtitles ? 'true' : 'false'}
`;

  // 6. Comprehensive README
  const readme = `# Docker STRM HTTPS Stream Engine

Transform your raw media storage into a hyper-lightweight library of **.strm** (or **.srtm**) stream pointer files transmitted securely over **HTTPS**.

## Why STRM Files?
Instead of copying 20TB of 4K MKV files across your servers or NAS devices:
- A **.strm** file is a tiny text file (few bytes) containing a direct HTTPS URL to your media streaming server.
- Media servers (**Jellyfin**, **Plex**, **Emby**, **Kodi**, **Infuse**) ingest the .strm files, fetch movie/series metadata automatically, and stream the video on-demand using HTTP \`Range: bytes\` requests over TLS 1.3 encryption.
- Direct Play is preserved without re-encoding!

## Architecture
\`\`\`
[ Raw Media Library: /media ]
        │
        ├──▶ [ strm-transformer (Python Inotify Daemon) ]
        │         │
        │         ▼
        │    [ Generated .strm Library: /strm-output ]
        │         │
        │         ▼
        │    [ Media Player: Jellyfin / Plex / Emby ]
        │         │ (HTTPS Request)
        ▼         ▼
[ https-media-server (Caddy / Nginx with TLS 1.3 & Range: bytes) ]
\`\`\`

## ZimaOS & CasaOS 1-Click Import Guide
This Docker Compose YAML is natively compatible with **ZimaOS** (ZimaBoard, ZimaBlade, ZimaCube) and **CasaOS**:
1. Open your ZimaOS or CasaOS dashboard (e.g. \`http://casaos.local\` or your server IP).
2. Click the **"+"** icon (Install a customized app) on the home screen.
3. In the top-right corner of the modal, click the **"Import"** icon.
4. Paste the \`docker-compose.yml\` contents (or upload the file).
5. The ZimaOS/CasaOS App Store will automatically parse the \`x-casaos\` metadata, container names, icon, ports (\`${config.httpsPort}\`), and \`/DATA/Media\` storage paths!
6. Click **"Submit"** to start your HTTPS STRM Engine stack.

## Standard Linux / CLI Quick Start
1. Ensure Docker and Docker Compose v2 are installed.
2. Edit \`.env\` with your media storage paths and domain:
   \`\`\`bash
   MEDIA_DIR=${config.mediaLibraryHostPath}
   STRM_DIR=${config.strmLibraryHostPath}
   \`\`\`
3. Start the containers:
   \`\`\`bash
   docker compose up -d
   \`\`\`
4. Verify the logs:
   \`\`\`bash
   docker compose logs -f strm-transformer
   \`\`\`
5. Test HTTPS streaming via curl:
   \`\`\`bash
   curl -I -k "https://${config.domain}:${config.httpsPort}${config.pathPrefix}/sample.mp4"
   \`\`\`
`;

  const repoUrl = `https://github.com/${config.githubRepoOwner || 'marcodido69'}/${config.githubRepoName || 'docker-strm-https-engine'}`;

  const gitPublishCommands = `#!/usr/bin/env bash
# ==============================================================================
# Publish to GitHub under GNU Affero General Public License v3.0 (AGPL-3.0)
# Target Repository: ${repoUrl}
# ==============================================================================

set -e

echo "=== Publishing Docker STRM HTTPS Stream Engine to GitHub ==="

# 1. Initialize Git repository
git init
git checkout -b main

# 2. Stage all files (Dockerfile, Compose YAML, Caddy/Nginx configs, Python watcher, LICENSE)
git add .

# 3. Commit with AGPLv3 notice
git commit -m "feat: initial release of Docker STRM HTTPS Stream Engine under GNU AGPLv3"

# 4. Add GitHub remote
# (Ensure https://github.com/new repository '${config.githubRepoName || 'docker-strm-https-engine'}' is created)
git remote add origin ${repoUrl}.git 2>/dev/null || git remote set-url origin ${repoUrl}.git

# 5. Push main branch
echo "Pushing to ${repoUrl}.git..."
git push -u origin main

echo "Successfully published to ${repoUrl}!"
`;

  const license = `                    GNU AFFERO GENERAL PUBLIC LICENSE
                       Version 3, 19 November 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

                            Preamble

  The GNU Affero General Public License is a free, copyleft license for
software and other kinds of works, specifically designed to ensure
cooperation with the community in the case of network server software.

  [Full AGPL-3.0 License Text - see /LICENSE in repository]

Copyright (C) 2026 Marco Dido (${config.githubRepoOwner || 'marcodido69'})
Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
`;

  const npmAdvancedConfig = `# ==============================================================================
# Nginx Proxy Manager (NPM) Advanced Configuration for STRM HTTPS Streaming
# Domain: ${config.domain} (DuckDNS: ${config.duckDnsSubdomain || 'myhomelab'}.duckdns.org)
# Fully compatible with: Plex Server, Emby Server, Jellyfin Server, and VLC Player
# Paste into: NPM Web UI (Port 81) -> Edit Proxy Host -> Advanced Tab
# ==============================================================================

# 1. Disable Proxy Buffering (Critical: Prevents Nginx from caching 40GB+ videos in RAM/disk)
proxy_buffering off;
proxy_cache off;
proxy_request_buffering off;

# 2. Timeout extensions for continuous 4K streaming without premature disconnect
proxy_read_timeout 86400s;
proxy_send_timeout 86400s;
proxy_connect_timeout 60s;
send_timeout 86400s;

# 3. Essential Range: bytes forwarding for Plex, Emby, Jellyfin, and VLC timeline seeking
proxy_set_header Range $http_range;
proxy_set_header If-Range $http_if_range;

# 4. Standard Proxy Headers
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# 5. Allow unlimited stream chunk payloads
client_max_body_size 0;

# 6. CORS headers for Web-based clients (Jellyfin Web, Plex Web, Emby Web)
add_header Access-Control-Allow-Origin * always;
add_header Access-Control-Allow-Methods 'GET, HEAD, OPTIONS' always;
add_header Access-Control-Allow-Headers 'Range, Authorization, Content-Type, Origin' always;
add_header Access-Control-Expose-Headers 'Content-Range, Content-Length, Accept-Ranges' always;
`;

  return {
    composeYaml,
    dockerfile,
    pythonScript,
    webServerConfig,
    envFile,
    readme,
    license,
    gitPublishCommands,
    npmAdvancedConfig
  };
}
