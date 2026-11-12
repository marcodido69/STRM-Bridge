#!/usr/bin/env python3
import os
import sys
import time
import hmac
import hashlib
import urllib.parse
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

MEDIA_ROOT = os.getenv("MEDIA_DIR", "/media")
STRM_ROOT = os.getenv("STRM_DIR", "/strm-output")
STREAM_DOMAIN = os.getenv("STREAM_DOMAIN", "localhost")
STREAM_PORT = os.getenv("STREAM_PORT", "443")
STREAM_PROTOCOL = os.getenv("STREAM_PROTOCOL", "https")
STRM_EXT = os.getenv("STRM_EXTENSION", ".strm")

VIDEO_EXTENSIONS = {".mkv", ".mp4", ".avi", ".mov", ".m4v", ".webm", ".ts"}

def build_https_url(relative_path: str) -> str:
    encoded_path = "/".join([urllib.parse.quote(part) for part in relative_path.split("/")])
    return f"{STREAM_PROTOCOL}://{STREAM_DOMAIN}:{STREAM_PORT}/{encoded_path}"

def process_file(source_path: Path):
    if source_path.suffix.lower() not in VIDEO_EXTENSIONS: return
    rel_path = source_path.relative_to(MEDIA_ROOT)
    dest_path = Path(STRM_ROOT) / rel_path.with_suffix(STRM_EXT)
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_path, "w", encoding="utf-8") as f:
        f.write(build_https_url(rel_path.as_posix()) + "\n")
    print(f"[STRM] Generated: {dest_path}")

# Simplified watcher logic for brevity
class MediaChangeHandler(FileSystemEventHandler):
    def on_created(self, event): process_file(Path(event.src_path))

if __name__ == "__main__":
    Path(STRM_ROOT).mkdir(parents=True, exist_ok=True)
    observer = Observer()
    observer.schedule(MediaChangeHandler(), path=MEDIA_ROOT, recursive=True)
    observer.start()
    print("Watcher active...")
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt: observer.stop()
    observer.join()
