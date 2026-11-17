from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator

class TeamState(BaseModel):
    team_name: str = Field(..., description="Name or code of the team (e.g. T1, WBG)")
    total_gold: int = Field(..., ge=0, description="Total accumulated team gold")
    total_kills: int = Field(..., ge=0, description="Total kills scored")
    total_deaths: int = Field(..., ge=0, description="Total deaths suffered")
    turrets_destroyed: int = Field(0, ge=0, le=11, description="Outer, inner, inhibitor, and nexus turrets (0-11)")
    dragons: int = Field(0, ge=0, le=7, description="Elemental, elder dragons secured")
    barons: int = Field(0, ge=0, le=5, description="Baron Nashor kills")
    vision_score: float = Field(0.0, ge=0.0, description="Aggregated vision control score")

class TelemetryTick(BaseModel):
    match_id: str = Field(..., description="Unique match identifier")
    sequence_id: int = Field(..., ge=0, description="Strictly monotonic tick index (0, 1, 2...)")
    game_time_seconds: float = Field(..., ge=0.0, description="In-game time elapsed in seconds")
    blue_team: TeamState = Field(..., description="Blue side team telemetry")
    red_team: TeamState = Field(..., description="Red side team telemetry")
    gold_diff: int = Field(0, description="Blue gold minus Red gold")
    kill_diff: int = Field(0, description="Blue kills minus Red kills")
    turret_diff: int = Field(0, description="Blue turrets minus Red turrets")
    dragon_diff: int = Field(0, description="Blue dragons minus Red dragons")
    baron_diff: int = Field(0, description="Blue barons minus Red barons")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="before")
    @classmethod
    def compute_differentials(cls, values: Any) -> Any:
        if isinstance(values, dict):
            blue = values.get("blue_team")
            red = values.get("red_team")
            if isinstance(blue, dict) and isinstance(red, dict):
                values["gold_diff"] = blue.get("total_gold", 0) - red.get("total_gold", 0)
                values["kill_diff"] = blue.get("total_kills", 0) - red.get("total_kills", 0)
                values["turret_diff"] = blue.get("turrets_destroyed", 0) - red.get("turrets_destroyed", 0)
                values["dragon_diff"] = blue.get("dragons", 0) - red.get("dragons", 0)
                values["baron_diff"] = blue.get("barons", 0) - red.get("barons", 0)
            elif isinstance(blue, TeamState) and isinstance(red, TeamState):
                values["gold_diff"] = blue.total_gold - red.total_gold
                values["kill_diff"] = blue.total_kills - red.total_kills
                values["turret_diff"] = blue.turrets_destroyed - red.turrets_destroyed
                values["dragon_diff"] = blue.dragons - red.dragons
                values["baron_diff"] = blue.barons - red.barons
        return values
