import math
from typing import Optional
from shared.models.telemetry import TelemetryTick

class CompositeMomentumCalculator:
    """
    Computes real-time Composite Momentum Vector in [-1.0, +1.0]
    uniting financial velocity, kill tempo, and objective control shifts.
    Positive values indicate Blue momentum; negative values indicate Red momentum.
    """
    def __init__(self, w_gold: float = 0.45, w_kills: float = 0.30, w_objectives: float = 0.25):
        self.w_g = w_gold
        self.w_k = w_kills
        self.w_o = w_objectives

    def compute(self, current_tick: TelemetryTick, previous_tick: Optional[TelemetryTick] = None) -> float:
        if previous_tick is None:
            # First tick, rely on absolute differentials
            g_term = math.tanh(current_tick.gold_diff / 5000.0)
            k_term = math.tanh(current_tick.kill_diff / 8.0)
            o_term = math.tanh((current_tick.turret_diff * 0.3) + (current_tick.dragon_diff * 0.4) + (current_tick.baron_diff * 0.8))
        else:
            # Velocity derivatives
            delta_gold = current_tick.gold_diff - previous_tick.gold_diff
            delta_kills = current_tick.kill_diff - previous_tick.kill_diff
            delta_turrets = current_tick.turret_diff - previous_tick.turret_diff
            delta_barons = current_tick.baron_diff - previous_tick.baron_diff
            
            g_term = math.tanh(delta_gold / 800.0)
            k_term = math.tanh(delta_kills / 2.0)
            o_term = math.tanh((delta_turrets * 0.4) + (delta_barons * 0.8))

        momentum = (self.w_g * g_term) + (self.w_k * k_term) + (self.w_o * o_term)
        return round(float(min(1.0, max(-1.0, momentum))), 3)
