from typing import Tuple, Optional
from shared.models.telemetry import TelemetryTick
from shared.models.change_point import ChangePointRecord
from shared.models.prediction import InflectionCategory

class InflectionClassifier:
    """
    Classifies detected change-points into strategic inflection categories
    and evaluates the Turning Point Impact Score (TPIS).
    """
    def __init__(self, impact_threshold: float = 0.12):
        self.impact_threshold = impact_threshold

    def evaluate(
        self,
        tick: TelemetryTick,
        change_point: Optional[ChangePointRecord],
        prev_prob: float,
        curr_prob: float
    ) -> Tuple[Optional[InflectionCategory], float, bool, str]:
        prob_delta = curr_prob - prev_prob
        abs_delta = abs(prob_delta)
        
        # Calculate Turning Point Impact Score
        cp_boost = (change_point.confidence if change_point else 0.5)
        tpis = round(abs_delta * (1.0 + cp_boost), 3)

        is_inflection = bool(tpis >= self.impact_threshold or change_point is not None)

        if not is_inflection:
            return InflectionCategory.STEADY_STATE, tpis, False, "Game progressing under steady baseline."

        # Classification logic
        time_str = f"{int(tick.game_time_seconds // 60)}:{int(tick.game_time_seconds % 60):02d}"

        # 1. Decisive Comeback (win prob swung across 0.50 boundary by >= 0.15)
        if (prev_prob < 0.45 and curr_prob >= 0.55) or (prev_prob > 0.55 and curr_prob <= 0.45):
            winning_team = tick.blue_team.team_name if curr_prob > 0.50 else tick.red_team.team_name
            return (
                InflectionCategory.DECISIVE_COMEBACK,
                tpis,
                True,
                f"[{time_str}] Decisive Comeback: {winning_team} inverted the match trajectory with win probability surging by {int(abs_delta*100)}%."
            )

        # 2. Objective Steal / Swing (Baron or Dragon differential shift)
        if tick.baron_diff != 0:
            favored = tick.blue_team.team_name if tick.baron_diff > 0 else tick.red_team.team_name
            return (
                InflectionCategory.OBJECTIVE_STEAL_SWING,
                tpis,
                True,
                f"[{time_str}] Baron Objective Swing: {favored} secured Baron Nashor, expanding win odds to {int(curr_prob*100)}%."
            )

        # 3. Snowball Acceleration
        if curr_prob > 0.65 and prob_delta > 0.08:
            return (
                InflectionCategory.SNOWBALL_ACCELERATION,
                tpis,
                True,
                f"[{time_str}] Snowball Acceleration: {tick.blue_team.team_name} widened their gold/structure lead to {tick.gold_diff:,}g."
            )
        elif curr_prob < 0.35 and prob_delta < -0.08:
            return (
                InflectionCategory.SNOWBALL_ACCELERATION,
                tpis,
                True,
                f"[{time_str}] Snowball Acceleration: {tick.red_team.team_name} expanded their lead over {tick.blue_team.team_name}."
            )

        # 4. Stalemate Break
        if abs(prev_prob - 0.50) < 0.08 and abs_delta >= 0.12:
            leading = tick.blue_team.team_name if curr_prob > 0.50 else tick.red_team.team_name
            return (
                InflectionCategory.STALEMATE_BREAK,
                tpis,
                True,
                f"[{time_str}] Stalemate Break: Even-game equilibrium broken by {leading} with win probability rising to {int(curr_prob*100)}%."
            )

        return (
            InflectionCategory.STEADY_STATE,
            tpis,
            True,
            f"[{time_str}] Tactical momentum shift detected (TPIS: {tpis})."
        )
