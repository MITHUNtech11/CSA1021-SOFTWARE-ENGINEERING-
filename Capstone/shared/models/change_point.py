from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class ChangePointType(str, Enum):
    CUSUM_MOMENTUM_SURGE = "CUSUM_MOMENTUM_SURGE"
    CUSUM_MOMENTUM_COLLAPSE = "CUSUM_MOMENTUM_COLLAPSE"
    PELT_REGIME_SHIFT = "PELT_REGIME_SHIFT"
    BOCPD_BEHAVIOR_RESET = "BOCPD_BEHAVIOR_RESET"

class ChangePointRecord(BaseModel):
    match_id: str = Field(..., description="Unique match identifier")
    tick_sequence: int = Field(..., ge=0, description="Tick sequence where change point was detected")
    game_time_seconds: float = Field(..., ge=0.0, description="Match time in seconds")
    algorithm: str = Field(..., description="Algorithm name (CUSUM, PELT, BOCPD)")
    change_type: ChangePointType = Field(..., description="Classification of the change point")
    metric_name: str = Field(..., description="Underlying telemetry metric (e.g. gold_diff, kill_diff)")
    score: float = Field(..., description="Test statistic value at detection")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Statistical confidence (0.0 to 1.0)")
    details: Dict[str, Any] = Field(default_factory=dict, description="Supplementary debugging parameters")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
