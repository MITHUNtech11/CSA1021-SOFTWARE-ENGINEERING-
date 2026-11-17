import math
from typing import Optional
from shared.models.change_point import ChangePointRecord, ChangePointType

class TwoSidedCUSUM:
    """
    Two-Sided Cumulative Sum (CUSUM) Control Chart for real-time change-point detection.
    Detects both positive upward momentum surges and downward momentum collapses.
    """
    def __init__(
        self,
        metric_name: str = "gold_diff",
        allowance_k: float = 0.5,
        threshold_h: float = 4.0,
        expected_mean: float = 0.0,
        expected_std: float = 1.0,
        match_id: str = "MATCH-DEFAULT"
    ):
        self.metric_name = metric_name
        self.allowance_k = allowance_k
        self.threshold_h = threshold_h
        self.mean = expected_mean
        self.std = max(expected_std, 1e-4)
        self.match_id = match_id
        
        self.s_plus: float = 0.0
        self.s_minus: float = 0.0
        self.count: int = 0

    def update(self, seq: int, game_time_seconds: float, value: float) -> Optional[ChangePointRecord]:
        self.count += 1
        # Normalize incoming observation
        z_t = (value - self.mean) / self.std

        # Update recursive cumulative sums
        self.s_plus = max(0.0, self.s_plus + z_t - self.allowance_k)
        self.s_minus = max(0.0, self.s_minus - z_t - self.allowance_k)

        # Check positive threshold breach
        if self.s_plus > self.threshold_h:
            score = float(self.s_plus)
            confidence = min(0.99, 1.0 - math.exp(-score / self.threshold_h))
            record = ChangePointRecord(
                match_id=self.match_id,
                tick_sequence=seq,
                game_time_seconds=game_time_seconds,
                algorithm="CUSUM",
                change_type=ChangePointType.CUSUM_MOMENTUM_SURGE,
                metric_name=self.metric_name,
                score=round(score, 3),
                confidence=round(confidence, 3),
                details={"s_plus": score, "threshold": self.threshold_h, "z_t": round(z_t, 3)}
            )
            self.s_plus = 0.0 # Reset upon alarm
            return record

        # Check negative threshold breach
        if self.s_minus > self.threshold_h:
            score = float(self.s_minus)
            confidence = min(0.99, 1.0 - math.exp(-score / self.threshold_h))
            record = ChangePointRecord(
                match_id=self.match_id,
                tick_sequence=seq,
                game_time_seconds=game_time_seconds,
                algorithm="CUSUM",
                change_type=ChangePointType.CUSUM_MOMENTUM_COLLAPSE,
                metric_name=self.metric_name,
                score=round(score, 3),
                confidence=round(confidence, 3),
                details={"s_minus": score, "threshold": self.threshold_h, "z_t": round(z_t, 3)}
            )
            self.s_minus = 0.0 # Reset upon alarm
            return record

        return None

    def reset(self):
        self.s_plus = 0.0
        self.s_minus = 0.0
        self.count = 0
