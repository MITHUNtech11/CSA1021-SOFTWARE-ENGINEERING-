import math
from typing import Tuple
from shared.models.telemetry import TelemetryTick

class CalibratedWinProbabilityModel:
    """
    Calibrated dynamic logistic win probability model conditioned on match telemetry,
    objective control differentials, and real-time behavioral momentum vectors.
    """
    def __init__(
        self,
        beta_gold: float = 0.00065,
        beta_kills: float = 0.14,
        beta_turrets: float = 0.38,
        beta_dragons: float = 0.22,
        beta_barons: float = 0.85,
        lambda_momentum: float = 0.45
    ):
        self.b_g = beta_gold
        self.b_k = beta_kills
        self.b_t = beta_turrets
        self.b_d = beta_dragons
        self.b_b = beta_barons
        self.lam_m = lambda_momentum

    def predict(self, tick: TelemetryTick, momentum: float = 0.0) -> Tuple[float, float]:
        # Linear log-odds predictor z(t)
        z = (
            (self.b_g * tick.gold_diff) +
            (self.b_k * tick.kill_diff) +
            (self.b_t * tick.turret_diff) +
            (self.b_d * tick.dragon_diff) +
            (self.b_b * tick.baron_diff) +
            (self.lam_m * momentum)
        )

        # Early game relative impact adjustment: a 2k lead at min 5 is ~30% lead vs 4% at min 40
        time_mins = max(1.0, tick.game_time_seconds / 60.0)
        if time_mins < 15.0:
            scale_factor = 1.0 + (15.0 - time_mins) * 0.03
            z = z * scale_factor

        # Bounded sigmoid evaluation
        z_clamped = max(-8.0, min(8.0, z))
        prob_blue = 1.0 / (1.0 + math.exp(-z_clamped))
        
        # Clamp strictly in [0.01, 0.99]
        prob_blue = max(0.01, min(0.99, prob_blue))
        prob_red = 1.0 - prob_blue
        
        return round(float(prob_blue), 3), round(float(prob_red), 3)
