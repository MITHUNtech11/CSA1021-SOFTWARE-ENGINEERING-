import math
from enum import Enum
from typing import Tuple, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from services.analytics.app.vision.hud_analyzer import ValorantHUDState

class ValorantInflectionType(str, Enum):
    OPENING_PICK = "OPENING_PICK"
    MAN_ADVANTAGE_SWING = "MAN_ADVANTAGE_SWING"
    SPIKE_PLANTED = "SPIKE_PLANTED"
    CLUTCH_IN_PROGRESS = "CLUTCH_IN_PROGRESS"
    CLUTCH_VICTORY = "CLUTCH_VICTORY"
    ROUND_WON = "ROUND_WON"
    MATCH_POINT = "MATCH_POINT"
    TACTICAL_TIMEOUT = "TACTICAL_TIMEOUT"

class ValorantInflectionEvent(BaseModel):
    inflection_type: ValorantInflectionType
    description: str
    impact_score: float = Field(0.0, ge=0.0)
    favored_team: str = "BLUE"
    round_win_prob_blue: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ValorantTacticalWinProbability:
    """
    Calibrated tactical win probability model for VALORANT 5v5 competitive play.
    Computes both instantaneous round-level win probability and macro match win probability.
    """
    def __init__(
        self,
        beta_man_diff: float = 0.62,
        beta_spike_plant: float = -0.95,  # Shifts log-odds toward Red (Attackers)
        beta_match_score: float = 0.38
    ):
        self.b_diff = beta_man_diff
        self.b_spike = beta_spike_plant
        self.b_score = beta_match_score

    def predict(self, state: ValorantHUDState, momentum: float = 0.0) -> Tuple[float, float, float, float]:
        """
        Returns:
            (p_blue_round, p_red_round, p_blue_match, p_red_match)
        """
        # Edge cases: Team completely eliminated
        if state.alive_blue == 0 and state.alive_red > 0:
            return 0.01, 0.99, self._calc_match_prob(state.blue_score, state.red_score, 0.01), 1.0 - self._calc_match_prob(state.blue_score, state.red_score, 0.01)
        if state.alive_red == 0 and state.alive_blue > 0:
            if state.spike_planted:
                # Spike is planted, Blue must defuse
                p_blue = 0.88
            else:
                p_blue = 0.99
            p_red = 1.0 - p_blue
            p_match = self._calc_match_prob(state.blue_score, state.red_score, p_blue)
            return p_blue, p_red, p_match, 1.0 - p_match

        # 1. Round-level Log-Odds
        alive_diff = state.alive_blue - state.alive_red
        z_round = self.b_diff * alive_diff
        
        if state.spike_planted:
            z_round += self.b_spike

        # Add small momentum bias
        z_round += 0.25 * momentum

        # Clamp and sigmoid
        z_clamped = max(-6.0, min(6.0, z_round))
        prob_blue_rnd = 1.0 / (1.0 + math.exp(-z_clamped))
        prob_blue_rnd = round(max(0.01, min(0.99, prob_blue_rnd)), 3)
        prob_red_rnd = round(1.0 - prob_blue_rnd, 3)

        # 2. Match-level win probability
        p_blue_match = self._calc_match_prob(state.blue_score, state.red_score, prob_blue_rnd)
        p_red_match = round(1.0 - p_blue_match, 3)

        return prob_blue_rnd, prob_red_rnd, p_blue_match, p_red_match

    def _calc_match_prob(self, blue_score: int, red_score: int, round_prob_blue: float) -> float:
        score_diff = blue_score - red_score
        z_match = (self.b_score * score_diff) + 0.45 * (round_prob_blue - 0.50) * 2.0
        z_clamped = max(-6.0, min(6.0, z_match))
        p = 1.0 / (1.0 + math.exp(-z_clamped))
        return round(max(0.01, min(0.99, p)), 3)


class ValorantInflectionTagger:
    """
    Evaluates state transitions between consecutive HUD frames to flag tactical turning points.
    """
    def evaluate_transition(
        self,
        prev_state: Optional[ValorantHUDState],
        curr_state: ValorantHUDState,
        p_blue_prev: float,
        p_blue_curr: float
    ) -> List[ValorantInflectionEvent]:
        events = []
        if prev_state is None:
            return events

        delta_p = abs(p_blue_curr - p_blue_prev)

        # 1. Opening Pick / First Blood
        if (prev_state.alive_blue == 5 and prev_state.alive_red == 5) and (curr_state.alive_blue + curr_state.alive_red == 9):
            favored = "BLUE" if curr_state.alive_blue == 5 else "RED"
            victim = "RED" if favored == "BLUE" else "BLUE"
            events.append(ValorantInflectionEvent(
                inflection_type=ValorantInflectionType.OPENING_PICK,
                description=f"Opening Pick: {favored} secured First Blood against {victim}, expanding round win odds to {int(p_blue_curr*100)}%.",
                impact_score=round(delta_p * 1.5, 3),
                favored_team=favored,
                round_win_prob_blue=p_blue_curr
            ))

        # 2. Spike Plant Event
        if not prev_state.spike_planted and curr_state.spike_planted:
            events.append(ValorantInflectionEvent(
                inflection_type=ValorantInflectionType.SPIKE_PLANTED,
                description=f"Spike Planted: Attackers armed the Spike! Defense on 45s retake timer.",
                impact_score=round(delta_p * 1.2, 3),
                favored_team="RED",
                round_win_prob_blue=p_blue_curr
            ))

        # 3. Clutch Situation Triggered (1vX)
        if not prev_state.is_clutch_scenario and curr_state.is_clutch_scenario:
            side = curr_state.clutch_player_side or "BLUE"
            opp_count = curr_state.alive_red if side == "BLUE" else curr_state.alive_blue
            events.append(ValorantInflectionEvent(
                inflection_type=ValorantInflectionType.CLUTCH_IN_PROGRESS,
                description=f"Clutch Scenario: 1v{opp_count} situation for {side}! High pressure tactical engagement.",
                impact_score=round(0.25 + delta_p, 3),
                favored_team=side,
                round_win_prob_blue=p_blue_curr
            ))

        # 4. Significant Man Advantage Swing
        if delta_p >= 0.20 and not events:
            favored = "BLUE" if p_blue_curr > p_blue_prev else "RED"
            events.append(ValorantInflectionEvent(
                inflection_type=ValorantInflectionType.MAN_ADVANTAGE_SWING,
                description=f"Man Advantage Surge: {favored} eliminated multiple opponents ({curr_state.alive_blue}v{curr_state.alive_red}).",
                impact_score=round(delta_p, 3),
                favored_team=favored,
                round_win_prob_blue=p_blue_curr
            ))

        return events
