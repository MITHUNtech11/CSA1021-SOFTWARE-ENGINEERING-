from typing import Optional
from shared.models.telemetry import TelemetryTick
from shared.models.change_point import ChangePointRecord
from shared.models.prediction import PredictionRecord
from services.prediction.app.model.win_probability import CalibratedWinProbabilityModel
from services.prediction.app.model.inflection_tagger import InflectionClassifier

class PredictionEngine:
    """
    Coordinates calibrated win-probability forecasting and turning-point classification.
    """
    def __init__(self):
        self.model = CalibratedWinProbabilityModel()
        self.classifier = InflectionClassifier()
        self.last_prob_blue: float = 0.50

    def predict(
        self,
        tick: TelemetryTick,
        momentum: float = 0.0,
        change_point: Optional[ChangePointRecord] = None
    ) -> PredictionRecord:
        prob_blue, prob_red = self.model.predict(tick=tick, momentum=momentum)
        
        category, tpis, is_inflection, explanation = self.classifier.evaluate(
            tick=tick,
            change_point=change_point,
            prev_prob=self.last_prob_blue,
            curr_prob=prob_blue
        )
        self.last_prob_blue = prob_blue

        return PredictionRecord(
            match_id=tick.match_id,
            tick_sequence=tick.sequence_id,
            game_time_seconds=tick.game_time_seconds,
            win_probability_blue=prob_blue,
            win_probability_red=prob_red,
            momentum_score=momentum,
            is_inflection_point=is_inflection,
            turning_point_impact_score=tpis,
            inflection_category=category,
            explanation=explanation
        )
