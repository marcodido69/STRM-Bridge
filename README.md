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
1. Open your ZimaOS or CasaOS dashboard.
2. Go to the App Store and click the **"+"** (Install custom app) button.
3. Select **"Import"**.
4. Paste the content of your `docker-compose.yml` file into the editor.
5. The system will auto-detect volumes, ports, and metadata. Configure your media and STRM library paths as prompted.
6. Click **"Submit"** to deploy.

### Method B: Standard Docker / CLI
1. **Prerequisites**: Ensure Docker Engine and Docker Compose v2 are installed.
2. **Clone the repository**:
   ```bash
   git clone https://github.com/marcodido69/STRM-Bridge.git
   cd STRM-Bridge
   ```
3. **Configure Environment**: Copy the template and edit paths:
   ```bash
   cp .env.example .env
   # Edit .env and set your absolute paths
   # MEDIA_DIR=/path/to/media
   # STRM_DIR=/path/to/strm-output
   ```
4. **Deploy**:
   ```bash
   docker compose up -d
   ```
5. **Logs**: Check the transformation status:
   ```bash
   docker compose logs -f strm-transformer
   ```

## License
This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
