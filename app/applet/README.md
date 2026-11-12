# STRM Bridge: Secure HTTPS Stream Engine

![STRM Bridge Cover](cover.png)

STRM Bridge is a high-performance, production-ready solution to bridge the gap between your physical media library and modern streaming players. It transforms bulky media files into lightweight, portable **.strm** pointer files, served securely over **HTTPS**.

## Why STRM Bridge?
Instead of duplicating terabytes of 4K video files across your NAS, home servers, or remote VPS:

- **Zero-Storage Portability**: A **.strm** file is a tiny plaintext pointer. Your entire library, no matter the size, reduces to just a few kilobytes of text.
- **Universal Compatibility**: Ingest your library into **Jellyfin**, **Plex**, **Emby**, **Kodi**, or **Infuse** on any device.
- **Encrypted Streaming**: Your media is served over **TLS 1.3 encrypted HTTPS**, supporting sub-millisecond seeking via HTTP `Range: bytes` headers.
- **Direct Play**: No re-encoding. Stream your original media files natively.

## Architecture
```text
[ Raw Media Storage ] 
        │
        ├──▶ [ strm-transformer (Python Daemon) ]──▶ [ .strm Pointers ]
        │
        ▼
[ https-media-server (Nginx/Caddy) ] ──▶ [ Media Player (Jellyfin/Plex) ]
```

## Installation

### Method A: ZimaOS / CasaOS (1-Click)
1. Open your dashboard and navigate to the App Store.
2. Click **"+"** (Install custom app) and select **"Import"**.
3. Paste the `docker-compose.yml` contents and submit.
4. The system will automatically detect the volumes and ports.

### Method B: Standard Docker / CLI
1. Ensure Docker Compose v2 is installed.
2. Edit `.env` with your storage paths:
   ```bash
   MEDIA_DIR=/path/to/your/media
   STRM_DIR=/path/to/your/strm-output
   ```
3. Start the containers:
   ```bash
   docker compose up -d
   ```

## License
This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
