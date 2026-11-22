import json
import re
import subprocess
import shutil
import sys
from tempfile import TemporaryFile
from urllib.parse import urlsplit
from enum import Enum
from typing import Optional
import numpy as np
from PIL import Image, ImageDraw

class StreamSourceType(str, Enum):
    SYNTHETIC = "SYNTHETIC"
    LOCAL_VIDEO = "LOCAL_VIDEO"
    YOUTUBE_LIVE = "YOUTUBE_LIVE"

class VideoSourceError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


# Forward downloader headers required by the media origin. Credentials stay with the extractor.
MEDIA_HEADERS = {"accept", "accept-language", "origin", "referer", "sec-fetch-mode", "user-agent"}
YOUTUBE_FORMAT = (
    "bv*[protocol^=m3u8][height<=1080]/bv*[protocol=https][height<=1080]"
    "/bv*[protocol^=m3u8]/bv*[protocol=https]"
)


class LiveStreamWorker:
    """
    Ingests live broadcast frames from YouTube Live streams, local video files,
    or generates realistic synthetic VCT broadcast frames.
    """
    def __init__(
        self,
        source: str = "SYNTHETIC",
        source_type: StreamSourceType = StreamSourceType.SYNTHETIC,
        fps: float = 1.0,
        width: int = 1920,
        height: int = 1080
    ):
        self.source = source
        self.source_type = source_type
        self.fps = fps
        self.width = width
        self.height = height
        self.is_running = False
        self._frame_count = 0
        self._ffmpeg_process: Optional[subprocess.Popen] = None
        self._ffmpeg_errors = None
        self._video_input: str | None = None
        self._headers = ""

    def prepare(self):
        if self.source_type != StreamSourceType.YOUTUBE_LIVE:
            self._video_input = self.source
            return
        result = subprocess.run(
            [sys.executable, "-m", "yt_dlp", "--ignore-config", "--no-playlist",
             "--js-runtimes", "node", "--socket-timeout", "5", "--extractor-retries", "0",
             "--dump-single-json", "--format", YOUTUBE_FORMAT, "--", self.source],
            capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=18,
        )
        if result.returncode:
            detail = result.stderr.lower()
            if "sign in" in detail or "private video" in detail or "members-only" in detail:
                raise VideoSourceError("YouTube requires sign-in or permission for this video. Try a publicly playable broadcast.")
            if "not available" in detail or "unavailable" in detail:
                raise VideoSourceError("This YouTube video is unavailable. Check the link or try another broadcast.")
            raise VideoSourceError("YouTube did not provide a playable video stream. Check the link or try another broadcast.")
        try:
            metadata = json.loads(result.stdout)
            resolved_url = metadata["url"]
            if not isinstance(resolved_url, str):
                raise ValueError
            parsed = urlsplit(resolved_url)
            if parsed.scheme not in {"http", "https"} or not parsed.hostname:
                raise ValueError
        except (KeyError, TypeError, ValueError):
            raise VideoSourceError("YouTube did not provide a supported media URL.") from None

        headers = metadata.get("http_headers")
        if not isinstance(headers, dict):
            headers = {}
        self._headers = "".join(
            f"{name}: {value}\r\n"
            for name, value in headers.items()
            if name.lower() in MEDIA_HEADERS and isinstance(value, str) and "\r" not in value and "\n" not in value
        )
        self._video_input = resolved_url

    def start(self):
        if self.is_running:
            return
        if self.source_type != StreamSourceType.SYNTHETIC:
            ffmpeg = shutil.which("ffmpeg")
            if not ffmpeg:
                raise VideoSourceError("FFmpeg is missing from the gateway PATH.", status_code=503)
            if self._video_input is None:
                self.prepare()
            protocols = "file" if self.source_type == StreamSourceType.LOCAL_VIDEO else "https,http,tcp,tls,crypto"
            args = [ffmpeg, "-nostdin", "-loglevel", "error", "-protocol_whitelist", protocols]
            if self._headers:
                args.extend(["-headers", self._headers])
            errors = TemporaryFile()
            try:
                self._ffmpeg_process = subprocess.Popen(
                    [*args, "-i", self._video_input, "-map", "0:v:0",
                     "-vf", f"fps={self.fps},scale={self.width}:{self.height}",
                     "-pix_fmt", "rgb24", "-threads", "1", "-f", "rawvideo", "-"],
                    stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=errors,
                )
            except OSError:
                errors.close()
                raise
            self._ffmpeg_errors = errors
        self._frame_count = 0
        self.is_running = True

    def stop(self):
        self.is_running = False
        process = self._ffmpeg_process
        errors = self._ffmpeg_errors
        self._ffmpeg_process = self._ffmpeg_errors = None
        if process:
            if process.poll() is None:
                process.kill()
            process.wait(timeout=2)
            if process.stdout:
                process.stdout.close()
        if errors:
            errors.close()

    def _decode_error(self) -> VideoSourceError:
        errors = self._ffmpeg_errors
        if self.source_type == StreamSourceType.LOCAL_VIDEO:
            return VideoSourceError("FFmpeg could not decode this recording. Check that it contains a playable video track.", 422)
        if errors:
            errors.seek(max(0, errors.seek(0, 2) - 8192))
            # Decoder diagnostics can contain signed media URLs. Report only a bounded classification.
            detail = errors.read().decode("utf-8", errors="replace").lower()
            status = re.search(r"(?:http error|server returned) (401|403|404|410|429|5[0-9]{2})", detail)
            if status:
                code = status[1]
                if code in {"401", "403"}:
                    return VideoSourceError(f"YouTube?s media server rejected access (HTTP {code}). Try a publicly playable broadcast.")
                if code in {"404", "410"}:
                    return VideoSourceError("YouTube?s media stream ended or is unavailable. Try starting it again or choose another broadcast.")
                if code == "429":
                    return VideoSourceError("YouTube is rate-limiting media requests. Wait a moment and try again.")
                return VideoSourceError(f"YouTube?s media server failed (HTTP {code}). Try again shortly.")
        return VideoSourceError("FFmpeg could not decode video from YouTube. Try another publicly playable broadcast.")

    def read_frame(self) -> Optional[np.ndarray]:
        if not self.is_running:
            return None
        if self.source_type == StreamSourceType.SYNTHETIC:
            self._frame_count += 1
            return self._generate_synthetic_broadcast_frame(self._frame_count)

        process = self._ffmpeg_process
        if process and process.stdout:
            size = self.width * self.height * 3
            frame_bytes = process.stdout.read(size)
            if len(frame_bytes) == size:
                self._frame_count += 1
                return np.frombuffer(frame_bytes, np.uint8).reshape(self.height, self.width, 3)
            if not self.is_running:
                return None
            if process.wait(timeout=2):
                raise self._decode_error()
        return None

    def _generate_synthetic_broadcast_frame(self, step: int) -> np.ndarray:
        """
        Synthesizes a realistic VCT 1080p broadcast frame simulating round progression.
        """
        img = Image.new("RGB", (self.width, self.height), color=(15, 23, 42))
        draw = ImageDraw.Draw(img)

        # Dynamic match progression:
        # Step 1-3: 5v5 opening phase
        # Step 4-6: First blood pick (5v4)
        # Step 7-10: Spike plant on A-Site (4v3, Spike planted)
        # Step 11-14: TenZ clutch scenario (1v2, Spike planted)
        # Step 15+: Round win & reset
        alive_blue = 5
        alive_red = 5
        spike_planted = False

        if 4 <= step <= 6:
            alive_red = 4
        elif 7 <= step <= 10:
            alive_blue = 4
            alive_red = 3
            spike_planted = True
        elif 11 <= step <= 14:
            alive_blue = 1  # TenZ 1v2 clutch!
            alive_red = 2
            spike_planted = True
        elif step >= 15:
            alive_blue = 1
            alive_red = 0
            spike_planted = False

        # Draw Blue Team Roster (5 agents on top left)
        for i in range(5):
            x = int(80 + i * 65)
            y = 20
            w, h = 50, 45
            if i < alive_blue:
                draw.rectangle([x, y, x + w, y + h], fill=(35, 175, 225))
            else:
                draw.rectangle([x, y, x + w, y + h], fill=(35, 38, 45))
                draw.line([x, y, x + w, y + h], fill=(180, 40, 40), width=2)

        # Draw Red Team Roster (5 agents on top right)
        for i in range(5):
            x = int(1520 + i * 65)
            y = 20
            w, h = 50, 45
            if i < alive_red:
                draw.rectangle([x, y, x + w, y + h], fill=(235, 95, 45))
            else:
                draw.rectangle([x, y, x + w, y + h], fill=(35, 38, 45))
                draw.line([x, y, x + w, y + h], fill=(180, 40, 40), width=2)

        # Center Objective / Spike ROI
        cx, cy, cw, ch = 935, 22, 50, 42
        if spike_planted:
            draw.rectangle([cx, cy, cx + cw, cy + ch], fill=(225, 25, 35))
        else:
            draw.rectangle([cx, cy, cx + cw, cy + ch], fill=(20, 25, 35))

        return np.array(img)
