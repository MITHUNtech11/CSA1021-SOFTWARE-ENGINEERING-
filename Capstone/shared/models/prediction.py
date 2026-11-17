from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class InflectionCategory(str, Enum):
    DECISIVE_COMEBACK = "DECISIVE_COMEBACK"
    SNOWBALL_ACCELERATION = "SNOWBALL_ACCELERATION"
    OBJECTIVE_STEAL_SWING = "OBJECTIVE_STEAL_SWING"
    STALEMATE_BREAK = "STALEMATE_BREAK"
    STEADY_STATE = "STEADY_STATE"

class PredictionRecord(BaseModel):
    match_id: str = Field(..., description="Unique match identifier")
    tick_sequence: int = Field(..., ge=0, description="Associated telemetry tick sequence")
    game_time_seconds: float = Field(..., ge=0.0, description="Match time in seconds")
    win_probability_blue: float = Field(..., ge=0.0, le=1.0, description="Estimated win probability for Blue team [0.0 - 1.0]")
    win_probability_red: float = Field(..., ge=0.0, le=1.0, description="Estimated win probability for Red team [0.0 - 1.0]")
    momentum_score: float = Field(..., ge=-1.0, le=1.0, description="Normalized momentum index [-1.0 (Red) to +1.0 (Blue)]")
    is_inflection_point: bool = Field(False, description="True if this tick is flagged as a turning point")
    turning_point_impact_score: float = Field(0.0, ge=0.0, description="Magnitude of probability and momentum swing")
    inflection_category: Optional[InflectionCategory] = Field(default=None, description="Category of the inflection")
    explanation: str = Field(default="", description="Natural-language causal justification")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
