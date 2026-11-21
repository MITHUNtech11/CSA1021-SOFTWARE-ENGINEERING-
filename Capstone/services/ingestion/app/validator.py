from typing import List, Dict
from shared.models.telemetry import TelemetryTick

class OutOfOrderBuffer:
    """
    Sliding window jitter and sequence buffer for streaming ticks.
    Collects arriving ticks and ensures they are yielded in strictly sequential sequence_id order.
    """
    def __init__(self, window_size: int = 10, initial_sequence: int = 0):
        self.window_size = window_size
        self.expected_sequence = initial_sequence
        self.buffer: Dict[int, TelemetryTick] = {}

    def push(self, tick: TelemetryTick) -> List[TelemetryTick]:
        if tick.sequence_id < self.expected_sequence:
            # Stale tick already processed
            return []

        self.buffer[tick.sequence_id] = tick
        released: List[TelemetryTick] = []

        # Enforce sliding window: if gap between max sequence and expected sequence
        # exceeds window_size, advance expected_sequence to prevent stalling on dropped packets
        if self.buffer:
            max_seq = max(self.buffer.keys())
            if max_seq - self.expected_sequence >= self.window_size:
                self.expected_sequence = min(self.buffer.keys())

        while self.expected_sequence in self.buffer:
            next_tick = self.buffer.pop(self.expected_sequence)
            released.append(next_tick)
            self.expected_sequence += 1

        return released

    def flush(self) -> List[TelemetryTick]:
        # Flush all remaining sorted items
        sorted_keys = sorted(self.buffer.keys())
        released = [self.buffer.pop(k) for k in sorted_keys]
        if released:
            self.expected_sequence = released[-1].sequence_id + 1
        return released
