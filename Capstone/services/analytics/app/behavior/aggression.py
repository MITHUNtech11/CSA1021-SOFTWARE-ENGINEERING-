from shared.models.telemetry import TeamState

class TacticalAggressionCalculator:
    """
    Computes a normalized Tactical Aggression Index (TAI) in [0.0, 1.0]
    based on combat activity, turret pressure, and objective contest risk.
    """
    def __init__(self, kill_weight: float = 0.5, turret_weight: float = 0.3, dragon_weight: float = 0.2):
        self.w_k = kill_weight
        self.w_t = turret_weight
        self.w_d = dragon_weight

    def compute(self, team: TeamState) -> float:
        # Base activity components
        k = team.total_kills
        d = max(1, team.total_deaths)
        kd_ratio = k / d
        
        # Aggression component based on kills & objectives vs deaths
        combat_factor = min(1.0, (team.total_kills * 0.05) + (kd_ratio * 0.15))
        objective_factor = min(1.0, (team.turrets_destroyed * 0.08) + (team.dragons * 0.10) + (team.barons * 0.25))
        
        raw_score = 0.6 * combat_factor + 0.4 * objective_factor
        return round(float(min(1.0, max(0.0, raw_score))), 3)
