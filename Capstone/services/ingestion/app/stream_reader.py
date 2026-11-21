import logging
import subprocess
import shutil
from enum import Enum
from typing import Optional
import numpy as np
from PIL import Image, ImageDraw

logger = logging.getLogger("stream_reader")

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

    def start(self):
        self.is_running = True
        self._frame_count = 0
        if self.source_type in [StreamSourceType.LOCAL_VIDEO, StreamSourceType.YOUTUBE_LIVE]:
            self._start_ffmpeg_stream()

    def stop(self):
        self.is_running = False
        if self._ffmpeg_process:
            try:
                self._ffmpeg_process.kill()
            except Exception:
                pass
            self._ffmpeg_process = None

    def _start_ffmpeg_stream(self):
        """
        Spawns FFmpeg to pipe RGB24 frames from the stream into memory.
        """
        video_url = self.source
        if self.source_type == StreamSourceType.YOUTUBE_LIVE:
            # Resolve HLS manifest via yt-dlp if available
            try:
                cmd = ["yt-dlp", "-g", "--format", "best[height<=1080]", self.source]
                res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
                if res.returncode == 0 and res.stdout.strip():
                    video_url = res.stdout.strip().splitlines()[0]
            except Exception as e:
                logger.warning(f"yt-dlp resolution fallback: {e}")

        ffmpeg_bin = shutil.which("ffmpeg") or "ffmpeg"
        ffmpeg_cmd = [
            ffmpeg_bin,
            "-i", video_url,
            "-vf", f"fps={self.fps},scale={self.width}:{self.height}",
            "-f", "image2pipe",
            "-pix_fmt", "rgb24",
            "-vcodec", "rawvideo",
            "-"
        ]
        try:
            self._ffmpeg_process = subprocess.Popen(
                ffmpeg_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                bufsize=self.width * self.height * 3
            )
        except Exception as e:
            logger.error(f"Failed to start FFmpeg worker: {e}")
            self.source_type = StreamSourceType.SYNTHETIC

    def read_frame(self) -> Optional[np.ndarray]:
        """
        Reads the next 1920x1080 RGB frame.
        """
        if not self.is_running:
            self.start()

        if self.source_type == StreamSourceType.SYNTHETIC:
            self._frame_count += 1
            return self._generate_synthetic_broadcast_frame(self._frame_count)

        if self._ffmpeg_process and self._ffmpeg_process.stdout:
            frame_bytes = self._ffmpeg_process.stdout.read(self.width * self.height * 3)
            if not frame_bytes or len(frame_bytes) < self.width * self.height * 3:
                # Stream ended or disconnected, fall back gracefully
                return None
            self._frame_count += 1
            frame = np.frombuffer(frame_bytes, np.uint8).reshape((self.height, self.width, 3))
            return frame

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
