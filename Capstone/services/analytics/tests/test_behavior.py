import pytest
from services.analytics.app.behavior.aggression import TacticalAggressionCalculator
from services.analytics.app.behavior.momentum import CompositeMomentumCalculator
from shared.models.telemetry import TelemetryTick, TeamState

@pytest.fixture
def sample_tick_series():
    t0 = TelemetryTick(
        match_id="M1", sequence_id=0, game_time_seconds=0.0,
        blue_team=TeamState(team_name="B", total_gold=2500, total_kills=0, total_deaths=0),
        red_team=TeamState(team_name="R", total_gold=2500, total_kills=0, total_deaths=0)
    )
    t1 = TelemetryTick(
        match_id="M1", sequence_id=1, game_time_seconds=60.0,
        blue_team=TeamState(team_name="B", total_gold=4000, total_kills=3, total_deaths=0, turrets_destroyed=1, barons=0),
        red_team=TeamState(team_name="R", total_gold=3000, total_kills=0, total_deaths=3, turrets_destroyed=0, barons=0)
    )
    return [t0, t1]

def test_aggression_calculator(sample_tick_series):
    calc = TacticalAggressionCalculator()
    score_blue = calc.compute(sample_tick_series[1].blue_team)
    score_red = calc.compute(sample_tick_series[1].red_team)
    # Blue team has 3 kills, 0 deaths -> higher aggression score
    assert score_blue > score_red
    assert 0.0 <= score_blue <= 1.0

def test_momentum_calculator_bounds(sample_tick_series):
    calc = CompositeMomentumCalculator()
    m = calc.compute(current_tick=sample_tick_series[1], previous_tick=sample_tick_series[0])
    # Blue team is surging ahead in gold (+1000 delta), kills (+3), turrets (+1)
    assert m > 0.0
    assert -1.0 <= m <= 1.0
