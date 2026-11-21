import numpy as np
from services.ingestion.app.stream_reader import LiveStreamWorker, StreamSourceType

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
