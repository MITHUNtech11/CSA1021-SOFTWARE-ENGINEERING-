import subprocess
import shutil
import sys
from enum import Enum
from typing import Optional
import numpy as np
from PIL import Image, ImageDraw

class StreamSourceType(str, Enum):
    SYNTHETIC = "SYNTHETIC"
    LOCAL_VIDEO = "LOCAL_VIDEO"
    YOUTUBE_LIVE = "YOUTUBE_LIVE"

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

    def prepare(self):
        self._video_input = self.source
        if self.source_type != StreamSourceType.YOUTUBE_LIVE:
            return
        result = subprocess.run(
            [sys.executable, "-m", "yt_dlp", "--ignore-config", "--no-playlist",
             "--js-runtimes", "node", "--socket-timeout", "5", "--extractor-retries", "0",
             "-g", "--format", "best[height<=1080]/bestvideo[height<=1080]/best",
             "--", self.source],
            capture_output=True, text=True, timeout=18,
        )
        urls = result.stdout.strip().splitlines()
        if result.returncode or not urls:
            raise RuntimeError("Could not resolve the YouTube video stream")
        self._video_input = urls[0]

    def start(self):
        if self.is_running:
            return
        if self.source_type != StreamSourceType.SYNTHETIC:
            ffmpeg = shutil.which("ffmpeg")
            if not ffmpeg:
                raise RuntimeError("FFmpeg is required for video sources")
            if not hasattr(self, "_video_input"):
                self.prepare()
            protocols = "file" if self.source_type == StreamSourceType.LOCAL_VIDEO else "https,http,tcp,tls,crypto"
            self._ffmpeg_process = subprocess.Popen(
                [ffmpeg, "-nostdin", "-protocol_whitelist", protocols, "-i", self._video_input,
                 "-map", "0:v:0", "-vf", f"fps={self.fps},scale={self.width}:{self.height}",
                 "-pix_fmt", "rgb24", "-threads", "1", "-f", "rawvideo", "-"],
                stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            )
        self._frame_count = 0
        self.is_running = True

    def stop(self):
        self.is_running = False
        process = self._ffmpeg_process
        self._ffmpeg_process = None
        if process:
            if process.poll() is None:
                process.kill()
            process.wait(timeout=2)

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
            if process.wait(timeout=2) or self.source_type == StreamSourceType.YOUTUBE_LIVE:
                raise RuntimeError("Video stream disconnected")
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
