#!/usr/bin/env python3
import os, time, hmac, hashlib, urllib.parse
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

MEDIA_ROOT = os.getenv("MEDIA_DIR", "/media")
STRM_ROOT = os.getenv("STRM_DIR", "/strm-output")
STREAM_DOMAIN = os.getenv("STREAM_DOMAIN", "localhost")
STREAM_PORT = os.getenv("STREAM_PORT", "443")
TOKEN_SECRET = os.getenv("TOKEN_SECRET", "super-secret-key").encode('utf-8')
STRM_EXT = ".strm"

def build_secure_url(rel_path: str) -> str:
    path_str = urllib.parse.quote(rel_path)
    expires = int(time.time()) + 3600
    sig = hmac.new(TOKEN_SECRET, f"{path_str}:{expires}".encode(), hashlib.sha256).hexdigest()
    return f"https://{STREAM_DOMAIN}:{STREAM_PORT}/{path_str}?sig={sig}&exp={expires}"

def process_file(source_path: Path):
    if source_path.suffix.lower() not in {".mkv", ".mp4", ".avi"}: return
    rel = source_path.relative_to(MEDIA_ROOT)
    dest = Path(STRM_ROOT) / rel.with_suffix(STRM_EXT)
    dest.parent.mkdir(parents=True, exist_ok=True)
    with open(dest, "w") as f: f.write(build_secure_url(rel.as_posix()) + "\n")

class Handler(FileSystemEventHandler):
    def on_created(self, e): process_file(Path(e.src_path))
    def on_modified(self, e): process_file(Path(e.src_path))
    def on_deleted(self, e):
        dest = Path(STRM_ROOT) / Path(e.src_path).relative_to(MEDIA_ROOT).with_suffix(STRM_EXT)
        if dest.exists(): dest.unlink()

if __name__ == "__main__":
    observer = Observer()
    observer.schedule(Handler(), path=MEDIA_ROOT, recursive=True)
    observer.start()
    try:
        while True: time.sleep(1)
    except: observer.stop()
    observer.join()
