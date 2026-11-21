import json
import asyncio
from pathlib import Path
from typing import List, Optional
from shared.models.telemetry import TelemetryTick

class MatchSimulator:
    """
    Replays historical esports telemetry ticks at variable playback speeds (1x, 2x, 5x, 10x).
    """
    def __init__(self, ticks: Optional[List[TelemetryTick]] = None):
        self.ticks: List[TelemetryTick] = ticks or []
        self.current_index: int = 0
        self.is_playing: bool = False
        self.playback_speed: float = 1.0
        self._task: Optional[asyncio.Task] = None

    @classmethod
    def load_from_file(cls, json_path: Path) -> "MatchSimulator":
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        ticks = [TelemetryTick(**item) for item in data.get("timeline", [])]
        return cls(ticks=ticks)

    @property
    def total_ticks(self) -> int:
        return len(self.ticks)

    def step(self) -> Optional[TelemetryTick]:
        if self.current_index < len(self.ticks):
            tick = self.ticks[self.current_index]
            self.current_index += 1
            return tick
        self.is_playing = False
        return None

    def seek(self, target_sequence: int) -> Optional[TelemetryTick]:
        for idx, t in enumerate(self.ticks):
            if t.sequence_id == target_sequence:
                self.current_index = idx + 1
                return t
        return None

    def reset(self):
        self.current_index = 0
        self.is_playing = False

    def get_status(self) -> dict:
        current_tick = self.ticks[self.current_index - 1] if 0 < self.current_index <= len(self.ticks) else None
        return {
            "is_playing": self.is_playing,
            "playback_speed": self.playback_speed,
            "current_index": self.current_index,
            "total_ticks": self.total_ticks,
            "current_game_time": current_tick.game_time_seconds if current_tick else 0.0
        }
