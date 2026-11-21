import numpy as np
from typing import List, Optional, Tuple, Dict
from shared.models.telemetry import TelemetryTick
from shared.models.change_point import ChangePointRecord, ChangePointType
from services.analytics.app.algorithms.cusum import TwoSidedCUSUM
from services.analytics.app.algorithms.pelt import PELTDetector
from services.analytics.app.algorithms.bocpd import BayesianOnlineCPD
from services.analytics.app.behavior.aggression import TacticalAggressionCalculator
from services.analytics.app.behavior.momentum import CompositeMomentumCalculator

class AnalyticsEngine:
    """
    Unified coordinator combining CUSUM, PELT, BOCPD, Aggression, and Momentum analytics.
    """
    def __init__(self, match_id: str = "MATCH-DEFAULT"):
        self.match_id = match_id
        self.cusum = TwoSidedCUSUM(metric_name="gold_diff", allowance_k=0.5, threshold_h=3.5, match_id=match_id)
        self.pelt = PELTDetector(penalty=12.0, min_size=3)
        self.bocpd = BayesianOnlineCPD(hazard_rate=40.0)
        self.aggression_calc = TacticalAggressionCalculator()
        self.momentum_calc = CompositeMomentumCalculator()
        
        self.tick_history: List[TelemetryTick] = []
        self.change_points: List[ChangePointRecord] = []
        self.gold_diff_series: List[float] = []

    def process_tick(self, tick: TelemetryTick) -> Tuple[Optional[ChangePointRecord], float, Dict[str, float]]:
        prev_tick = self.tick_history[-1] if self.tick_history else None
        self.tick_history.append(tick)
        self.gold_diff_series.append(float(tick.gold_diff))

        # 1. Compute momentum & aggression
        momentum = self.momentum_calc.compute(current_tick=tick, previous_tick=prev_tick)
        agg_blue = self.aggression_calc.compute(tick.blue_team)
        agg_red = self.aggression_calc.compute(tick.red_team)

        behavior_metrics = {
            "momentum": momentum,
            "aggression_blue": agg_blue,
            "aggression_red": agg_red,
            "gold_diff": float(tick.gold_diff),
            "kill_diff": float(tick.kill_diff)
        }

        # 2. Sequential Change-Point Detection (CUSUM)
        # Using gold velocity delta
        diff_val = float(tick.gold_diff)
        if prev_tick:
            velocity = (diff_val - prev_tick.gold_diff) / 500.0
        else:
            velocity = diff_val / 2000.0

        cp = self.cusum.update(
            seq=tick.sequence_id,
            game_time_seconds=tick.game_time_seconds,
            value=velocity
        )

        # 3. Check BOCPD
        is_bocpd_cp, bocpd_prob = self.bocpd.update(velocity)
        if not cp and is_bocpd_cp and bocpd_prob > 0.45:
            cp = ChangePointRecord(
                match_id=self.match_id,
                tick_sequence=tick.sequence_id,
                game_time_seconds=tick.game_time_seconds,
                algorithm="BOCPD",
                change_type=ChangePointType.BOCPD_BEHAVIOR_RESET,
                metric_name="velocity",
                score=round(bocpd_prob, 3),
                confidence=round(bocpd_prob, 3),
                details={"prob": bocpd_prob}
            )

        if cp:
            self.change_points.append(cp)

        return cp, momentum, behavior_metrics

    def run_pelt_segmentation(self) -> List[int]:
        if len(self.gold_diff_series) < 6:
            return []
        arr = np.array(self.gold_diff_series)
        return self.pelt.segment(arr)
