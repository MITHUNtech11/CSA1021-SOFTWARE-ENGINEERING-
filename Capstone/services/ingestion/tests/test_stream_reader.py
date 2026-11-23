import io
import json
import subprocess

import pytest
import numpy as np
from services.ingestion.app import stream_reader
from services.ingestion.app.stream_reader import LiveStreamWorker, StreamSourceType, VideoSourceError

def test_stream_worker_synthetic_generation():
    worker = LiveStreamWorker(source_type=StreamSourceType.SYNTHETIC, fps=2.0)
    worker.start()
    frames = []
    
    # Generate 5 synthetic frames
    for _ in range(5):
        frame = worker.read_frame()
        assert frame is not None
        assert isinstance(frame, np.ndarray)
        assert frame.shape == (1080, 1920, 3)
        frames.append(frame)

    assert len(frames) == 5
    worker.stop()

def test_stream_worker_lifecycle():
    worker = LiveStreamWorker(source_type=StreamSourceType.SYNTHETIC)
    assert worker.is_running is False
    
    worker.start()
    assert worker.is_running is True
    
    worker.stop()
    assert worker.is_running is False


def test_youtube_media_headers_reach_ffmpeg_without_credentials(monkeypatch):
    resolved_url = "https://media.example.test/video"
    metadata = {
        "url": resolved_url,
        "http_headers": {
            "User-Agent": "Fixture player",
            "Referer": "https://www.youtube.com/",
            "Cookie": "fixture",
            "Origin": "invalid\r\nExtra: header",
        },
    }
    monkeypatch.setattr(stream_reader.subprocess, "run", lambda *args, **kwargs: subprocess.CompletedProcess(
        args[0], 0, stdout=json.dumps(metadata), stderr="",
    ))
    monkeypatch.setattr(stream_reader.shutil, "which", lambda name: name)
    command = []

    class Decoder:
        stdout = io.BytesIO(bytes([1, 2, 3]))

        def __init__(self, args, **kwargs):
            command.extend(args)

        def poll(self):
            return 0

        def wait(self, timeout):
            return 0

    monkeypatch.setattr(stream_reader.subprocess, "Popen", Decoder)
    worker = LiveStreamWorker(source_type=StreamSourceType.YOUTUBE_LIVE, width=1, height=1)
    worker.start()
    try:
        assert command[command.index("-headers") + 1] == (
            "User-Agent: Fixture player\r\nReferer: https://www.youtube.com/\r\n"
        )
        assert command[command.index("-i") + 1] == resolved_url
        assert worker.read_frame().tolist() == [[[1, 2, 3]]]
        assert worker.read_frame() is None
    finally:
        worker.stop()


def test_youtube_decoder_reports_upstream_http_error_without_signed_url():
    worker = LiveStreamWorker(source_type=StreamSourceType.YOUTUBE_LIVE)
    worker._ffmpeg_errors = io.BytesIO(b"HTTP error 403 Forbidden at https://media.example.test/?signature=secret")
    error = worker._decode_error()
    assert error.status_code == 502
    assert "HTTP 403" in str(error)
    assert "secret" not in str(error)


def test_private_youtube_rejection_is_actionable(monkeypatch):
    monkeypatch.setattr(stream_reader.subprocess, "run", lambda *args, **kwargs: subprocess.CompletedProcess(
        args[0], 1, stdout="", stderr="ERROR: Private video. Sign in if you've been granted access",
    ))
    worker = LiveStreamWorker(source_type=StreamSourceType.YOUTUBE_LIVE)
    with pytest.raises(VideoSourceError, match="requires sign-in"):
        worker.prepare()


def test_youtube_resolver_rate_limit_on_hosted_gateway(monkeypatch):
    monkeypatch.setattr(stream_reader.subprocess, "run", lambda *args, **kwargs: subprocess.CompletedProcess(
        args[0], 1, stdout="", stderr="ERROR: Unable to download API page: HTTP Error 429: Too Many Requests",
    ))
    worker = LiveStreamWorker(source_type=StreamSourceType.YOUTUBE_LIVE)
    with pytest.raises(VideoSourceError, match="rate-limiting this gateway") as error:
        worker.prepare()
    assert error.value.status_code == 503
